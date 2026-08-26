from django.shortcuts import render
from django.db import transaction
from .serializers import (
    UsersSerializers, ApplicantSerializer, ApplicantFullSerializer, ApplicantDocumentSerializer, 
    SystemSettingsSerializer, AuditLogSerializer, ApplicantDashboardSerializer
)
from .models import User, Applicant, Application, Evaluation, ApplicantDocument, SystemSettings, AuditLog
from .utils import (
    create_audit_log,
    get_user_from_request,
    detect_backup_format,
    create_database_backup,
    restore_database_backup,
    send_mail_async,
    get_status_congratulations_message,
)
from .services import evaluate_initial_application_status
from .screening import evaluate_initial_application_status
from rest_framework.decorators import api_view, parser_classes
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.parsers import MultiPartParser, FormParser, JSONParser
from django.contrib.auth.hashers import check_password, make_password
from rest_framework.permissions import IsAuthenticated, AllowAny
from django.utils import timezone
from django.contrib.auth.tokens import PasswordResetTokenGenerator
from django.utils.http import urlsafe_base64_encode, urlsafe_base64_decode
from django.utils.encoding import force_bytes, force_str
from django.core.cache import cache
import random

def is_application_allowed():
    settings = SystemSettings.objects.first()
    if not settings:
        return True
    
    if settings.application_start_date and settings.application_end_date:
        today = timezone.localdate()
        return settings.application_start_date <= today <= settings.application_end_date
    return settings.is_application_open

from .permissions import IsSuperAdmin, IsAdministrator, IsRecruiter, IsInterviewer, IsRecruiterOrInterviewer
from rest_framework.decorators import permission_classes

import jwt
import datetime
import os
from django.conf import settings
from django.http import HttpResponse
from django.db.models import Prefetch
import tempfile
import secrets
import string

import threading

def send_welcome_email(name, email, raw_password, role):
    """Send new user's credentials via Django's built-in email backend.
    With the console backend this prints to the Django terminal (free, no credentials)."""
    subject = f"Welcome to AMORES – Account Created for {name}"
    message = (
        f"Hi {name},\n\n"
        f"Your AMORES account has been successfully created.\n\n"
        f"----------------------------------------\n"
        f"YOUR LOGIN CREDENTIALS:\n"
        f"Role:     {role}\n"
        f"Email:    {email}\n"
        f"Password: {raw_password}\n"
        f"----------------------------------------\n\n"
        f"👉 Action Required: For security purposes, please log in and change your password immediately.\n\n"
        f"Best regards,\n"
        f"PNP-AMORES System\n\n"
        f"Generated on: {datetime.datetime.now().strftime('%Y-%m-%d %H:%M:%S')}"
    )
    
    try:
        send_mail_async(
            subject=subject,
            message=message,
            from_email=settings.DEFAULT_FROM_EMAIL,
            recipient_list=[email],
            fail_silently=False,
        )
    except Exception as e:
        print(f"[AMORES] Email send failed for {email}: {e}", flush=True)

def send_application_received_email(name, email, tracking_code, is_reapply=False):
    """Send confirmation email to applicants with their tracking code."""
    subject_type = "Re-Application" if is_reapply else "Application"
    subject = f"{subject_type} Received – AMORES"
    message = (
        f"Hi {name},\n\n"
        f"We have successfully received your {subject_type.lower()} for the Philippine National Police.\n\n"
        f"----------------------------------------\n"
        f"YOUR TRACKING CODE:\n"
        f"{tracking_code}\n"
        f"----------------------------------------\n\n"
        f"You can use this tracking code to check the status of your application on our portal.\n\n"
        f"Best regards,\n"
        f"PNP-AMORES System\n\n"
        f"Generated on: {datetime.datetime.now().strftime('%Y-%m-%d %H:%M:%S')}"
    )
    
    try:
        send_mail_async(
            subject=subject,
            message=message,
            from_email=settings.DEFAULT_FROM_EMAIL,
            recipient_list=[email],
            fail_silently=False,
        )
    except Exception as e:
        print(f"[AMORES] Application email send failed for {email}: {e}", flush=True)

def send_password_changed_email(name, email, new_password):
    """Send notification email when a user changes their password."""
    subject = f"Password Changed Successfully – AMORES"
    message = (
        f"Hi {name},\n\n"
        f"Your password for the PNP-AMORES System has been successfully changed.\n\n"
        f"----------------------------------------\n"
        f"YOUR NEW PASSWORD:\n"
        f"{new_password}\n"
        f"----------------------------------------\n\n"
        f"Best regards,\n"
        f"PNP-AMORES System\n\n"
        f"Generated on: {datetime.datetime.now().strftime('%Y-%m-%d %H:%M:%S')}"
    )
    
    try:
        send_mail_async(
            subject=subject,
            message=message,
            from_email=settings.DEFAULT_FROM_EMAIL,
            recipient_list=[email],
            fail_silently=False,
        )
    except Exception as e:
        print(f"[AMORES] Password changed email send failed for {email}: {e}", flush=True)

@api_view(['GET'])
@permission_classes([IsAdministrator])
def get_user(request):
  archived_param = request.query_params.get('archived', 'false')
  base_query = User.objects.only('id', 'name', 'email', 'role', 'is_archived')
  if archived_param == 'all':
      users = base_query.all()
  else:
      is_archived = archived_param == 'true'
      users = base_query.filter(is_archived=is_archived)
  serializers = UsersSerializers(users, many=True)
  return Response(serializers.data)

@api_view(['POST'])
@permission_classes([IsAdministrator])
def register_user(request):
    email = request.data.get('email')
    name = request.data.get('name')

    if not email: 
        return Response({"error": "Email is required."}, status=status.HTTP_400_BAD_REQUEST)

    if User.objects.filter(email=email).exists():
        return Response({"error": f"Email '{email}' is already taken."}, status=status.HTTP_400_BAD_REQUEST)
  
    if User.objects.filter(name=name).exists():
        return Response({"error": f"A personnel with the name '{name}' is already registered."}, status=status.HTTP_400_BAD_REQUEST)

    raw_password = request.data.get('password')

    is_system_generated = False
    if not raw_password:
        is_system_generated = True
        # Define secure character pool
        alphabet = string.ascii_letters + string.digits + "!@#$%^&*"
        while True:
            # Generate a random string using cryptographically secure secrets module
            generated = ''.join(secrets.choice(alphabet) for _ in range(14))
            # Validate strength rules (1 lowercase, 1 uppercase, 2 digits)
            if (any(c.islower() for c in generated)
                    and any(c.isupper() for c in generated)
                    and sum(c.isdigit() for c in generated) >= 2):
                raw_password = generated
                break

    registration_data = request.data.copy()
    registration_data['password'] = raw_password
    # Always require password change for newly registered users by admin
    registration_data['must_change_password'] = True

    serializers = UsersSerializers(data=registration_data)
    
    if serializers.is_valid():
        user = serializers.save()
        
        # Fixed tracking to search via email instead of username
        performer_email = get_user_from_request(request)
        performer = User.objects.filter(email=performer_email).first()
        
        create_audit_log(
            performer, 
            'USER_REGISTRATION', 
            f"New user '{user.email}' registered as {user.role}.",
            performer_name=performer_email if not performer else None
        )

        # Send credentials to the new user via Django's email backend
        send_welcome_email(name=user.name, email=user.email, raw_password=raw_password, role=user.role)
        
        response_data = serializers.data

        # If the frontend didn't supply a password, pass back the raw temporary string
        if not request.data.get('password'):
            response_data['temporary_password'] = raw_password

        return Response(response_data, status=status.HTTP_201_CREATED)
        
    return Response(serializers.errors, status=status.HTTP_400_BAD_REQUEST)

