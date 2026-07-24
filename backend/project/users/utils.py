from .models import AuditLog, User
import datetime
import os
import shutil
import sqlite3
import subprocess
import tempfile
from django.core.management import call_command
from django.db import connections, transaction
from django.db import models as db_models
from django.contrib.auth.hashers import make_password

BACKUP_APP_LABEL = 'users'
RESTORE_DELETE_ORDER = [
    'AuditLog',
    'ApplicantDocument',
    'Evaluation',
    'Application',
    'Applicant',
    'SystemSettings',
    'User',
]
RESTORE_IMPORT_MODELS = [
    'User',
    'Applicant',
    'Application',
    'Evaluation',
    'ApplicantDocument',
    'SystemSettings',
    'AuditLog',
]


def _postgres_connection_uri(db_settings):
    return 'postgresql://{user}:{password}@{host}:{port}/{name}'.format(
        user=db_settings.get('USER', ''),
        password=db_settings.get('PASSWORD', ''),
        host=db_settings.get('HOST') or 'localhost',
        port=db_settings.get('PORT') or '5432',
        name=db_settings.get('NAME', ''),
    )


def find_pg_binary(binary_name):
    """Locate pg_dump or psql on PATH or in common PostgreSQL install directories."""
    path = shutil.which(binary_name)
    if path:
        return path

    if os.name == 'nt':
        search_roots = [
            os.environ.get('ProgramFiles', r'C:\Program Files'),
            os.environ.get('ProgramFiles(x86)', r'C:\Program Files (x86)'),
        ]
        for root in search_roots:
            pg_root = os.path.join(root, 'PostgreSQL')
            if not os.path.isdir(pg_root):
                continue
            for version_dir in os.listdir(pg_root):
                candidate = os.path.join(pg_root, version_dir, 'bin', f'{binary_name}.exe')
                if os.path.isfile(candidate):
                    return candidate
    return None


def build_database_backup_command(backup_path, db_settings, pg_dump='pg_dump'):
    """Build a PostgreSQL backup command for the configured database."""
    if db_settings.get('ENGINE', '').endswith('postgresql'):
        return [
            pg_dump,
            f'--dbname={_postgres_connection_uri(db_settings)}',
            '-f',
            backup_path,
        ]
    return []


def build_database_restore_command(backup_path, db_settings, psql='psql'):
    """Build a PostgreSQL restore command for the configured database."""
    if db_settings.get('ENGINE', '').endswith('postgresql'):
        return [
            psql,
            f'--dbname={_postgres_connection_uri(db_settings)}',
            '-f',
            backup_path,
        ]
    return []


def detect_backup_format(file_name):
    """Detect whether the uploaded backup is SQLite, PostgreSQL, or Django JSON."""
    name = (file_name or '').lower()
    if name.endswith(('.sqlite3', '.sqlite', '.db')):
        return 'sqlite'
    if name.endswith(('.sql', '.dump', '.backup')):
        return 'postgresql'
    if name.endswith('.json'):
        return 'json'
    return None


def create_database_backup(db_settings):
    """Create a database backup file and return (backup_path, content_type)."""
    timestamp = datetime.datetime.now().strftime('%Y%m%d_%H%M%S')
    backup_dir = tempfile.gettempdir()
    engine = db_settings.get('ENGINE', '')

    if engine.endswith('sqlite3'):
        from django.conf import settings

        db_path = db_settings.get('NAME')
        if not os.path.isabs(db_path):
            db_path = str(settings.BASE_DIR / db_path)
        backup_path = os.path.join(backup_dir, f'amores_backup_{timestamp}.sqlite3')
        shutil.copy2(db_path, backup_path)
        return backup_path, 'application/x-sqlite3'

    if engine.endswith('postgresql'):
        pg_dump = find_pg_binary('pg_dump')
        if pg_dump:
            backup_path = os.path.join(backup_dir, f'amores_backup_{timestamp}.sql')
            command = build_database_backup_command(backup_path, db_settings, pg_dump=pg_dump)
            try:
                result = subprocess.run(command, check=True, capture_output=True, text=True)
                if result.stderr:
                    print(f"[BACKUP] pg_dump stderr: {result.stderr}")
                return backup_path, 'application/sql'
            except (FileNotFoundError, subprocess.CalledProcessError) as exc:
                print(f"[BACKUP] pg_dump failed, falling back to dumpdata: {exc}")

        backup_path = os.path.join(backup_dir, f'amores_backup_{timestamp}.json')
        with open(backup_path, 'w', encoding='utf-8') as backup_file:
            call_command('dumpdata', BACKUP_APP_LABEL, indent=2, stdout=backup_file)
        return backup_path, 'application/json'

    raise ValueError('Unsupported database engine.')


