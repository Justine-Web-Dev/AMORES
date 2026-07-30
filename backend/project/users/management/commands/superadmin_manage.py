from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model

User = get_user_model()

class Command(BaseCommand):
    help = 'Manage SUPER_ADMIN accounts. Operations: create, suspend, delete.'

    def add_arguments(self, parser):
        parser.add_argument('operation', type=str, choices=['create', 'suspend', 'delete'], help='The operation to perform')
        parser.add_argument('email', type=str, help='The email of the SUPER_ADMIN')
        parser.add_argument('--password', type=str, help='The password (required for create)', required=False)

    def handle(self, *args, **options):
        operation = options['operation']
        email = options['email']
        password = options.get('password')

        if operation == 'create':
            if not password:
                self.stderr.write(self.style.ERROR('Error: --password is required for creating a SUPER_ADMIN'))
                return
            
            if User.objects.filter(email=email).exists():
                self.stderr.write(self.style.ERROR(f'User with email {email} already exists.'))
                return
            
            try:
                user = User.objects.create_superuser(
                    email=email,
                    password=password,
                    name='Super Administrator'
                )
                self.stdout.write(self.style.SUCCESS(f'Successfully created SUPER_ADMIN: {email}'))
            except Exception as e:
                self.stderr.write(self.style.ERROR(f'Failed to create SUPER_ADMIN: {str(e)}'))

        elif operation == 'suspend':
            try:
                user = User.objects.get(email=email, role=User.Roles.SUPER_ADMIN)
                user.is_active = not user.is_active
                user.save()
                status = "activated" if user.is_active else "suspended"
                self.stdout.write(self.style.SUCCESS(f'Successfully {status} SUPER_ADMIN: {email}'))
            except User.DoesNotExist:
                self.stderr.write(self.style.ERROR(f'SUPER_ADMIN with email {email} does not exist.'))

        elif operation == 'delete':
            try:
                user = User.objects.get(email=email, role=User.Roles.SUPER_ADMIN)
                user.delete()
                self.stdout.write(self.style.SUCCESS(f'Successfully deleted SUPER_ADMIN: {email}'))
            except User.DoesNotExist:
                self.stderr.write(self.style.ERROR(f'SUPER_ADMIN with email {email} does not exist.'))