@api_view(['POST'])
@permission_classes([AllowAny])
def login_user(request):
  email = request.data.get('email')
  password = request.data.get('password')

  if not email or not password:
      return Response({'error': 'Email and password are required'}, status=status.HTTP_400_BAD_REQUEST)

  try:
    user = User.objects.get(email=email)
  except User.DoesNotExist:
    return Response({'error': 'Email not found'}, status=status.HTTP_404_NOT_FOUND)
    
  if user.is_archived:
    return Response({'error': 'This email is inactive'}, status=status.HTTP_403_FORBIDDEN)
  
  if getattr(user, 'is_banned', False):
      return Response({'error': 'This account has been permanently banned.'}, status=status.HTTP_403_FORBIDDEN)
  if getattr(user, 'is_suspended', False):
      return Response({'error': 'This account is currently suspended.'}, status=status.HTTP_403_FORBIDDEN)
  
  is_password_valid = False
  if user.password == password:
      is_password_valid = True
      user.password = make_password(password)
      user.save()
  elif check_password(password, user.password):
      is_password_valid = True

  if not is_password_valid:
    return Response({'error': 'Invalid password'}, status=status.HTTP_400_BAD_REQUEST)
  
  payload = {
    "user_id": user.id,
    "email": user.email,
    "name": user.name,
    "role": user.role,
    "profile_picture": user.profile_picture.url if user.profile_picture else None,
    "exp": datetime.datetime.utcnow() + datetime.timedelta(hours=1)
  }
  
  token = jwt.encode(payload, settings.SECRET_KEY, algorithm="HS256")
  create_audit_log(user, 'LOGIN', f"User '{user.email}' logged in successfully.")

  # Automatically deactivate other Administrators when one successfully logs in
  if user.role == User.Roles.ADMINISTRATOR:
      other_admins = User.objects.filter(role=User.Roles.ADMINISTRATOR, is_archived=False).exclude(id=user.id)
      if other_admins.exists():
          for old_admin in other_admins:
              old_admin.is_archived = True
              old_admin.save()
          create_audit_log(user, 'SYSTEM', f"Administrator '{user.email}' logged in. Older Administrators were deactivated automatically.")

  return Response({
    "token": token,
    "email": user.email,
    "role": user.role,
    "name": user.name,
    "profile_picture": user.profile_picture.url if user.profile_picture else None,
    "must_change_password": user.must_change_password,
  })



@api_view(['POST'])
@permission_classes([IsAuthenticated])
def change_password(request):
    current_password = request.data.get('current_password')
    new_password = request.data.get('new_password')
    
    if not current_password or not new_password:
        return Response({'error': 'Current password and new password are required.'}, status=status.HTTP_400_BAD_REQUEST)
        
    performer_email = get_user_from_request(request)
    if not performer_email or performer_email == 'Unknown':
        return Response({'error': 'Unauthorized'}, status=status.HTTP_401_UNAUTHORIZED)
        
    try:
        user = User.objects.get(email=performer_email, is_archived=False)
    except User.DoesNotExist:
        return Response({'error': 'User not found.'}, status=status.HTTP_404_NOT_FOUND)
        
    # Check current password
    is_valid = False
    if user.password == current_password: # To handle legacy plaintext passwords temporarily if any
        is_valid = True
    elif check_password(current_password, user.password):
        is_valid = True
        
    if not is_valid:
        return Response({'error': 'Invalid current password.'}, status=status.HTTP_400_BAD_REQUEST)
        
    user.password = make_password(new_password)
    user.must_change_password = False
    user.save()
    
    create_audit_log(user, 'PASSWORD_CHANGE', f"User '{user.email}' changed their password via settings.", performer_name=user.email)
    
    send_password_changed_email(user.name, user.email, new_password)
    
    return Response({'message': 'Password has been changed successfully.'}, status=status.HTTP_200_OK)

@api_view(['POST'])
@permission_classes([AllowAny])
def forgot_password(request):
    email = request.data.get('email')
    if not email:
        return Response({'error': 'Email is required.'}, status=status.HTTP_400_BAD_REQUEST)
        
    try:
        user = User.objects.get(email=email, is_archived=False)
    except User.DoesNotExist:
        return Response({'error': 'No active account found with this email.'}, status=status.HTTP_404_NOT_FOUND)
        
    otp = str(random.randint(100000, 999999))
    cache.set(f"password_reset_otp_{email}", otp, timeout=300)
    
    subject = "Password Reset Verification Code – AMORES"
    message = (
        f"Hi {user.name},\n\n"
        f"You requested a password reset for your PNP-AMORES account. Use the code below to complete the process:\n"
        f"Here is your OTP code:\n\n"
        f"Code: {otp}\n\n"
        f"This code will expire in 2 minutes.For your security, do not share this code with anyone.\n"
        f"If you did not request this reset, please ignore this email or contact support to secure your account.\n\n"
        f"Best regards,\n"
        f"PNP-AMORES System"
    )
    
    send_mail_async(
        subject=subject,
        message=message,
        from_email=settings.DEFAULT_FROM_EMAIL,
        recipient_list=[email],
        fail_silently=False,
    )
    
    create_audit_log(user, 'PASSWORD_RESET_REQUEST', f"User '{user.email}' requested a password reset.", performer_name=user.email)
    
    return Response({'message': 'A password reset link has been sent to your email.'}, status=status.HTTP_200_OK)

@api_view(['POST'])
@permission_classes([AllowAny])
def verify_otp(request):
    email = request.data.get('email')
    otp = request.data.get('otp')
    
    if not email or not otp:
        return Response({'error': 'Missing required fields.'}, status=status.HTTP_400_BAD_REQUEST)
        
    cached_otp = cache.get(f"password_reset_otp_{email}")
    if cached_otp and str(cached_otp) == str(otp):
        from django.utils.crypto import get_random_string
        reset_token = get_random_string(length=32)
        cache.set(f"password_reset_token_{email}", reset_token, timeout=300)
        cache.delete(f"password_reset_otp_{email}")
        return Response({'message': 'OTP verified successfully.', 'reset_token': reset_token}, status=status.HTTP_200_OK)
    else:
        return Response({'error': 'The verification code is invalid or has expired.'}, status=status.HTTP_400_BAD_REQUEST)

