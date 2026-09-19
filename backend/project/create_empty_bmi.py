import os
import django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'project.settings')
django.setup()

from users.models import Application, EvaluationBMI

# Find all applications currently in 'Body Mass Index' status
bmi_apps = Application.objects.filter(status='Body Mass Index')
created_count = 0

for app in bmi_apps:
    bmi, created = EvaluationBMI.objects.get_or_create(application=app)
    if created:
        created_count += 1

print(f"Created {created_count} empty EvaluationBMI records for applicants in the BMI tab.")
