import os
import sqlite3
import tempfile
from unittest.mock import patch

from django.test import SimpleTestCase, TestCase
from django.urls import reverse

from .models import Applicant, Application, GlobalSetting, User
from .serializers import ApplicantFullSerializer
from .utils import (
    build_database_backup_command,
    build_database_restore_command,
    detect_backup_format,
    import_sqlite_backup_to_postgres,
    create_database_backup,
    restore_database_backup,
)


class DatabaseBackupRestoreCommandTests(SimpleTestCase):
    def test_detects_sqlite_backup(self):
        self.assertEqual(detect_backup_format('backup.sqlite3'), 'sqlite')

    def test_detects_postgresql_backup(self):
        self.assertEqual(detect_backup_format('backup.sql'), 'postgresql')

    def test_detects_json_backup(self):
        self.assertEqual(detect_backup_format('backup.json'), 'json')

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
        self.assertTrue(command[1].startswith('--dbname=postgresql://'))

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


class DatabaseRestoreTests(SimpleTestCase):
    def test_postgresql_restore_truncates_existing_tables_before_import(self):
        db_settings = {
            'ENGINE': 'django.db.backends.postgresql',
            'NAME': 'amores',
            'USER': 'postgres',
            'PASSWORD': 'secret',
            'HOST': 'localhost',
            'PORT': '5432',
        }

        with tempfile.NamedTemporaryFile(suffix='.sql', delete=False) as tmp_file:
            tmp_file.write(b'INSERT INTO users_user (id, username) VALUES (1, \'admin\');\n')
            temp_path = tmp_file.name

        try:
            with patch('users.utils.find_pg_binary', return_value='psql'), \
                 patch('users.utils.subprocess.run') as mock_run, \
                 patch('users.utils.os.remove', side_effect=lambda path: None):
                mock_result = type('MockResult', (), {'returncode': 0, 'stderr': '', 'stdout': ''})()
                mock_run.return_value = mock_result
                restore_database_backup(temp_path, 'postgresql', db_settings, {})

            self.assertEqual(mock_run.call_count, 1)
            command = mock_run.call_args[0][0]
            self.assertEqual(command[0], 'psql')
            self.assertTrue(any(item.startswith('--dbname=') for item in command))
            restore_script_path = command[-1]
            self.assertNotEqual(restore_script_path, temp_path)
            with open(restore_script_path, 'r', encoding='utf-8') as restore_file:
                contents = restore_file.read()
            self.assertIn('SET client_min_messages TO WARNING;', contents)
            self.assertIn('DROP TABLE IF EXISTS', contents)
            self.assertIn('users_user', contents)
            self.assertIn('INSERT INTO users_user', contents)
        finally:
            if os.path.exists(temp_path):
                os.remove(temp_path)
            cleanup_path = locals().get('restore_script_path')
            if cleanup_path and os.path.exists(cleanup_path):
                os.remove(cleanup_path)


class ApplicantSerializationTests(TestCase):
    def test_serializes_applicant_without_age_database_column(self):
        applicant = Applicant.objects.create(
            first_name='Ana',
            last_name='Rivera',
            email='ana@example.com',
            contact_number='09170000001',
            program='BSIT',
            date_graduated='2024-01-01',
            name_of_school='School',
            pag_ibig_number='123',
            phil_health_id_num='456',
            height='170cm',
        )

        data = ApplicantFullSerializer(applicant).data

        self.assertEqual(data['firstname'], 'Ana')
        self.assertEqual(data['lastname'], 'Rivera')
        self.assertIn('id', data)
        self.assertIsNone(data['age'])


