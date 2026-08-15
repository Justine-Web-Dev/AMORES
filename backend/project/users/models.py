from django.contrib.auth.models import AbstractUser
from django.db import models
from django.utils import timezone
from django.contrib.auth.hashers import make_password, identify_hasher
from cloudinary_storage.storage import MediaCloudinaryStorage

import string
import random
from datetime import timedelta

# Create your models here.

def default_date():
    return timezone.now().date()

#generate a random code 
def generate_tracking_code():
  length = 8
  while True:
    code = 'TA-' + ''.join(random.choices(string.ascii_uppercase + string.digits, k=length))
    try:
      if not Applicant.objects.filter(tracking_code=code).exists():
        return code
    except:
      return code
from django.contrib.auth.models import BaseUserManager

class CustomUserManager(BaseUserManager):
    def create_user(self, email, password=None, **extra_fields):
        if not email:
            raise ValueError('The Email field must be set')
        email = self.normalize_email(email)
        user = self.model(email=email, **extra_fields)
        user.set_password(password)
        user.save(using=self._db)
        return user

    def create_superuser(self, email, password=None, **extra_fields):
        extra_fields.setdefault('is_staff', True)
        extra_fields.setdefault('is_superuser', True)
        extra_fields.setdefault('role', 'SUPER_ADMIN')

        if extra_fields.get('is_staff') is not True:
            raise ValueError('Superuser must have is_staff=True.')
        if extra_fields.get('is_superuser') is not True:
            raise ValueError('Superuser must have is_superuser=True.')

        return self.create_user(email, password, **extra_fields)

class User(AbstractUser):
    objects = CustomUserManager()
    class Roles(models.TextChoices):
        SUPER_ADMIN = 'SUPER_ADMIN', 'Super Admin'
        ADMINISTRATOR = 'Administrator', 'Administrator'
        RECRUITER = 'Recruitment Personnel', 'Recruitment Personnel'
        INTERVIEWER = 'Recruitment Screening Committee (Interviewer)', 'Recruitment Screening Committee (Interviewer)'
    
    name = models.CharField(max_length=100, default="Unknown", verbose_name="Full Name")
    email = models.EmailField(max_length=100, unique=True, verbose_name="Email Address")
    role = models.CharField(
        max_length=50, 
        choices=Roles.choices, 
        default=Roles.RECRUITER, 
        verbose_name="Role"
    )
    is_archived = models.BooleanField(default=False, verbose_name="Is Archived")
    must_change_password = models.BooleanField(default=False, verbose_name="Must Change Password")
    profile_picture = models.ImageField(upload_to='profiles/', null=True, blank=True, verbose_name="Profile Picture")
    
    # Governance & Status Controls
    is_banned = models.BooleanField(default=False, verbose_name="Is Banned")
    is_suspended = models.BooleanField(default=False, verbose_name="Is Suspended")
    force_password_reset = models.BooleanField(default=False, verbose_name="Force Password Reset")

    # Use email instead of username for authentication
    username = None
    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = ['name']

    def __str__(self):
        return f"{self.name} ({self.email})"

