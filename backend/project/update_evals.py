import os
import django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'project.settings')
django.setup()

from users.models import Evaluation

evals = Evaluation.objects.all()
count_bmi = 0
count_pat = 0
for e in evals:
    updated = False
    if hasattr(e.application, 'evaluation_bmi') and e.application.evaluation_bmi.weight is not None:
        e.is_bmi_evaluated = True
        count_bmi += 1
        updated = True
    if hasattr(e.application, 'evaluation_pat') and getattr(e.application.evaluation_pat, 'pushups', None) is not None:
        e.is_pat_evaluated = True
        count_pat += 1
        updated = True
    if updated:
        e.save()
        
print(f"Updated {count_bmi} BMI evaluations and {count_pat} PAT evaluations.")
