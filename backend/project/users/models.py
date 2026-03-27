from django.db import models

# Create your models here.
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