@api_view(['POST'])
@permission_classes([AllowAny])
def reset_password(request):
    email = request.data.get('email')
    reset_token = request.data.get('reset_token')
    new_password = request.data.get('new_password')
    
    if not email or not reset_token or not new_password:
        return Response({'error': 'Missing required fields.'}, status=status.HTTP_400_BAD_REQUEST)
        
    try:
        user = User.objects.get(email=email, is_archived=False)
    except User.DoesNotExist:
        return Response({'error': 'Invalid request.'}, status=status.HTTP_400_BAD_REQUEST)
        
    cached_token = cache.get(f"password_reset_token_{email}")
    if cached_token and str(cached_token) == str(reset_token):
        user.password = make_password(new_password)
        user.must_change_password = False
        user.save()
        
        cache.delete(f"password_reset_token_{email}")
        send_password_changed_email(user.name, user.email, new_password)
        create_audit_log(user, 'PASSWORD_RESET_SUCCESS', f"User '{user.email}' successfully reset their password.", performer_name=user.email)
        
        return Response({'message': 'Password has been reset successfully.'}, status=status.HTTP_200_OK)
    else:
        return Response({'error': 'Your session has expired. Please request a new verification code.'}, status=status.HTTP_400_BAD_REQUEST)

@api_view(['GET', 'PUT', 'DELETE'])
@permission_classes([IsAdministrator])
def update_user(request, pk):
    try:
        user_obj = User.objects.get(pk=pk)
    except User.DoesNotExist:
        return Response({'error': 'User not found'}, status=status.HTTP_404_NOT_FOUND)

    # Cache target user's email for audit logging
    target_email = user_obj.email

    # --- GET: Retrieve User ---
    if request.method == 'GET':
        serializers = UsersSerializers(user_obj)
        return Response(serializers.data)

    # --- PUT: Update User ---
    elif request.method == 'PUT':
        new_name = request.data.get('name')
        new_email = request.data.get('email')

        # Check if the new email is already taken by another user
        if new_email and User.objects.filter(email=new_email).exclude(pk=pk).exists():
            return Response({"error": f"Email '{new_email}' is already taken."}, status=status.HTTP_400_BAD_REQUEST)
        
        # Check if name is unique (keeping your personnel logic)
        if new_name and User.objects.filter(name=new_name).exclude(pk=pk).exists():
            return Response({"error": f"A personnel with the name '{new_name}' is already registered."}, status=status.HTTP_400_BAD_REQUEST)

        serializers = UsersSerializers(user_obj, data=request.data, partial=True) # partial=True handles partial updates smoothly
        if serializers.is_valid():
            serializers.save()
            
            # Fetch performer using email instead of username
            performer_email = get_user_from_request(request)
            performer = User.objects.filter(email=performer_email).first()
            
            create_audit_log(
                performer, 
                'USER_UPDATE', 
                f"User '{target_email}' details updated.", 
                performer_name=performer_email if not performer else None
            )
            
            payload = {
                "user_id": user_obj.id,
                "email": user_obj.email,
                "name": user_obj.name,
                "role": user_obj.role,
                "profile_picture": user_obj.profile_picture.url if user_obj.profile_picture else None,
                "exp": datetime.datetime.utcnow() + datetime.timedelta(hours=1)
            }
            token = jwt.encode(payload, settings.SECRET_KEY, algorithm="HS256")
            
            response_data = serializers.data
            response_data['token'] = token
            
            return Response(response_data)
        return Response(serializers.errors, status=status.HTTP_400_BAD_REQUEST)

    # --- DELETE: Archive User ---
    elif request.method == 'DELETE':
        user_obj.is_archived = True
        user_obj.save()
        
        # Fetch performer using email instead of username
        performer_email = get_user_from_request(request)
        performer = User.objects.filter(email=performer_email).first()
        
        create_audit_log(
            performer, 
            'USER_ARCHIVE', 
            f"User '{target_email}' archived.", 
            performer_name=performer_email if not performer else None
        )
        return Response(status=status.HTTP_204_NO_CONTENT)
def get_applicant_queryset():
  return Applicant.objects.prefetch_related(
    Prefetch(
      'applications',
      queryset=Application.objects.select_related('evaluation').order_by('-created_at'),
      to_attr='prefetched_applications'
    )
  )

@api_view(['GET'])
def get_applicant_form(request):
  applicants = get_applicant_queryset()
  serializer = ApplicantFullSerializer(applicants, many=True)
  return Response(serializer.data)

@api_view(['GET'])
def get_dashboard_applicants(request):
    from django.db.models import Subquery, OuterRef
    from datetime import date
    
    latest_app_subquery = Application.objects.filter(
        applicant=OuterRef('pk')
    ).order_by('-created_at')

    applicants = Applicant.objects.annotate(
        app_created_at=Subquery(latest_app_subquery.values('created_at')[:1]),
        app_status=Subquery(latest_app_subquery.values('status')[:1]),
        app_batch=Subquery(latest_app_subquery.values('batch')[:1]),
        app_final_interview_score=Subquery(
            Application.objects.filter(
                applicant=OuterRef('pk')
            ).order_by('-created_at').values('evaluation__final_interview_score')[:1]
        )
    ).values(
        'id', 'created_at', 'app_created_at', 'app_batch', 'app_status',
        'app_final_interview_score',
        'gender', 'birthdate', 'program', 'name_of_school', 'province', 'is_reapplied'
    )

    today = date.today()
    data = []
    for a in applicants:
        age = None
        if a['birthdate']:
            b = a['birthdate']
            age = today.year - b.year - ((today.month, today.day) < (b.month, b.day))
            
        app_created_at = a['app_created_at']
        created_at = a['created_at']
        
        # Handle string or datetime objects safely
        if hasattr(app_created_at, 'date'):
            created_at_val = app_created_at.date()
        elif hasattr(created_at, 'date'):
            created_at_val = created_at.date()
        else:
            created_at_val = app_created_at or created_at
            
        data.append({
            'id': a['id'],
            'created_at': created_at_val,
            'batch': a['app_batch'],
            'status': a['app_status'],
            'final_interview_score': a['app_final_interview_score'],
            'gender': a['gender'],
            'age': age,
            'program': a['program'],
            'school': a['name_of_school'],
            'province': a['province'],
            'is_reapplied': a['is_reapplied']
        })
        
    return Response(data)

@api_view(['GET'])
@permission_classes([IsRecruiterOrInterviewer])
def get_single_applicant(request, pk):
    try:
        applicant = Applicant.objects.get(pk=pk)
        serializer = ApplicantFullSerializer(applicant)
        return Response(serializer.data)
    except Applicant.DoesNotExist:
        return Response({"error": "Applicant not found"}, status=status.HTTP_404_NOT_FOUND)

@api_view(['GET'])
def track_status(request, code):
    try:
        application = Application.objects.get(tracking_code=code.upper())
        applicant = application.applicant
        return Response({
            "status": application.status,
            "name": f"{applicant.first_name} {applicant.last_name}",
            "program": applicant.program
        }, status=status.HTTP_200_OK)
    except Application.DoesNotExist:
        return Response({"error": "Application not found"}, status=status.HTTP_404_NOT_FOUND)
    
