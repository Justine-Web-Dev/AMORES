from .models import AuditLog, User
import os
import sqlite3
from django.db import transaction
from django.db import models as db_models


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
                        if column_name not in row.keys() or column_name == 'id':
                            continue

                        value = row[column_name]
                        if value is None:
                            continue

                        if isinstance(field, db_models.ForeignKey):
                            related_model = field.remote_field.model
                            related_instance = related_model.objects.filter(pk=value).first()
                            if related_instance is None:
                                related_instance = related_model(pk=value)
                                related_instance.save()
                            setattr(instance, field.name, related_instance)
                        else:
                            setattr(instance, field.name, field.to_python(value))

                    if 'id' in row.keys():
                        instance.id = row['id']

                    instance.save()


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
