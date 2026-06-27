from .models import AuditLog, User
import os
import sqlite3
from django.db import transaction
from django.db import models as db_models
from django.contrib.auth.hashers import make_password


def build_database_backup_command(backup_path, db_settings):
    """Build a PostgreSQL backup command for the configured database."""
    if db_settings.get('ENGINE', '').endswith('postgresql'):
        cmd = ['pg_dump', '--dbname=postgresql://{user}:{password}@{host}:{port}/{name}'.format(
            user=db_settings.get('USER', ''),
            password=db_settings.get('PASSWORD', ''),
            host=db_settings.get('HOST', 'localhost'),
            port=db_settings.get('PORT', '5432'),
            name=db_settings.get('NAME', ''),
        )]
        if db_settings.get('HOST'):
            cmd.append('-f')
            cmd.append(backup_path)
        else:
            cmd.append('-f')
            cmd.append(backup_path)
        return cmd
    return []


def build_database_restore_command(backup_path, db_settings):
    """Build a PostgreSQL restore command for the configured database."""
    if db_settings.get('ENGINE', '').endswith('postgresql'):
        return [
            'psql',
            '--dbname=postgresql://{user}:{password}@{host}:{port}/{name}'.format(
                user=db_settings.get('USER', ''),
                password=db_settings.get('PASSWORD', ''),
                host=db_settings.get('HOST', 'localhost'),
                port=db_settings.get('PORT', '5432'),
                name=db_settings.get('NAME', ''),
            ),
            '-f',
            backup_path,
        ]
    return []


def detect_backup_format(file_name):
    """Detect whether the uploaded backup is a SQLite or PostgreSQL dump."""
    name = (file_name or '').lower()
    if name.endswith(('.sqlite3', '.sqlite', '.db')):
        return 'sqlite'
    if name.endswith(('.sql', '.dump', '.backup')):
        return 'postgresql'
    return None


def import_sqlite_backup_to_postgres(sqlite_path, model_classes):
    """Import data from a SQLite database file into the current PostgreSQL database."""
    with sqlite3.connect(sqlite_path) as sqlite_conn:
        sqlite_conn.row_factory = sqlite3.Row

        with transaction.atomic():
            for model_class in model_classes:
                table_name = model_class._meta.db_table
                table_exists_query = sqlite_conn.execute(
                    "SELECT name FROM sqlite_master WHERE type='table' AND name=?",
                    (table_name,)
                ).fetchone()
                if not table_exists_query:
                    continue

                model_class.objects.all().delete()

                rows = sqlite_conn.execute(f'SELECT * FROM "{table_name}"').fetchall()
                if not rows:
                    continue

                for row in rows:
                    instance = model_class()
                    for field in model_class._meta.fields:
                        column_name = field.column
                        
                        if column_name == 'id':
                            continue
                            
                        if column_name not in row.keys():
                            value = None
                        else:
                            value = row[column_name]
                            if isinstance(value, str):
                                value = value.strip()
                        
                        # Handle empty strings for unique fields (like email) to prevent constraint errors in Postgres
                        if (value == '' or value is None) and getattr(field, 'unique', False) and isinstance(field, (db_models.CharField, db_models.EmailField)):
                            row_id = row['id'] if 'id' in row.keys() else 'unknown'
                            if isinstance(field, db_models.EmailField):
                                value = f"empty_{row_id}_{column_name}@example.com"
                            else:
                                value = f"empty_{row_id}_{column_name}"
                                
                        if value is None:
                            continue

                        if isinstance(field, db_models.ForeignKey):
                            related_model = field.remote_field.model
                            related_instance = related_model.objects.filter(pk=value).first()
                            if related_instance is None:
                                related_instance = related_model(pk=value)
                                related_instance.save()
                            setattr(instance, field.name, related_instance)
                        elif field.name in {'created_at', 'updated_at'} and isinstance(value, str):
                            try:
                                setattr(instance, field.name, field.to_python(value))
                            except Exception:
                                setattr(instance, field.name, None)
                        elif field.name == 'created_at' and isinstance(value, str):
                            try:
                                setattr(instance, field.name, field.to_python(value))
                            except Exception:
                                setattr(instance, field.name, None)
                        else:
                            setattr(instance, field.name, field.to_python(value))

                    if 'id' in row.keys():
                        instance.id = row['id']

                    # Capture original dates that Django's auto_now / auto_now_add will overwrite on save
                    auto_date_values = {}
                    for field in model_class._meta.fields:
                        if getattr(field, 'auto_now', False) or getattr(field, 'auto_now_add', False):
                            if hasattr(instance, field.name) and getattr(instance, field.name) is not None:
                                auto_date_values[field.name] = getattr(instance, field.name)

                    if hasattr(instance, 'email') and getattr(instance, 'email', None) == '':
                        raise ValueError(f"Email is empty before save! Instance dict: {instance.__dict__}")

                    try:
                        instance.save(force_insert=True)
                    except Exception:
                        instance.save()

                    # Bypassing the save() method to apply the original auto dates via UPDATE
                    if auto_date_values:
                        model_class.objects.filter(pk=instance.pk).update(**auto_date_values)


def get_user_from_request(request):
    """
    Extracts the username from the JWT token in the headers.
    Checks 'Authorization', 'X-User-Token', and META fallback.
    Returns 'Unknown' if no user found.
    """
    token = None
    if hasattr(request, 'headers'):
        token = request.headers.get('X-User-Token') or request.headers.get('Authorization')
        if token and token.startswith('Bearer '):
            token = token.split(' ')[1]
    
    if not token:
        token = request.META.get('HTTP_X_USER_TOKEN')
        if not token:
            auth_header = request.META.get('HTTP_AUTHORIZATION')
            if auth_header and auth_header.startswith('Bearer '):
                token = auth_header.split(' ')[1]

    if token:
        try:
            import jwt
            from django.conf import settings
            payload = jwt.decode(token, settings.SECRET_KEY, algorithms=["HS256"])
            username = payload.get('username', 'Unknown')
            print(f"[AUDIT] Extracted user from token: {username}")  # Debug log
            return username
        except Exception as e:
            print(f"[AUDIT] Error decoding token: {str(e)}")  # Debug log
            return 'Unknown'
    print("[AUDIT] No token found in request")  # Debug log
    return 'Unknown'

def create_audit_log(performer, action, details, performer_name=None):
    """
    Standardizes log creation across the application.
    - performer: User object, or None
    - action: Short description (e.g., 'LOGIN', 'USER_REGISTRATION', 'STATUS_UPDATE')
    - details: Detailed description of what happened
    - performer_name: String fallback if performer is None
    
    Returns the created AuditLog object or None if creation failed.
    """
    try:
        if isinstance(performer, User) and performer.username:
            log = AuditLog.objects.create(
                performer=performer,
                action=action,
                details=details
            )
            print(f"[AUDIT] Created log: {performer.username} - {action}")
            return log
        
        # Fallback: use performer_name or 'System'
        user_str = str(performer) if performer else (performer_name or 'System')
        log = AuditLog.objects.create(
            performer_name=user_str,
            action=action,
            details=details
        )
        print(f"[AUDIT] Created log: {user_str} - {action}")
        return log
    except Exception as e:
        print(f"[AUDIT] Error creating audit log: {str(e)}")
        return None