@api_view(['POST'])
def validate_applicant_form(request):
    """Validate form data without registering the applicant"""
    email = request.data.get('email', '').strip().lower()
    contact_number = request.data.get('cp_number', '').strip() or request.data.get('contact_number', '').strip()
    pag_ibig_number = request.data.get('pag_ibig_number', '').strip()
    phil_health_id_num = request.data.get('phil_health_id_num', '').strip()
    tracking_code = request.data.get('tracking_code', '').strip()

    errors = []

    if not email or not contact_number or not pag_ibig_number or not phil_health_id_num:
        return Response({"error": "Email, Contact number, Pag-IBIG number, and PhilHealth ID are required."}, status=status.HTTP_400_BAD_REQUEST)
        
    exclude_kwargs = {}
    if tracking_code:
        try:
            existing_app = Application.objects.get(tracking_code__iexact=tracking_code)
            exclude_kwargs['id'] = existing_app.applicant.id
        except Application.DoesNotExist:
            print(f"[DEBUG] validate_applicant_form: Application with tracking code '{tracking_code}' not found.")
            pass

    if Applicant.objects.exclude(**exclude_kwargs).filter(email__iexact=email).exists():
        errors.append("An application with this email already exists.")
    if Applicant.objects.exclude(**exclude_kwargs).filter(contact_number=contact_number).exists():
        errors.append("An application with this contact number already exists.")
    if Applicant.objects.exclude(**exclude_kwargs).filter(pag_ibig_number=pag_ibig_number).exists():
        errors.append("An application with this Pag-IBIG number already exists.")
    if Applicant.objects.exclude(**exclude_kwargs).filter(phil_health_id_num=phil_health_id_num).exists():
        errors.append("An application with this PhilHealth ID already exists.")

    if errors:
        return Response({"errors": errors}, status=status.HTTP_409_CONFLICT)

    return Response({"valid": True, "message": "Form data is valid."}, status=status.HTTP_200_OK)

@api_view(['POST'])
def register_applicant_form(request):
    if not is_application_allowed():
        return Response({"error": "Application period is currently closed."}, status=status.HTTP_403_FORBIDDEN)

    # Mapping old field names to new ones for validation and creation
    email = request.data.get('email', '').strip().lower()
    contact_number = request.data.get('cp_number', '').strip() or request.data.get('contact_number', '').strip()
    pag_ibig_number = request.data.get('pag_ibig_number', '').strip()
    phil_health_id_num = request.data.get('phil_health_id_num', '').strip()
    tracking_code = request.data.get('tracking_code', '').strip()

    if not email or not contact_number or not pag_ibig_number or not phil_health_id_num:
        return Response({"error": "Email, Contact number, Pag-IBIG number, and PhilHealth ID are required."}, status=status.HTTP_400_BAD_REQUEST)

    existing_applicant = None
    if tracking_code:
        try:
            existing_app = Application.objects.get(tracking_code__iexact=tracking_code)
            existing_applicant = existing_app.applicant
        except Application.DoesNotExist:
            print(f"[DEBUG] register_applicant_form: Application with tracking code '{tracking_code}' not found.")
            pass

    exclude_kwargs = {}
    if existing_applicant:
        exclude_kwargs['id'] = existing_applicant.id

    if Applicant.objects.exclude(**exclude_kwargs).filter(email__iexact=email).exists():
        return Response({"error": "An application with this email already exists."}, status=status.HTTP_409_CONFLICT)
    if Applicant.objects.exclude(**exclude_kwargs).filter(contact_number=contact_number).exists():
        return Response({"error": "An application with this contact number already exists."}, status=status.HTTP_409_CONFLICT)
    if Applicant.objects.exclude(**exclude_kwargs).filter(pag_ibig_number=pag_ibig_number).exists():
        return Response({"error": "An application with this Pag-IBIG number already exists."}, status=status.HTTP_409_CONFLICT)
    if Applicant.objects.exclude(**exclude_kwargs).filter(phil_health_id_num=phil_health_id_num).exists():
        return Response({"error": "An application with this PhilHealth ID already exists."}, status=status.HTTP_409_CONFLICT)

    # Use serializer to handle data mapping (standardizes first_name/lastname etc)
    data = request.data.copy()
    if 'firstname' in data: data['first_name'] = data.pop('firstname')[0] if isinstance(data['firstname'], list) else data.pop('firstname')
    if 'lastname' in data: data['last_name'] = data.pop('lastname')[0] if isinstance(data['lastname'], list) else data.pop('lastname')
    if 'cp_number' in data: data['contact_number'] = data.pop('cp_number')[0] if isinstance(data['cp_number'], list) else data.pop('cp_number')
    if 'tribe_affiliated' in data: data['tribe'] = data.pop('tribe_affiliated')[0] if isinstance(data['tribe_affiliated'], list) else data.pop('tribe_affiliated')
    if 'address' in data and not data.get('address'):
        data['address'] = 'N/A'

    # Age validation (21 to 30)
    birthdate = data.get('birthdate')
    if birthdate:
        if isinstance(birthdate, list): birthdate = birthdate[0]
        from datetime import datetime
        try:
            dob = datetime.strptime(birthdate, '%Y-%m-%d').date()
            today = datetime.now().date()
            age = today.year - dob.year - ((today.month, today.day) < (dob.month, dob.day))
            if age < 21 or age > 30:
                return Response({"error": f"Applicant age must be between 21 and 30 years old (Current Age: {age})."}, status=status.HTTP_400_BAD_REQUEST)
        except Exception:
            pass

    if existing_applicant:
        serializer = ApplicantSerializer(existing_applicant, data=data, partial=True)
    else:
        serializer = ApplicantSerializer(data=data)

    if serializer.is_valid():
       applicant = serializer.save()
       
       if existing_applicant:
           from django.utils import timezone
           applicant.created_at = timezone.now()
           applicant.save(update_fields=['created_at'])
           
           active_app = applicant.applications.exclude(status__in=['Failed', 'Rejected']).first()
           if active_app:
               return Response({"error": "You already have an active application."}, status=status.HTTP_400_BAD_REQUEST)

       # Create initial application with current batch
       settings_obj = SystemSettings.objects.first()
       current_batch = settings_obj.current_batch if settings_obj else 1
       
       application = Application.objects.create(applicant=applicant, batch=current_batch)
       # Create initial evaluation linked to application
       Evaluation.objects.create(application=application)
       
       action_msg = "updated/re-applied" if existing_applicant else "registered"
       create_audit_log(None, 'APPLICANT_REGISTRATION', f"Applicant '{applicant.first_name} {applicant.last_name}' ({application.tracking_code}) {action_msg}.", performer_name='System')
       
       send_application_received_email(
           name=f"{applicant.first_name} {applicant.last_name}",
           email=applicant.email,
           tracking_code=application.tracking_code
       )
       
       return Response({
                 "id": applicant.id,
                 "tracking_code": application.tracking_code, 
                 "message": "Success"
       }, status=status.HTTP_201_CREATED)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

def send_status_update_email(applicant_email, applicant_name, status_val, remarks=None):
    """Sends asynchronous email notification when an applicant's status is manually updated."""
    subject = f"Application Status Update – AMORES"
    message = (
        f"Hi {applicant_name},\n\n"
        f"There has been an update to your application status in the PNP-AMORES recruitment portal.\n\n"
        f"Current Status: {status_val}\n"
    )
    if status_val == 'Failed':
        message += "\n"
    else:
        message += get_status_congratulations_message(status_val)
    
    message += (
        f"Please go to the portal to track your progress.\n\n"
        f"Best regards,\n"
        f"PNP-AMORES System"
    )
    
    try:
        send_mail_async(
            subject=subject,
            message=message,
            from_email=settings.DEFAULT_FROM_EMAIL,
            recipient_list=[applicant_email],
            fail_silently=False,
        )
    except Exception as e:
        print(f"[AMORES] Status update email send failed for {applicant_email}: {e}", flush=True)