class Applicant(models.Model):
    first_name = models.CharField(max_length=100, verbose_name="First Name")
    last_name = models.CharField(max_length=100, verbose_name="Last Name")
    middle_name = models.CharField(max_length=100, blank=True, verbose_name="Middle Name")
    email = models.EmailField(max_length=200, unique=True, verbose_name="Email Address")
    contact_number = models.CharField(max_length=11, unique=True, verbose_name="Contact Number")
    gender = models.CharField(max_length=10, choices=[('Male', 'Male'), ('Female', 'Female'), ('Other', 'Other')], null=True, blank=True, verbose_name="Gender")
    birthdate = models.DateField(verbose_name="Birthdate", null=True, blank=True)
    
    barangay = models.CharField(max_length=100, null=True, blank=True, verbose_name="Barangay")
    city_municipality = models.CharField(max_length=100, null=True, blank=True, verbose_name="City/Municipality")
    province = models.CharField(max_length=100, null=True, blank=True, verbose_name="Province")
    zip_code = models.CharField(max_length=10, null=True, blank=True, verbose_name="Zip Code")
    
    # Education
    program = models.CharField(max_length=100, verbose_name="Program/Course")
    date_graduated = models.DateField(default=default_date, verbose_name="Date Graduated")
    name_of_school = models.CharField(max_length=200, verbose_name="Name of School")
    latin_honor = models.CharField(max_length=50, null=True, blank=True, default='N/A', verbose_name="Latin Honor")
    
    pag_ibig_number = models.CharField(max_length=15, unique=True, verbose_name="Pag-IBIG Number")
    phil_health_id_num = models.CharField(max_length=15, unique=True, verbose_name="PhilHealth ID")
    height = models.CharField(max_length=10, verbose_name="Height")
    tribe = models.CharField(max_length=100, null=True, blank=True, default='N/A', verbose_name="Tribe Affiliation")
    
    created_at = models.DateTimeField(auto_now_add=True, verbose_name="Date Registered")

    # Adding is_reapplied field to track if the applicant has re-applied
    is_reapplied = models.BooleanField(default=False)

    @property
    def address(self):
        parts = [self.barangay, self.city_municipality, self.province, self.zip_code]
        return ", ".join(filter(None, parts))

    @property
    def age(self):
        if hasattr(self, 'birthdate') and self.birthdate:
            today = timezone.now().date()
            return today.year - self.birthdate.year - ((today.month, today.day) < (self.birthdate.month, self.birthdate.day))
        return None

    # Property for backward compatibility (flattens active application)
    @property
    def active_application(self):
        return self.applications.order_by('-created_at').first()

    def __str__(self):
        return f"{self.first_name} {self.last_name}"

