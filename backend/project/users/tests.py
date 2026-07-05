import os
import sqlite3
import tempfile

from django.test import SimpleTestCase, TestCase
from django.urls import reverse

from .models import Applicant, Application
from .serializers import ApplicantFullSerializer
from .utils import (
    build_database_backup_command,
    build_database_restore_command,
    detect_backup_format,
    import_sqlite_backup_to_postgres,
    create_database_backup,
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
