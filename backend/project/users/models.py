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
      if not Applicant.objects.filter(tracking_code=code).exists():
        return code
    except:
      # During migrations, the table might not exist yet, so just return the code
      return code

class User(models.Model):
    ROLE_CHOICES = (
        ('Administrator', 'Administrator'),
        ('Recruiter', 'Recruiter'),
    )

    name = models.CharField(max_length=100, default="Unknown", verbose_name="Full Name")
    username = models.CharField(max_length=100, unique=True, verbose_name="Username")
    password = models.CharField(max_length=128, verbose_name="Password") # Increased length for potential hashing
    role = models.CharField(max_length=20, choices=ROLE_CHOICES, default='Recruiter', verbose_name="Role")
    is_archived = models.BooleanField(default=False, verbose_name="Is Archived")

    def __str__(self):
        return f"{self.name} (@{self.username})"

class Applicant(models.Model):
    first_name = models.CharField(max_length=100, verbose_name="First Name")
    last_name = models.CharField(max_length=100, verbose_name="Last Name")
    middle_name = models.CharField(max_length=100, blank=True, verbose_name="Middle Name")
    age = models.IntegerField(default=18, verbose_name="Age")
    email = models.EmailField(max_length=200, unique=True, verbose_name="Email Address")
    contact_number = models.CharField(max_length=11, unique=True, verbose_name="Contact Number")
    gender = models.CharField(max_length=10, choices=[('Male', 'Male'), ('Female', 'Female'), ('Other', 'Other')], null=True, blank=True, verbose_name="Gender")
    
    # Education
    program = models.CharField(max_length=100, verbose_name="Program/Course")
    date_graduated = models.DateField(default=default_date, verbose_name="Date Graduated")
    name_of_school = models.CharField(max_length=200, verbose_name="Name of School")
    latin_honor = models.CharField(max_length=50, null=True, blank=True, default='N/A', verbose_name="Latin Honor")
    
    # Identity & Personal
    pag_ibig_number = models.CharField(max_length=15, unique=True, verbose_name="Pag-IBIG Number")
    phil_health_id_num = models.CharField(max_length=15, unique=True, verbose_name="PhilHealth ID")
    height = models.CharField(max_length=10, verbose_name="Height")
    tribe = models.CharField(max_length=100, null=True, blank=True, default='N/A', verbose_name="Tribe Affiliation")
    
    created_at = models.DateTimeField(auto_now_add=True, verbose_name="Date Registered")

    # Property for backward compatibility (flattens active application)
    @property
    def active_application(self):
        return self.applications.order_by('-created_at').first()

    def __str__(self):
        return f"{self.first_name} {self.last_name}"

class Application(models.Model):
    STATUS_CHOICES = [
        ('New Applicant', 'New Applicant'),
        ('Document Review', 'Document Review'),
        ('Initial Screening', 'Initial Screening'),
        ('Technical Interview', 'Technical Interview'),
        ('Accepted', 'Accepted'),
        ('Rejected', 'Rejected'),
        ('Body Mass Index', 'Body Mass Index'),
        ('Physical Agility Test', 'Physical Agility Test'),
        ('Neuro Examination', 'Neuro Examination'),
        ('Medical', 'Medical'),
        ('Drug Test', 'Drug Test'),
        ('Final Interview', 'Final Interview'),
        ('Oath Taking', 'Oath Taking'),
    ]

    applicant = models.ForeignKey(Applicant, on_delete=models.CASCADE, related_name='applications', verbose_name="Applicant")
    tracking_code = models.CharField(
        max_length=20,
        unique=True,
        default=generate_tracking_code,
        editable=False,
        verbose_name="Tracking Code"
    )
    status = models.CharField(max_length=50, choices=STATUS_CHOICES, default='New Applicant', verbose_name="Status")
    rejection_reason = models.TextField(blank=True, null=True, verbose_name="Rejection Reason")
    
    # Scheduling
    scheduled_date = models.DateField(null=True, blank=True, verbose_name="Scheduled Date")
    scheduled_time = models.TimeField(null=True, blank=True, verbose_name="Scheduled Time")
    evaluation_remarks = models.TextField(null=True, blank=True, verbose_name="Evaluation Remarks")
    oath_taking_date = models.DateField(null=True, blank=True, verbose_name="Oath Taking Date")
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"Application {self.tracking_code} ({self.status})"

class Evaluation(models.Model):
    application = models.OneToOneField(Application, on_delete=models.CASCADE, related_name='evaluation', verbose_name="Application")
    
    # Health & Physical
    bmi_height = models.FloatField(null=True, blank=True, verbose_name="BMI Height (m)")
    bmi_weight = models.FloatField(null=True, blank=True, verbose_name="BMI Weight (kg)")
    bmi_result = models.CharField(max_length=50, null=True, blank=True, verbose_name="BMI Result")
    
    # Examination Results
    pat_score = models.FloatField(null=True, blank=True, verbose_name="PAT Score")
    psychological_result = models.TextField(null=True, blank=True, verbose_name="Psychological Result")
    medical_result = models.TextField(null=True, blank=True, verbose_name="Medical Result")
    drug_test_result = models.CharField(max_length=50, null=True, blank=True, verbose_name="Drug Test Result")
    final_interview_score = models.FloatField(null=True, blank=True, verbose_name="Final Interview Score")

    def __str__(self):
        return f"Evaluation for {self.application.tracking_code}"

class ApplicantDocument(models.Model):
    applicant = models.ForeignKey(Applicant, on_delete=models.CASCADE, related_name='documents', verbose_name="Applicant")
    DOCUMENT_TYPES = [
        ('PSA', 'PSA Birth Certificate'),
        ('ELIGIBILITY', 'Eligibilities'),
        ('SCHOLASTIC', 'Scholastic Records (Diploma/OTR)'),
        ('CLEARANCE', 'Clearances'),
    ]

    document_type = models.CharField(max_length=20, choices=DOCUMENT_TYPES, verbose_name="Document Type")
    file = models.ImageField(upload_to='applicant_docs/', verbose_name="Document File")
    uploaded_at = models.DateTimeField(auto_now_add=True, verbose_name="Date Uploaded")

    def __str__(self):
        return f"{self.get_document_type_display()} - {self.applicant.last_name}"

class SystemSettings(models.Model):
    is_application_open = models.BooleanField(default=True, verbose_name="Is Application Open")
    application_start_date = models.DateField(null=True, blank=True, verbose_name="Start Date")
    application_end_date = models.DateField(null=True, blank=True, verbose_name="End Date")
    last_updated = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = "System Setting"
        verbose_name_plural = "System Settings"

    def __str__(self):
        return f"System Settings (Open: {self.is_application_open})"

class AuditLog(models.Model):
    performer = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, related_name='audit_logs', verbose_name="Performer")
    performer_name = models.CharField(max_length=100, null=True, blank=True, verbose_name="Performer Name (Fallback)")
    action = models.CharField(max_length=100, verbose_name="Action")
    details = models.TextField(verbose_name="Details")
    timestamp = models.DateTimeField(auto_now_add=True, verbose_name="Timestamp")

    class Meta:
        ordering = ['-timestamp']

    def __str__(self):
        performer = self.performer.username if self.performer else self.performer_name
        return f"{performer} - {self.action} at {self.timestamp}"
