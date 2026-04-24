from django.db import models
from django.utils import timezone
import string
import random

# Create your models here.

def default_date():
    return timezone.now().date()

#generate a random code 
def generate_tracking_code():
  length = 8
  while True:
    # Generates something like TA-X87K2L91
    code = 'TA-' + ''.join(random.choices(string.ascii_uppercase + string.digits, k=length))
    # Check if the code already exists in the database to ensure uniqueness
    try:
      if not Applicant_infos.objects.filter(tracking_code=code).exists():
        return code
    except:
      # During migrations, the table might not exist yet, so just return the code
      return code

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

  rejection_reason = models.TextField(blank=True,null=True)

  name_of_school = models.CharField(max_length=100)
  latin_honor = models.CharField(max_length=50, null=True,blank=True,default='N/A')
  pag_ibig_number = models.CharField(max_length=15 )
  phil_health_id_num = models.CharField(max_length=15)
  height = models.CharField(max_length=10)
  tribe_affiliated = models.CharField(max_length=50, null=True, blank=True,default='N/A')
  created_at = models.DateField(auto_now_add=True)

  tracking_code = models.CharField(
    max_length=20,
    unique=True,
    default=generate_tracking_code,
    editable=False
    )
  status = models.CharField(
        max_length=20, 
        default='New Applicant',
        choices=[
            ('New Applicant', 'New Applicant'),
            ('Under Review', 'Under Review'),
            ('Accepted', 'Accepted'),
            ('Rejected', 'Rejected')
        ]
    )
  
  def  __str__ (self):
    return f"{self.firstname} {self.lastname} ({self.tracking_code})"
  
class ApplicantDocument(models.Model):
  # This links the document to a specific applicant
    applicant = models.ForeignKey(
        'Applicant_infos', 
        on_delete=models.CASCADE, 
        related_name='documents'
    )

   # Using your specific list from the image
    DOCUMENT_TYPES = [
        ('PSA', 'PSA Birth Certificate'),
        ('ELIGIBILITY', 'Eligibilities'),
        ('SCHOLASTIC', 'Scholastic Records (Diploma/OTR)'),
        ('CLEARANCE', 'Clearances'),
    ]

    document_type = models.CharField(max_length=20, choices=DOCUMENT_TYPES)
    file = models.ImageField(upload_to='applicant_docs/')
    uploaded_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.document_type} for {self.applicant.lastname}"
