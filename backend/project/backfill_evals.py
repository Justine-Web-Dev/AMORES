import os
import django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'project.settings')
django.setup()

from users.models import Application, EvaluationBMI, EvaluationPAT

# Fix BMI
bmi_apps = Application.objects.filter(status='Body Mass Index')
bmi_created = 0
for app in bmi_apps:
    _, created = EvaluationBMI.objects.get_or_create(application=app)
    if created:
        bmi_created += 1

# Fix PAT
pat_apps = Application.objects.filter(status='Physical Agility Test')
pat_created = 0
for app in pat_apps:
    _, created = EvaluationPAT.objects.get_or_create(application=app)
    if created:
        pat_created += 1

print(f"Successfully created {bmi_created} missing EvaluationBMI records.")
print(f"Successfully created {pat_created} missing EvaluationPAT records.")