def send_schedule_email(applicant_email, applicant_name, scheduled_date, scheduled_time, status_val):
    """Sends asynchronous email notification when an applicant's schedule is updated."""
    subject = f"Application Schedule Update – AMORES"
    
    formatted_date = scheduled_date
    if scheduled_date:
        try:
            from datetime import datetime
            date_obj = datetime.strptime(str(scheduled_date), "%Y-%m-%d")
            formatted_date = date_obj.strftime("%d/%m/%Y")
        except Exception:
            pass

    message = (
        f"Hi {applicant_name},\n\n"
        f"You have been scheduled for the {status_val} step in your application.\n\n"
        f"Date: {formatted_date}\n"
    )
    if scheduled_time:
        formatted_time = scheduled_time
        try:
            from datetime import datetime
            time_obj = datetime.strptime(str(scheduled_time)[:5], "%H:%M")
            formatted_time = time_obj.strftime("%I:%M %p")
        except Exception:
            pass
        message += f"Time: {formatted_time}\n"
        
    message += (
        f"\nPlease ensure you arrive on time and bring any necessary requirements.\n\n"
        f"Best regards,\n"
        f"PNP-AMORES System"
    )
    
    try:
        send_mail_async(
            subject=subject,
            message=message,
            from_email=settings.DEFAULT_FROM_EMAIL,
            recipient_list=[applicant_email],
            fail_silently=False,
        )
    except Exception as e:
        print(f"[AMORES] Schedule email send failed for {applicant_email}: {e}", flush=True)

@api_view(['PUT'])
@permission_classes([IsRecruiterOrInterviewer])
def update_applicant_status(request, pk):
    try:
        applicant = Applicant.objects.get(pk=pk)
        application = applicant.active_application
        if not application:
            return Response({"error": "No active application found"}, status=status.HTTP_404_NOT_FOUND)
        
        evaluation, _ = Evaluation.objects.get_or_create(application=application)
        
        new_status = request.data.get('status')
        if new_status:
            application.status = new_status
        
        if new_status == 'Failed':
            application.rejection_reason = request.data.get('rejection_reason')

        # Evaluation fields
        eval_fields = [
            'bmi_height', 'bmi_weight', 'bmi_result', 'pat_score', 
            'pat_pushups', 'pat_pushups_passed', 'pat_situps', 
            'pat_situps_passed', 'pat_run', 'pat_run_passed',
            'psychological_result', 'medical_result', 'drug_test_result', 
            'final_interview_score', 'fi_patriotism', 'fi_integrity',
            'fi_awareness', 'fi_communication'
        ]
        for field in eval_fields:
            if field in request.data:
                setattr(evaluation, field, request.data.get(field))
        evaluation.save()

        old_scheduled_date = application.scheduled_date
        old_scheduled_time = application.scheduled_time

        # Application fields
        app_fields = ['scheduled_date', 'scheduled_time', 'evaluation_remarks', 'oath_taking_date']
        for field in app_fields:
            if field in request.data:
                setattr(application, field, request.data.get(field))
        application.save()
        
        # Email Notification if schedule is updated
        schedule_updated = False
        if application.scheduled_date and (application.scheduled_date != old_scheduled_date or application.scheduled_time != old_scheduled_time):
            if 'scheduled_date' in request.data:
                schedule_updated = True
        
        if schedule_updated:
            import threading
            threading.Thread(
                target=send_schedule_email,
                args=(applicant.email, f"{applicant.first_name} {applicant.last_name}", application.scheduled_date, application.scheduled_time, application.status)
            ).start()

        # Email Notification if status is updated
        if new_status:
            remarks = application.rejection_reason if new_status == 'Failed' else (application.evaluation_remarks or f"You have progressed to the next step: {new_status}")
            import threading
            threading.Thread(
                target=send_status_update_email,
                args=(applicant.email, f"{applicant.first_name} {applicant.last_name}", new_status, remarks)
            ).start()
        
        performer_email = get_user_from_request(request)
        performer = User.objects.filter(email=performer_email).first()
        create_audit_log(performer, 'STATUS_UPDATE', f"Applicant '{applicant.first_name} {applicant.last_name}' status updated to '{application.status}'", performer_name=performer_email if not performer else None)

        return Response({
            "message": "Status updated successfully",
            "new_status": application.status
        }, status=status.HTTP_200_OK)
        
    except Applicant.DoesNotExist:
        return Response({"error": "Applicant not found"}, status=status.HTTP_404_NOT_FOUND)

@api_view(['GET'])
def retrieve_application_data(request):
  code = request.query_params.get('code', None)
  if not code:
    return Response({"error": "Tracking code is required"}, status=status.HTTP_400_BAD_REQUEST)
  
  try:
    application = Application.objects.get(tracking_code=code.upper())
    
    if application.status != 'Failed':
      return Response({"error": "Only applicants with a 'Failed' status are eligible for re-application."}, status=status.HTTP_400_BAD_REQUEST)
      
    applicant = application.applicant
    
    data = {
      "lastname": applicant.last_name,
      "firstname": applicant.first_name,
      "middle_name": applicant.middle_name,
      "birthdate": applicant.birthdate,
      "barangay": applicant.barangay,
      "city_municipality": applicant.city_municipality,
      "province": applicant.province,
      "zip_code": applicant.zip_code,
      "gender": applicant.gender,
      "cp_number": applicant.contact_number,
      "program": applicant.program,
      "name_of_school": applicant.name_of_school,
      "date_graduated": applicant.date_graduated,
      "email": applicant.email,
      "latin_honor": applicant.latin_honor,
      "pag_ibig_number": applicant.pag_ibig_number,
      "phil_health_id_num": applicant.phil_health_id_num,
      "height": applicant.height,
      "tribe_affiliated": getattr(applicant, 'tribe', ''),
      "tracking_code": application.tracking_code,
      "documents": ApplicantDocumentSerializer(applicant.documents.all(), many=True).data
    }
    
    return Response(data, status=status.HTTP_200_OK)
    
  except Application.DoesNotExist:
    return Response({"error": "Invalid tracking code."}, status=status.HTTP_404_NOT_FOUND)

@api_view(['GET'])
def track_application_status(request):
  code = request.query_params.get('code', None)
  if not code:
    return Response({"error": "Tracking code is required"}, status=status.HTTP_400_BAD_REQUEST)
  
  try:
    application = Application.objects.get(tracking_code=code)
    applicant = application.applicant
    evaluation = getattr(application, 'evaluation', None)

    return Response({
        "tracking_code": application.tracking_code,
        "applicant_id": applicant.id,
        "full_name": f"{applicant.first_name} {applicant.last_name}",
        "firstname": applicant.first_name,
        "lastname": applicant.last_name,
        "status": application.status,
        "program": applicant.program,
        "date_applied": applicant.created_at,
        "rejection_reason" : application.rejection_reason,
        "scheduled_date": application.scheduled_date,
        "scheduled_time": application.scheduled_time,
        "drug_test_result": evaluation.drug_test_result if evaluation else None,
        "bmi_height": evaluation.bmi_height if evaluation else None,
        "bmi_weight": evaluation.bmi_weight if evaluation else None,
        "pat_score": evaluation.pat_score if evaluation else None,
        "pat_pushups": evaluation.pat_pushups if evaluation else None,
        "pat_situps": evaluation.pat_situps if evaluation else None,
        "pat_run": evaluation.pat_run if evaluation else None,
        "pat_pushups_passed": evaluation.pat_pushups_passed if evaluation else None,
        "pat_situps_passed": evaluation.pat_situps_passed if evaluation else None,
        "pat_run_passed": evaluation.pat_run_passed if evaluation else None,
        "psychological_result": evaluation.psychological_result if evaluation else None,
        "medical_result": evaluation.medical_result if evaluation else None,
        "final_interview_score": evaluation.final_interview_score if evaluation else None,
        "oath_taking_date": application.oath_taking_date,
        "evaluation_remarks": application.evaluation_remarks
    }, status=status.HTTP_200_OK)
  
  except Application.DoesNotExist:
    return Response({"error": "Invalid tracking code."}, status=status.HTTP_404_NOT_FOUND)