class Application(models.Model):
    STATUS_CHOICES = [
        ('New Applicant', 'New Applicant'),
        ('Technical Interview', 'Technical Interview'),
        ('Qualified', 'Qualified'),
        ('Accepted', 'Accepted'),
        ('Failed', 'Failed'),
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
    batch = models.IntegerField(default=1, verbose_name="Batch Number")
    
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
    pat_pushups = models.IntegerField(null=True, blank=True, verbose_name="Push UPS")
    pat_pushups_passed = models.BooleanField(null=True, blank=True)
    pat_situps = models.IntegerField(null=True, blank=True, verbose_name="Sit UPS")
    pat_situps_passed = models.BooleanField(null=True, blank=True)
    pat_run = models.CharField(max_length=10, null=True, blank=True, verbose_name="3km Run")
    pat_run_passed = models.BooleanField(null=True, blank=True)
    psychological_result = models.TextField(null=True, blank=True, verbose_name="Psychological Result")
    medical_result = models.TextField(null=True, blank=True, verbose_name="Medical Result")
    drug_test_result = models.CharField(max_length=50, null=True, blank=True, verbose_name="Drug Test Result")
    
    # Final Interview Detailed Rubric
    fi_patriotism = models.FloatField(null=True, blank=True, verbose_name="Patriotism and Service Orientation Score")
    fi_integrity = models.FloatField(null=True, blank=True, verbose_name="Integrity/Values Score")
    fi_awareness = models.FloatField(null=True, blank=True, verbose_name="Awareness of Issues Score")
    fi_communication = models.FloatField(null=True, blank=True, verbose_name="Communication Skills Score")
    final_interview_score = models.FloatField(null=True, blank=True, verbose_name="Final Interview Score")

    def __str__(self):
        return f"Evaluation for {self.application.tracking_code}"

class ApplicantDocument(models.Model):
    applicant = models.ForeignKey(Applicant, on_delete=models.CASCADE, related_name='documents', verbose_name="Applicant")      
    DOCUMENT_TYPES = [
        # PSA
        ('BIRTH_CERT', 'Birth Certificate'),
        # Scholastic
        ('OTR', 'Official Transcript of Records (OTR)'),
        ('DIPLOMA', 'Diploma'),
        # Clearances
        ('BRGY_CLEARANCE', 'Barangay Clearance'),
        ('POLICE_CLEARANCE', 'National Police Clearance'),
        ('PROS_CLEARANCE', "Prosecutor's Clearance"),
        ('NBI_CLEARANCE', 'NBI Clearance'),
        # Eligibilities
        ('PRC', 'PRC License'),
        ('NAPOLCOM', 'Napolcom Entrance Rating'),
        ('PD907', 'PD907 (Honor Graduate)'),
        ('CS_PROF', 'CS Professional Eligibility'),
        # Legacy / broad categories (for backward compatibility)
        ('PSA', 'PSA Birth Certificate'),
        ('ELIGIBILITY', 'Eligibilities'),
        ('SCHOLASTIC', 'Scholastic Records (Diploma/OTR)'),
        ('CLEARANCE', 'Clearances'),
    ]

    document_type = models.CharField(max_length=25, choices=DOCUMENT_TYPES, verbose_name="Document Type")
    file = models.FileField(upload_to='applicant_docs/', storage=MediaCloudinaryStorage(), verbose_name="Document File")

    # AI Verification Fields
    ocr_text = models.TextField(blank=True, null=True, verbose_name="Extracted Text (OCR)")
    ai_verified = models.BooleanField(default=False, verbose_name="AI Verified")
    ai_remarks = models.CharField(max_length=255, blank=True, null=True, verbose_name="AI Remarks")
    uploaded_at = models.DateTimeField(auto_now_add=True, verbose_name="Date Uploaded")
    expiration_date = models.DateTimeField(null=True, blank=True, verbose_name="Expiration Date")

    def save(self, *args, **kwargs):
        if not self.expiration_date:
            # Set expiration to exactly 180 days from now
            self.expiration_date = timezone.now() + timedelta(days=180)
        super().save(*args, **kwargs)

    def __str__(self):
        return f"{self.get_document_type_display()} - {self.applicant.last_name}"

class SystemSettings(models.Model):
    is_application_open = models.BooleanField(default=True, verbose_name="Is Application Open")
    application_start_date = models.DateField(null=True, blank=True, verbose_name="Start Date")
    application_end_date = models.DateField(null=True, blank=True, verbose_name="End Date")
    current_batch = models.IntegerField(default=1, verbose_name="Current Batch")
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
    target_resource = models.CharField(max_length=255, null=True, blank=True, verbose_name="Target Resource")
    changes = models.JSONField(null=True, blank=True, verbose_name="Changes")
    ip_address = models.GenericIPAddressField(null=True, blank=True, verbose_name="IP Address")
    timestamp = models.DateTimeField(auto_now_add=True, verbose_name="Timestamp")

    class Meta:
        ordering = ['-timestamp']

    def __str__(self):
        performer = self.performer.name if self.performer else self.performer_name
        return f"{performer} - {self.action} at {self.timestamp}"

class GlobalSetting(models.Model):
    key = models.CharField(max_length=100, unique=True, verbose_name="Key")
    value = models.JSONField(verbose_name="Value")
    description = models.TextField(null=True, blank=True, verbose_name="Description")
    is_active = models.BooleanField(default=True, verbose_name="Is Active")
    updated_at = models.DateTimeField(auto_now=True, verbose_name="Updated At")

    class Meta:
        verbose_name = "Global Setting"
        verbose_name_plural = "Global Settings"

    def __str__(self):
        return f"{self.key}: {self.value}"

# --- Dynamic RBAC Models ---

class Role(models.Model):
    name = models.CharField(max_length=50, unique=True, verbose_name="Role Name")
    description = models.TextField(blank=True, null=True, verbose_name="Description")
    is_system_role = models.BooleanField(default=False, help_text="Cannot be deleted if true")
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.name

class Permission(models.Model):
    resource = models.CharField(max_length=100, verbose_name="Resource (e.g., applicant)")
    action = models.CharField(max_length=50, verbose_name="Action (e.g., read, write, delete)")
    description = models.TextField(blank=True, null=True)

    class Meta:
        unique_together = ('resource', 'action')

    def __str__(self):
        return f"{self.resource}:{self.action}"

class RolePermission(models.Model):
    role = models.ForeignKey(Role, on_delete=models.CASCADE, related_name='permissions')
    permission = models.ForeignKey(Permission, on_delete=models.CASCADE)
    
    class Meta:
        unique_together = ('role', 'permission')

    def __str__(self):
        return f"{self.role.name} -> {self.permission}"

# --- System Operations Models ---

class ApplicationDraft(models.Model):
    draft_code = models.CharField(max_length=20, unique=True, verbose_name="Draft Code")
    form_data = models.JSONField(verbose_name="Form Data")
    created_at = models.DateTimeField(auto_now_add=True, verbose_name="Created At")
    updated_at = models.DateTimeField(auto_now=True, verbose_name="Updated At")

    def __str__(self):
        return f"Draft {self.draft_code}"