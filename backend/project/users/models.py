from django.db import models

# Create your models here.
class User(models.Model):
  username = models.CharField(max_length=100)
  password = models.CharField(max_length=50)

class Applicant_infos(models.Model):
  firstname = models.CharField(max_length=100)
  lastname = models.CharField(max_length=100)