@api_view(['POST'])
@parser_classes([MultiPartParser, FormParser])
def upload_document(request):
    if not is_application_allowed():
        return Response({"error": "Application period is currently closed."}, status=status.HTTP_403_FORBIDDEN)

    serializer = ApplicantDocumentSerializer(data=request.data, context={'request': request})
    if serializer.is_valid():
        document = serializer.save()
        
        # Trigger background OCR processing
        try:
            import threading
            from .services_ocr import process_document_ocr
            threading.Thread(target=process_document_ocr, args=(document.id,)).start()
        except Exception as e:
            print(f"Failed to start OCR thread: {e}")
            
        return Response(serializer.data, status=status.HTTP_201_CREATED)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

@api_view(['GET'])
def get_applicant_documents(request, applicant_id):
    from django.utils import timezone
    now = timezone.now()
    
    # Auto-cleanup expired documents
    expired_docs = ApplicantDocument.objects.filter(applicant_id=applicant_id, expiration_date__lte=now)
    for doc in expired_docs:
        if doc.file:
            doc.file.delete(save=False)
        doc.delete()

    documents = ApplicantDocument.objects.filter(applicant_id=applicant_id)
    
    # Automatically trigger OCR re-scan in background threads when recruiter views or refreshes details page
    try:
        from .services_ocr import process_document_ocr
        import threading
        for doc in documents:
            threading.Thread(target=process_document_ocr, args=(doc.id,)).start()
    except Exception as e:
        print(f"Failed to trigger auto re-scan on load: {e}")
        
    serializer = ApplicantDocumentSerializer(documents, many=True, context={'request': request})
    return Response(serializer.data)

@api_view(['POST'])
def scan_document(request, doc_id):
    try:
        from .services_ocr import process_document_ocr
        process_document_ocr(doc_id)
        
        # Fetch the updated document
        document = ApplicantDocument.objects.get(id=doc_id)
        serializer = ApplicantDocumentSerializer(document, context={'request': request})
        return Response(serializer.data, status=status.HTTP_200_OK)
    except Exception as e:
        return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@api_view(['GET'])
@permission_classes([IsRecruiterOrInterviewer])
def get_active_applicants(request):
    # Applicants whose active_application is not 'Failed'
    applicants = get_applicant_queryset().exclude(applications__status='Failed').distinct()
    serializer = ApplicantFullSerializer(applicants, many=True)
    return Response(serializer.data)

@api_view(['GET'])
@permission_classes([IsRecruiterOrInterviewer])
def get_all_applicants(request):
    print(f"[DEBUG get_all_applicants] user: {request.user}, is_auth: {request.user.is_authenticated}, role: {getattr(request.user, 'role', None)}")
    # Fetch all applicants including declined/rejected ones
    applicants = get_applicant_queryset().order_by('-created_at')
    serializer = ApplicantFullSerializer(applicants, many=True)
    return Response(serializer.data)

@api_view(['GET'])
@permission_classes([AllowAny])
def get_system_settings(request):
    settings_obj, created = SystemSettings.objects.get_or_create(id=1)
    
    # Auto-close if end date passed
    today = datetime.date.today()
    if settings_obj.is_application_open and settings_obj.application_end_date and today > settings_obj.application_end_date:
        settings_obj.is_application_open = False
        
        # Automatic batch logic:
        # If we reached end of Batch 1, go to Batch 2
        # If we reached end of Batch 2, reset to Batch 1 and clear dates
        if settings_obj.current_batch == 2:
            settings_obj.current_batch = 1
            settings_obj.application_start_date = None
            settings_obj.application_end_date = None
            log_msg = "Applications automatically closed (Batch 2 ended). Resetting to Batch 1 and clearing dates."
        else:
            settings_obj.current_batch = 2
            log_msg = "Applications automatically closed (Batch 1 ended). Moving to Batch 2."
            
        settings_obj.save()
        create_audit_log(None, 'SYSTEM', log_msg, performer_name='System')

    serializer = SystemSettingsSerializer(settings_obj)
    return Response(serializer.data)

@api_view(['PUT'])
@permission_classes([IsAdministrator])
def update_system_settings(request):
    settings_obj, created = SystemSettings.objects.get_or_create(id=1)
    # Check for batch increment triggers:
    # 1. Manual toggle from False to True
    was_closed = not settings_obj.is_application_open
    is_opening_manually = request.data.get('is_application_open') == True or request.data.get('is_application_open') == 'true'
    
    # 2. Date range change (new start date set after old end date passed)
    new_start_str = request.data.get('application_start_date')
    new_start_date = datetime.datetime.strptime(new_start_str, '%Y-%m-%d').date() if new_start_str else None
    
    is_new_date_range = False
    if new_start_date and settings_obj.application_end_date:
        if new_start_date > settings_obj.application_end_date:
            is_new_date_range = True

    if (was_closed and is_opening_manually) or is_new_date_range:
        # If we are starting a new application window, increment batch or reset to 1
        if settings_obj.current_batch == 2:
            settings_obj.current_batch = 1
            # We don't clear dates here because the admin is explicitly saving new dates in this PUT request
            log_msg = "New application window opened. Reset to Batch 1."
        else:
            settings_obj.current_batch = 2
            log_msg = "New application window opened. Moved to Batch 2."
            
        settings_obj.save()
        create_audit_log(None, 'BATCH_INCREMENT', log_msg, performer_name='System')
    serializer = SystemSettingsSerializer(settings_obj, data=request.data)
    if serializer.is_valid():
        serializer.save()
        performer_email = get_user_from_request(request)
        performer = User.objects.filter(email=performer_email).first()
        create_audit_log(performer, 'SETTINGS_UPDATE', f"System settings updated. Current Batch: {settings_obj.current_batch}", performer_name=performer_email if not performer else None)
        return Response(serializer.data)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

@api_view(['GET'])
@permission_classes([IsAdministrator])
def get_audit_logs(request):
    logs = AuditLog.objects.all().order_by('-timestamp')[:500]
    serializer = AuditLogSerializer(logs, many=True)
    return Response(serializer.data)

@api_view(['GET'])
@permission_classes([IsSuperAdmin])
def get_global_settings(request):
    from .models import GlobalSetting
    from .serializers import GlobalSettingSerializer
    settings = GlobalSetting.objects.all()
    serializer = GlobalSettingSerializer(settings, many=True)
    return Response(serializer.data)