class ApplicantRegistrationTests(TestCase):
    def test_register_applicant_form_accepts_frontend_field_names(self):
        payload = {
            'firstname': 'Ana',
            'lastname': 'Rivera',
            'middle_name': 'L',
            'birthdate': '1998-02-01',
            'address': '123 Main Street',
            'gender': 'Female',
            'cp_number': '09170000001',
            'program': 'BSIT',
            'name_of_school': 'Sample School',
            'date_graduated': '2024-01-01',
            'email': 'ana@example.com',
            'latin_honor': 'Cum Laude',
            'pag_ibig_number': '123456789012',
            'phil_health_id_num': '210987654321',
            'height': '170cm',
            'tribe_affiliated': 'Ilonggo',
        }

        response = self.client.post(reverse('register_applicant_form'), payload, format='json')

        self.assertEqual(response.status_code, 201, response.data)
        applicant = Applicant.objects.get(email='ana@example.com')
        self.assertEqual(applicant.first_name, 'Ana')
        self.assertEqual(applicant.last_name, 'Rivera')
        self.assertEqual(applicant.contact_number, '09170000001')
        self.assertEqual(applicant.address, '123 Main Street')
        self.assertEqual(applicant.tribe, 'Ilonggo')


class AdministratorLoginTests(TestCase):
    def setUp(self):
        self.old_admin = User.objects.create_user(
            email='old-admin@example.com',
            password='password',
            name='Old Admin',
            role=User.Roles.ADMINISTRATOR,
        )
        self.new_admin = User.objects.create_user(
            email='new-admin@example.com',
            password='password',
            name='New Admin',
            role=User.Roles.ADMINISTRATOR,
        )

    def test_new_admin_login_deactivates_old_admin_and_invalidates_token(self):
        old_login = self.client.post(
            reverse('login_user'),
            {'email': self.old_admin.email, 'password': 'password'},
            format='json',
        )
        self.assertEqual(old_login.status_code, 200, old_login.data)

        new_login = self.client.post(
            reverse('login_user'),
            {'email': self.new_admin.email, 'password': 'password'},
            format='json',
        )
        self.assertEqual(new_login.status_code, 200, new_login.data)

        self.old_admin.refresh_from_db()
        self.new_admin.refresh_from_db()
        self.assertFalse(self.old_admin.is_active)
        self.assertTrue(self.old_admin.is_archived)
        self.assertTrue(self.new_admin.is_active)
        self.assertEqual(
            GlobalSetting.objects.get(key='ACTIVE_ADMIN_ID').value,
            self.new_admin.id,
        )

        inactive_users = self.client.get(
            reverse('get_user'),
            {'archived': 'true'},
            HTTP_AUTHORIZATION=f"Bearer {new_login.data['token']}",
        )
        self.assertEqual(inactive_users.status_code, 200, inactive_users.data)
        self.assertEqual(inactive_users.data[0]['id'], self.old_admin.id)
        self.assertFalse(inactive_users.data[0]['is_active'])

        old_response = self.client.get(
            reverse('get_user'),
            HTTP_AUTHORIZATION=f"Bearer {old_login.data['token']}",
        )
        self.assertEqual(old_response.status_code, 401)

        new_response = self.client.get(
            reverse('get_user'),
            HTTP_AUTHORIZATION=f"Bearer {new_login.data['token']}",
        )
        self.assertEqual(new_response.status_code, 200)

    def test_inactive_admin_cannot_log_in(self):
        self.old_admin.is_active = False
        self.old_admin.save(update_fields=['is_active'])

        response = self.client.post(
            reverse('login_user'),
            {'email': self.old_admin.email, 'password': 'password'},
            format='json',
        )

        self.assertEqual(response.status_code, 403)

    def test_authenticated_admin_can_change_password(self):
        login = self.client.post(
            reverse('login_user'),
            {'email': self.new_admin.email, 'password': 'password'},
            format='json',
        )
        self.assertEqual(login.status_code, 200, login.data)

        response = self.client.post(
            reverse('change_password'),
            {'current_password': 'password', 'new_password': 'NewPassword1!'},
            HTTP_X_USER_TOKEN=login.data['token'],
            format='json',
        )

        self.assertEqual(response.status_code, 200, response.data)
        self.new_admin.refresh_from_db()
        self.assertFalse(self.new_admin.must_change_password)


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