def _prepare_postgresql_restore_script(backup_path):
    """Create a SQL script that truncates existing tables before applying a PostgreSQL dump."""
    with open(backup_path, 'r', encoding='utf-8') as source_file:
        backup_sql = source_file.read()

    temp_dir = tempfile.gettempdir()
    fd, restore_script_path = tempfile.mkstemp(prefix='amores_restore_', suffix='.sql', dir=temp_dir)
    os.close(fd)

    truncate_tables = [
        'users_auditlog',
        'users_evaluation',
        'users_applicantdocument',
        'users_application',
        'users_applicant',
        'users_user',
        'users_systemsettings',
        'django_admin_log',
        'django_session',
        'django_migrations',
        'django_content_type',
        'auth_user_user_permissions',
        'auth_user_groups',
        'auth_group_permissions',
        'auth_user',
        'auth_permission',
        'auth_group',
    ]

    # Filter out problematic statements that cause permission errors
    lines = backup_sql.split('\n')
    filtered_lines = []
    for line in lines:
        stripped = line.strip()
        if stripped.startswith('ALTER DEFAULT PRIVILEGES'):
            continue
        if stripped.startswith('GRANT ') and 'ON SCHEMA public' in line:
            continue
        filtered_lines.append(line)
    filtered_sql = '\n'.join(filtered_lines)

    with open(restore_script_path, 'w', encoding='utf-8') as restore_file:
        restore_file.write("SET client_min_messages TO WARNING;\n")
        for table in truncate_tables:
            restore_file.write(f"DROP TABLE IF EXISTS \"{table}\" CASCADE;\n")
        restore_file.write(filtered_sql)

    return restore_script_path


def restore_database_backup(backup_path, backup_format, db_settings, model_classes):
    """Restore the database from a backup file."""
    engine = db_settings.get('ENGINE', '')

    if backup_format == 'json':
        if not engine.endswith('postgresql'):
            raise ValueError('JSON restore is only supported for PostgreSQL databases.')
        connections.close_all()
        with transaction.atomic():
            for model_name in RESTORE_DELETE_ORDER:
                model_classes[model_name].objects.all().delete()
            call_command('loaddata', backup_path, verbosity=0)
        return

    if backup_format == 'sqlite':
        if not engine.endswith('postgresql'):
            raise ValueError('SQLite restore is only supported when importing into PostgreSQL.')
        import_sqlite_backup_to_postgres(backup_path, [model_classes[name] for name in RESTORE_IMPORT_MODELS])
        return

    if backup_format == 'postgresql':
        if not engine.endswith('postgresql'):
            raise ValueError('PostgreSQL restore is only supported for PostgreSQL databases.')
        psql = find_pg_binary('psql')
        if not psql:
            raise FileNotFoundError(
                'psql was not found. Install PostgreSQL client tools or restore a .json backup instead.'
            )
        connections.close_all()
        restore_script_path = _prepare_postgresql_restore_script(backup_path)
        try:
            restore_command = [
                psql,
                '-v',
                'ON_ERROR_STOP=1',
                '-1',
                f'--dbname={_postgres_connection_uri(db_settings)}',
                '-f',
                restore_script_path,
            ]
            result = subprocess.run(restore_command, capture_output=True, text=True)
            if result.returncode != 0:
                error_msg = result.stderr if result.stderr else result.stdout
                print(f"[RESTORE] psql failed with exit code {result.returncode}: {error_msg}")
                raise subprocess.CalledProcessError(result.returncode, restore_command, output=error_msg)
            if result.stderr:
                print(f"[RESTORE] psql stderr: {result.stderr}")
        finally:
            if os.path.exists(restore_script_path):
                os.remove(restore_script_path)
        return

    raise ValueError('Invalid backup file.')


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
            email = payload.get('email', 'Unknown')
            print(f"[AUDIT] Extracted user from token: {email}")  # Debug log
            return email
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
        if isinstance(performer, User) and performer.name:
            log = AuditLog.objects.create(
                performer=performer,
                action=action,
                details=details
            )
            print(f"[AUDIT] Created log: {performer.name} - {action}")
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

def send_mail_async(subject, message, recipient_list, from_email=None, fail_silently=False, html_message=None):
    """
    Sends an email in a background thread to prevent blocking 
    the request-response cycle (crucial on Render.com).
    """
    import threading
    from django.core.mail import send_mail
    
    thread = threading.Thread(
        target=send_mail,
        kwargs={
            'subject': subject,
            'message': message,
            'from_email': from_email,
            'recipient_list': recipient_list,
            'fail_silently': fail_silently,
            'html_message': html_message,
        }
    )
    thread.daemon = True  # Allows main process to exit even if thread is running
    thread.start()