@api_view(['POST', 'PUT'])
@permission_classes([IsSuperAdmin])
def update_global_setting(request):
    from .models import GlobalSetting
    from .serializers import GlobalSettingSerializer
    from .audit_logger import log_action
    
    key = request.data.get('key')
    if not key:
        return Response({"error": "Key is required"}, status=status.HTTP_400_BAD_REQUEST)
        
    setting, created = GlobalSetting.objects.get_or_create(key=key, defaults={
        'value': request.data.get('value', ''),
        'description': request.data.get('description', '')
    })
    
    if not created:
        old_val = setting.value
        setting.value = request.data.get('value', setting.value)
        setting.description = request.data.get('description', setting.description)
        if 'is_active' in request.data:
            setting.is_active = request.data['is_active']
        setting.save()
        
        log_action(
            user=request.user,
            action="UPDATE",
            target_resource="GlobalSetting",
            details=f"Updated global setting {key}",
            changes={"old": old_val, "new": setting.value},
            ip_address=request.META.get('REMOTE_ADDR')
        )
    else:
        log_action(
            user=request.user,
            action="CREATE",
            target_resource="GlobalSetting",
            details=f"Created global setting {key}",
            changes={"new": setting.value},
            ip_address=request.META.get('REMOTE_ADDR')
        )
        
    return Response(GlobalSettingSerializer(setting).data)

