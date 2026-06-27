import os
import sqlite3
import tempfile

from django.test import SimpleTestCase, TestCase

from .models import Applicant, Application
from .utils import build_database_backup_command, build_database_restore_command, detect_backup_format, import_sqlite_backup_to_postgres


class DatabaseBackupRestoreCommandTests(SimpleTestCase):
    def test_detects_sqlite_backup(self):
        self.assertEqual(detect_backup_format('backup.sqlite3'), 'sqlite')

    def test_detects_postgresql_backup(self):
        self.assertEqual(detect_backup_format('backup.sql'), 'postgresql')

    def test_builds_postgres_backup_command(self):
        db_settings = {
            'ENGINE': 'django.db.backends.postgresql',
            'NAME': 'amores',
            'USER': 'postgres',
            'PASSWORD': 'secret',
            'HOST': 'localhost',
            'PORT': '5432',
        }

        command = build_database_backup_command('/tmp/amores.sql', db_settings)

        self.assertEqual(command[0], 'pg_dump')
        self.assertTrue(any('amores' in item for item in command))
        self.assertEqual(command[-1], '/tmp/amores.sql')

    def test_builds_postgres_restore_command(self):
        db_settings = {
            'ENGINE': 'django.db.backends.postgresql',
            'NAME': 'amores',
            'USER': 'postgres',
            'PASSWORD': 'secret',
            'HOST': 'localhost',
            'PORT': '5432',
        }

        command = build_database_restore_command('/tmp/amores.sql', db_settings)

        self.assertEqual(command[0], 'psql')
        self.assertTrue(any('amores' in item for item in command))
        self.assertEqual(command[-1], '/tmp/amores.sql')


class SqliteImportTests(TestCase):
    def test_imports_application_foreign_key_using_related_instance(self):
        with tempfile.NamedTemporaryFile(suffix='.sqlite3', delete=False) as tmp_file:
            temp_path = tmp_file.name

        try:
            conn = sqlite3.connect(temp_path)
            cursor = conn.cursor()
            cursor.execute('CREATE TABLE users_applicant (id INTEGER PRIMARY KEY, first_name TEXT, last_name TEXT, email TEXT, contact_number TEXT, program TEXT, date_graduated TEXT, name_of_school TEXT, pag_ibig_number TEXT, phil_health_id_num TEXT, height TEXT)')
            cursor.execute('CREATE TABLE users_application (id INTEGER PRIMARY KEY, applicant_id INTEGER, tracking_code TEXT, status TEXT, created_at TEXT, updated_at TEXT)')
            cursor.execute('INSERT INTO users_applicant (id, first_name, last_name, email, contact_number, program, date_graduated, name_of_school, pag_ibig_number, phil_health_id_num, height) VALUES (1, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)', ('Ana', 'Rivera', 'ana@example.com', '09170000001', 'BSIT', '2024-01-01', 'School', '123', '456', '170'))
            cursor.execute('INSERT INTO users_application (id, applicant_id, tracking_code, status, created_at, updated_at) VALUES (1, 1, ?, ?, ?, ?)', ('TA-12345678', 'New Applicant', '2024-01-02 00:00:00', '2024-01-02 00:00:00'))
            conn.commit()
            conn.close()

            import_sqlite_backup_to_postgres(temp_path, [Applicant, Application])

            application = Application.objects.get(pk=1)
            self.assertEqual(application.applicant_id, 1)
            self.assertIsInstance(application.applicant, Applicant)
            self.assertEqual(application.applicant.first_name, 'Ana')
        finally:
            if os.path.exists(temp_path):
                try:
                    os.remove(temp_path)
                except PermissionError:
                    pass
