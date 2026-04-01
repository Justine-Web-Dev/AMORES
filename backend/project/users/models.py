from django.db import models
from django.utils import timezone

# Create your models here.

def default_date():
    return timezone.now().date()

class User(models.Model):
  ROLE_CHOICES =  (
    ('Administrator', 'Administrator'),
    ('Recruiter', 'Recruiter'),
  )

  name = models.CharField(max_length=100,default="Unknown")
  username = models.CharField(max_length=100)
  password = models.CharField(max_length=50)
  role = models.CharField(max_length=20, choices=ROLE_CHOICES, default='Recruiter')

class Applicant_infos(models.Model):
  firstname = models.CharField(max_length=100)
  lastname = models.CharField(max_length=100)
  middle_name = models.CharField(max_length=15)
  age = models.IntegerField(default=18)
  email = models.EmailField(max_length=200)
  cp_number = models.CharField(max_length=11)
  program = models.CharField(max_length=20)
  date_graduated = models.DateField(default=default_date)

  name_of_school = models.CharField(max_length=100)
  latin_honor = models.CharField(max_length=50, null=True,blank=True)
  pag_ibig_number = models.CharField(max_length=15 )
  phil_health_id_num = models.CharField(max_length=15)
  height = models.CharField(max_length=10)
  tribe_affiliated = models.CharField(max_length=50, null=True, blank=True)
  created_at = models.DateField(auto_now_add=True)