@api_view(['POST'])
@permission_classes([IsAdministrator])
def backup_database(request):
    db_settings = settings.DATABASES.get('default', {})
    engine = db_settings.get('ENGINE', '')
    if not (engine.endswith('postgresql') or engine.endswith('sqlite3')):
        return Response({"error": "Unsupported database configuration."}, status=status.HTTP_404_NOT_FOUND)

    try:
        backup_path, content_type = create_database_backup(db_settings)
        with open(backup_path, 'rb') as backup_file:
            backup_content = backup_file.read()

        performer_email = get_user_from_request(request)
        performer = User.objects.filter(email=performer_email).first()
        create_audit_log(
            performer,
            'BACKUP',
            "System database backup exported.",
            performer_name=performer_email if not performer else None,
        )

        response = HttpResponse(backup_content, content_type=content_type)
        response['Content-Disposition'] = f'attachment; filename="{os.path.basename(backup_path)}"'
        return response
    except Exception as e:
        return Response({"error": f"Backup failed: {str(e)}"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@api_view(['POST'])
@parser_classes([MultiPartParser, FormParser])
def restore_database(request):
    file_obj = request.FILES.get('backup_file')
    if not file_obj:
        return Response({"error": "No backup file provided."}, status=status.HTTP_400_BAD_REQUEST)

    backup_format = detect_backup_format(file_obj.name)
    if backup_format is None:
        return Response({"error": "Invalid backup file."}, status=status.HTTP_400_BAD_REQUEST)

    db_settings = settings.DATABASES.get('default', {})
    engine = db_settings.get('ENGINE', '')
    if not (engine.endswith('postgresql') or engine.endswith('sqlite3')):
        return Response({"error": "Unsupported database configuration."}, status=status.HTTP_400_BAD_REQUEST)

    temp_dir = tempfile.gettempdir()
    temp_backup_path = os.path.join(temp_dir, file_obj.name)
    model_classes = {
        'User': User,
        'Applicant': Applicant,
        'Application': Application,
        'Evaluation': Evaluation,
        'ApplicantDocument': ApplicantDocument,
        'SystemSettings': SystemSettings,
        'AuditLog': AuditLog,
    }
    try:
        with open(temp_backup_path, 'wb+') as destination:
            for chunk in file_obj.chunks():
                destination.write(chunk)

        restore_database_backup(temp_backup_path, backup_format, db_settings, model_classes)

        performer_email = get_user_from_request(request)
        performer = User.objects.filter(email=performer_email).first()
        create_audit_log(performer, 'RESTORE', "System database restored.", performer_name=performer_email if not performer else None)
        return Response({"message": "Database restored successfully."}, status=status.HTTP_200_OK)
    except Exception as e:
        return Response({"error": f"Restore failed: {str(e)}"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

def send_screening_notification(applicant_email, applicant_name, status, remarks):
    """Sends asynchronous email notification for initial screening result."""
    subject = f"Initial Screening Result - AMORES"
    message = (
        f"Hi {applicant_name},\n\n"
        f"Your application has been evaluated in the initial screening phase.\n"
        f"Status: {status}\n\n"
    )
    if status == 'Failed':
        message += f"Remarks: {remarks}\n\n"
    
    message += (
        f"Thank you,\n"
        f"PNP-AMORES System"
    )
    
    try:
        send_mail_async(
            subject=subject,
            message=message,
            from_email=settings.DEFAULT_FROM_EMAIL,
            recipient_list=[applicant_email],
            fail_silently=False,
        )
    except Exception as e:
        print(f"[AMORES] Screening email send failed for {applicant_email}: {e}", flush=True)


@api_view(['POST'])
@permission_classes([IsRecruiterOrInterviewer])
def screen_initial_application(request):
    applicant_id = request.data.get('application_id') # We'll keep the key the same to avoid frontend breaking but it represents applicant_id
    if not applicant_id:
        return Response({"error": "application_id is required."}, status=status.HTTP_400_BAD_REQUEST)
        
    try:
        applicant = Applicant.objects.get(id=applicant_id)
        application = applicant.active_application
        if not application:
            return Response({"error": "Application not found for this applicant."}, status=status.HTTP_404_NOT_FOUND)
    except Applicant.DoesNotExist:
        return Response({"error": "Applicant not found."}, status=status.HTTP_404_NOT_FOUND)

    performer_email = get_user_from_request(request)
    performer = User.objects.filter(email=performer_email).first()

    try:
        result = evaluate_initial_application_status(application, request.data, performer)
    except Exception as e:
        return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    # Asynchronous Notification
    applicant = application.applicant
    threading.Thread(
        target=send_screening_notification, 
        args=(applicant.email, f"{applicant.first_name} {applicant.last_name}", result['updated_status'], result['screening_remarks'])
    ).start()

    return Response(result, status=status.HTTP_200_OK)

class SubmitApplicationView(APIView):
    permission_classes = [AllowAny]
    parser_classes = [MultiPartParser, JSONParser, FormParser]

    def post(self, request, *args, **kwargs):
        try:
            with transaction.atomic():
                email = request.data.get('email')
                applicant, created = Applicant.objects.get_or_create(
                    email=email,
                    defaults={
                        'first_name': request.data.get('first_name', ''),
                        'last_name': request.data.get('last_name', ''),
                        'program': request.data.get('program', ''),
                        'height': request.data.get('height', ''),
                        'gender': request.data.get('gender', ''),
                        'contact_number': request.data.get('contact_number', ''),
                        'pag_ibig_number': request.data.get('pag_ibig_number', ''),
                        'phil_health_id_num': request.data.get('phil_health_id_num', ''),
                    }
                )
                
                # Check for existing pending application
                if not created:
                    existing_app = applicant.applications.exclude(status='Failed').first()
                    if existing_app:
                        return Response({'error': 'You already have an active application.'}, status=status.HTTP_400_BAD_REQUEST)
                    
                    # They are re-applying, so update their created_at date
                    from django.utils import timezone
                    now = timezone.now()
                    applicant.created_at = now
                    applicant.save()
                    Applicant.objects.filter(id=applicant.id).update(created_at=now)
                
                application = Application.objects.create(
                    applicant=applicant,
                    status='New Applicant'
                )
                
                birth_cert_file = request.FILES.get('birth_certificate')
                if birth_cert_file:
                    doc = ApplicantDocument.objects.create(
                        applicant=applicant,
                        document_type='BIRTH_CERT',
                        file=birth_cert_file
                    )
                    from .services_ocr import process_document_ocr
                    import threading
                    transaction.on_commit(
                        lambda: threading.Thread(target=process_document_ocr, args=(doc.id,)).start()
                    )
                screening_result = evaluate_initial_application_status(application, request.data, performer_user=None)
                
                return Response(screening_result, status=status.HTTP_201_CREATED)
                
        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)

@api_view(['PATCH'])
def reapply_update_view(request, tracking_code):
    if not is_application_allowed():
        return Response({"error": "Application period is currently closed."}, status=status.HTTP_403_FORBIDDEN)

    try:
        application = Application.objects.get(tracking_code=tracking_code)
        applicant = application.applicant
    except Application.DoesNotExist:
        return Response({"error": "Application not found."}, status=status.HTTP_404_NOT_FOUND)

    serializer = ApplicantSerializer(
        applicant, 
        data=request.data, 
        partial=True, 
        context={'is_reapply': True}
    )

    if serializer.is_valid():
        serializer.save()
        
        # Reset the application status to New Applicant
        application.status = "New Applicant"
        application.rejection_reason = None
        
        from .models import SystemSettings
        settings_obj = SystemSettings.objects.first()
        current_batch = settings_obj.current_batch if settings_obj else 1
        application.batch = current_batch
        from django.utils import timezone
        now = timezone.now()
        
        # Set re-applied flag on applicant
        applicant.is_reapplied = True
        applicant.save()
        
        application.created_at = now
        application.save()

        # Force database update for auto_now_add fields
        Application.objects.filter(id=application.id).update(created_at=now)
        
        # Clear the old evaluation results for a fresh start
        if hasattr(application, 'evaluation'):
            application.evaluation.delete()
        from .models import Evaluation
        Evaluation.objects.create(application=application)
        
        # Send confirmation email
        send_application_received_email(
            name=f"{applicant.first_name} {applicant.last_name}",
            email=applicant.email,
            tracking_code=application.tracking_code,
            is_reapply=True
        )
        
        return Response({
            "id": applicant.id,
            "tracking_code": application.tracking_code,
            "message": "Re-application successful!",
            "data": serializer.data
        })
    
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

# --- System Operations & Monitoring ---

@api_view(['GET'])
@permission_classes([IsAuthenticated, IsSuperAdmin])
def get_system_health(request):
    try:
        from .health_metrics import get_system_health
        health_data = get_system_health()
        return Response(health_data, status=status.HTTP_200_OK)
    except Exception as e:
        return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)



# --- Data Privacy & Governance ---

@api_view(['POST'])
@permission_classes([IsAuthenticated, IsSuperAdmin])
def anonymize_applicant(request):
    applicant_id = request.data.get('applicant_id')
    try:
        applicant = Applicant.objects.get(id=applicant_id)
        # Scrub PII
        old_name = f"{applicant.first_name} {applicant.last_name}"
        applicant.first_name = "ANONYMIZED"
        applicant.last_name = "ANONYMIZED"
        applicant.middle_name = ""
        applicant.email = f"anonymized_{applicant.id}@deleted.local"
        applicant.contact_number = f"000000{applicant.id}"
        applicant.pag_ibig_number = f"ANON-{applicant.id}"
        applicant.phil_health_id_num = f"ANON-{applicant.id}"
        applicant.save()
        
        log_action(request.user, "APPLICANT_ANONYMIZE", f"Anonymized applicant {old_name} (ID: {applicant_id})", request, target_resource="Applicant")
        return Response({"message": "Applicant data has been scrubbed successfully."}, status=status.HTTP_200_OK)
    except Applicant.DoesNotExist:
        return Response({"error": "Applicant not found."}, status=status.HTTP_404_NOT_FOUND)

@api_view(['GET'])
@permission_classes([IsAuthenticated, IsSuperAdmin])
def export_applicant_data(request, applicant_id):
    try:
        applicant = Applicant.objects.get(id=applicant_id)
        serializer = ApplicantSerializer(applicant)
        
        log_action(request.user, "APPLICANT_EXPORT", f"Exported data for applicant (ID: {applicant_id})", request, target_resource="Applicant")
        return Response(serializer.data, status=status.HTTP_200_OK)
    except Applicant.DoesNotExist:
        return Response({"error": "Applicant not found."}, status=status.HTTP_404_NOT_FOUND)

import secrets
import string
from .models import ApplicationDraft

def send_draft_code_email(email, draft_code, name):
    """Sends draft code to applicant email."""
    subject = "Application Draft Saved – AMORES"
    message = (
        f"Hi {name},\n\n"
        f"You have successfully saved your application progress. You can retrieve and continue your application at any time using your Draft Code.\n\n"
        f"Your Draft Code is: {draft_code}\n\n"
        f"Please do not share this code with anyone.\n\n"
        f"Regards,\nAMORES Team"
    )
    try:
        from django.core.mail import send_mail
        from django.conf import settings
        send_mail(
            subject=subject,
            message=message,
            from_email=settings.DEFAULT_FROM_EMAIL,
            recipient_list=[email],
            fail_silently=False,
        )
    except Exception as e:
        print(f"[AMORES] Draft code email send failed for {email}: {e}", flush=True)

@api_view(['POST'])
def save_application_draft(request):
    try:
        form_data = request.data
        
        # generate a random draft code, e.g. DRF-XXXXXX
        chars = string.ascii_uppercase + string.digits
        draft_code = "DRF-" + ''.join(secrets.choice(chars) for _ in range(6))
        
        # Ensure it's unique
        while ApplicationDraft.objects.filter(draft_code=draft_code).exists():
            draft_code = "DRF-" + ''.join(secrets.choice(chars) for _ in range(6))
            
        draft = ApplicationDraft.objects.create(
            draft_code=draft_code,
            form_data=form_data
        )
        
        email = form_data.get('email', '').strip()
        firstname = form_data.get('firstname', '').strip()
        lastname = form_data.get('lastname', '').strip()
        name = "Applicant"
        if firstname or lastname:
            name = f"{firstname} {lastname}".strip()
            
        if email:
            import threading
            threading.Thread(
                target=send_draft_code_email,
                args=(email, draft.draft_code, name)
            ).start()
        
        return Response({
            "message": "Draft saved successfully",
            "draft_code": draft.draft_code
        }, status=status.HTTP_201_CREATED)
    except Exception as e:
        return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)

@api_view(['GET'])
def retrieve_application_draft(request, draft_code):
    try:
        draft = ApplicationDraft.objects.get(draft_code=draft_code)
        return Response({
            "form_data": draft.form_data
        }, status=status.HTTP_200_OK)
    except ApplicationDraft.DoesNotExist:
        return Response({"error": "Draft not found"}, status=status.HTTP_404_NOT_FOUND)