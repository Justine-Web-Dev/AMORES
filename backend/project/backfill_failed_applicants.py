import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'project.settings')
django.setup()

from users.models import Application, FailedApplicant

def backfill_failed():
    failed_apps = Application.objects.filter(status='Failed')
    created_count = 0
    
    for app in failed_apps:
        # Check if record already exists to avoid duplicates
        if not hasattr(app, 'failed_record'):
            FailedApplicant.objects.create(
                application=app,
                failed_stage='Unknown (Backfilled)',
                reason=app.rejection_reason or 'No reason provided.'
            )
            created_count += 1
            
    print(f"Successfully backfilled {created_count} failed applicants into the FailedApplicant table.")

if __name__ == '__main__':
    backfill_failed()
