from django.shortcuts import render
from django.db import transaction
from .serializers import (
    UsersSerializers, ApplicantSerializer, ApplicantFullSerializer, ApplicantDocumentSerializer, 
    SystemSettingsSerializer, AuditLogSerializer
)
from .models import User, Applicant, Application, Evaluation, ApplicantDocument, SystemSettings, AuditLog
from .utils import (
    create_audit_log,
    get_user_from_request,
    detect_backup_format,
    create_database_backup,
    restore_database_backup,
    send_mail_async,
)
from .services import evaluate_initial_application_status
from .screening import evaluate_initial_application_status
from rest_framework.decorators import api_view, parser_classes
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.parsers import MultiPartParser, FormParser, JSONParser
from django.contrib.auth.hashers import check_password, make_password

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

def send_welcome_email(name, email, raw_password):
    """Send new user's credentials via Django's built-in email backend.
    With the console backend this prints to the Django terminal (free, no credentials)."""
    subject = f"Welcome to AMORES – Account Created for {name}"
    message = (
        f"Hi {name},\n\n"
        f"Your AMORES account has been successfully created.\n\n"
        f"----------------------------------------\n"
        f"YOUR LOGIN CREDENTIALS:\n"
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

def send_application_received_email(name, email, tracking_code):
    """Send confirmation email to applicants with their tracking code."""
    subject = f"Application Received – AMORES"
    message = (
        f"Hi {name},\n\n"
        f"We have successfully received your application for the Philippine National Police.\n\n"
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
        f"If you did not make this change, please contact the system administrator immediately.\n\n"
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
def get_user(request):
  is_archived = request.query_params.get('archived', 'false') == 'true'
  users = User.objects.filter(is_archived=is_archived)
  serializers = UsersSerializers(users, many=True)
  return Response(serializers.data)

@api_view(['POST'])
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
    registration_data['password'] = make_password(raw_password)
    if is_system_generated:
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
        send_welcome_email(name=user.name, email=user.email, raw_password=raw_password)
        
        response_data = serializers.data

        # If the frontend didn't supply a password, pass back the raw temporary string
        if not request.data.get('password'):
            response_data['temporary_password'] = raw_password

        return Response(response_data, status=status.HTTP_201_CREATED)
        
    return Response(serializers.errors, status=status.HTTP_400_BAD_REQUEST)

@api_view(['POST'])
def login_user(request):
  email = request.data.get('email')
  password = request.data.get('password')

  if not email or not password:
      return Response({'error': 'Email and password are required'}, status=status.HTTP_400_BAD_REQUEST)

  try:
    user = User.objects.get(email=email, is_archived=False)
  except User.DoesNotExist:
    return Response({'error': 'Email not found'}, status=status.HTTP_404_NOT_FOUND)
  
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

  return Response({
    "token": token,
    "email": user.email,
    "role": user.role,
    "name": user.name,
    "profile_picture": user.profile_picture.url if user.profile_picture else None,
    "must_change_password": user.must_change_password,
  })



@api_view(['POST'])
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

@api_view(['GET', 'PUT', 'DELETE'])
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

    errors = []

    if not email or not contact_number or not pag_ibig_number or not phil_health_id_num:
        return Response({"error": "Email, Contact number, Pag-IBIG number, and PhilHealth ID are required."}, status=status.HTTP_400_BAD_REQUEST)

    if Applicant.objects.filter(email__iexact=email).exists():
        errors.append("An application with this email already exists.")
    if Applicant.objects.filter(contact_number=contact_number).exists():
        errors.append("An application with this contact number already exists.")
    if Applicant.objects.filter(pag_ibig_number=pag_ibig_number).exists():
        errors.append("An application with this Pag-IBIG number already exists.")
    if Applicant.objects.filter(phil_health_id_num=phil_health_id_num).exists():
        errors.append("An application with this PhilHealth ID already exists.")

    if errors:
        return Response({"errors": errors}, status=status.HTTP_409_CONFLICT)

    return Response({"valid": True, "message": "Form data is valid."}, status=status.HTTP_200_OK)

@api_view(['POST'])
def register_applicant_form(request):
    # Mapping old field names to new ones for validation and creation
    email = request.data.get('email', '').strip().lower()
    contact_number = request.data.get('cp_number', '').strip() or request.data.get('contact_number', '').strip()
    pag_ibig_number = request.data.get('pag_ibig_number', '').strip()
    phil_health_id_num = request.data.get('phil_health_id_num', '').strip()

    if not email or not contact_number or not pag_ibig_number or not phil_health_id_num:
        return Response({"error": "Email, Contact number, Pag-IBIG number, and PhilHealth ID are required."}, status=status.HTTP_400_BAD_REQUEST)

    if Applicant.objects.filter(email__iexact=email).exists():
        return Response({"error": "An application with this email already exists."}, status=status.HTTP_409_CONFLICT)
    if Applicant.objects.filter(contact_number=contact_number).exists():
        return Response({"error": "An application with this contact number already exists."}, status=status.HTTP_409_CONFLICT)
    if Applicant.objects.filter(pag_ibig_number=pag_ibig_number).exists():
        return Response({"error": "An application with this Pag-IBIG number already exists."}, status=status.HTTP_409_CONFLICT)
    if Applicant.objects.filter(phil_health_id_num=phil_health_id_num).exists():
        return Response({"error": "An application with this PhilHealth ID already exists."}, status=status.HTTP_409_CONFLICT)

    # Use serializer to handle data mapping (standardizes first_name/lastname etc)
    data = request.data.copy()
    if 'firstname' in data: data['first_name'] = data.pop('firstname')[0] if isinstance(data['firstname'], list) else data.pop('firstname')
    if 'lastname' in data: data['last_name'] = data.pop('lastname')[0] if isinstance(data['lastname'], list) else data.pop('lastname')
    if 'cp_number' in data: data['contact_number'] = data.pop('cp_number')[0] if isinstance(data['cp_number'], list) else data.pop('cp_number')
    if 'tribe_affiliated' in data: data['tribe'] = data.pop('tribe_affiliated')[0] if isinstance(data['tribe_affiliated'], list) else data.pop('tribe_affiliated')
    if 'address' in data and not data.get('address'):
        data['address'] = 'N/A'

    serializer = ApplicantSerializer(data=data)
    if serializer.is_valid():
       applicant = serializer.save()
       # Create initial application with current batch
       settings_obj = SystemSettings.objects.first()
       current_batch = settings_obj.current_batch if settings_obj else 1
       
       application = Application.objects.create(applicant=applicant, batch=current_batch)
       # Create initial evaluation linked to application
       Evaluation.objects.create(application=application)
       
       create_audit_log(None, 'APPLICANT_REGISTRATION', f"New applicant '{applicant.first_name} {applicant.last_name}' ({application.tracking_code}) registered.", performer_name='System')
       
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
    if status_val == 'Rejected' and remarks:
        message += f"Reason: {remarks}\n\n"
    elif status_val == 'Qualified':
        message += "Congratulations! You have passed the initial screening phase and are now qualified for the next steps.\n\n"
    
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

@api_view(['PUT'])
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
        
        if new_status == 'Rejected':
            application.rejection_reason = request.data.get('rejection_reason')

        # Evaluation fields
        eval_fields = [
            'bmi_height', 'bmi_weight', 'bmi_result', 'pat_score', 
            'psychological_result', 'medical_result', 'drug_test_result', 
            'final_interview_score'
        ]
        for field in eval_fields:
            if field in request.data:
                setattr(evaluation, field, request.data.get(field))
        evaluation.save()

        # Application fields
        app_fields = ['scheduled_date', 'scheduled_time', 'evaluation_remarks', 'oath_taking_date']
        for field in app_fields:
            if field in request.data:
                setattr(application, field, request.data.get(field))
        application.save()
        
        # Email Notification if status is Qualified or Rejected
        if new_status in ['Qualified', 'Rejected']:
            remarks = application.rejection_reason if new_status == 'Rejected' else application.evaluation_remarks
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
def get_active_applicants(request):
    # Applicants whose active_application is not 'Rejected'
    applicants = get_applicant_queryset().exclude(applications__status='Rejected').distinct()
    serializer = ApplicantFullSerializer(applicants, many=True)
    return Response(serializer.data)

@api_view(['GET'])
def get_all_applicants(request):
    # Fetch all applicants including declined/rejected ones
    applicants = get_applicant_queryset().order_by('-created_at')
    serializer = ApplicantFullSerializer(applicants, many=True)
    return Response(serializer.data)

@api_view(['GET'])
def get_system_settings(request):
    settings_obj, created = SystemSettings.objects.get_or_create(id=1)
    
    # Auto-close if end date passed
    today = datetime.date.today()
    if settings_obj.is_application_open and settings_obj.application_end_date and today > settings_obj.application_end_date:
        settings_obj.is_application_open = False
        settings_obj.save()
        create_audit_log(None, 'SYSTEM', "Applications automatically closed (End date reached).", performer_name='System')

    serializer = SystemSettingsSerializer(settings_obj)
    return Response(serializer.data)

@api_view(['PUT'])
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
        # Increment batch number
        settings_obj.current_batch += 1
        settings_obj.save()
        create_audit_log(None, 'BATCH_INCREMENT', f"New recruitment batch started: Batch {settings_obj.current_batch}", performer_name='System')

    serializer = SystemSettingsSerializer(settings_obj, data=request.data)
    if serializer.is_valid():
        serializer.save()
        performer_email = get_user_from_request(request)
        performer = User.objects.filter(email=performer_email).first()
        create_audit_log(performer, 'SETTINGS_UPDATE', f"System settings updated. Current Batch: {settings_obj.current_batch}", performer_name=performer_email if not performer else None)
        return Response(serializer.data)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

@api_view(['GET'])
def get_audit_logs(request):
    logs = AuditLog.objects.all().order_by('-timestamp')
    serializer = AuditLogSerializer(logs, many=True)
    return Response(serializer.data)

@api_view(['GET'])
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
    if status == 'Rejected':
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
                    existing_app = applicant.applications.exclude(status='Rejected').first()
                    if existing_app:
                        return Response({'error': 'You already have an active application.'}, status=status.HTTP_400_BAD_REQUEST)
                
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
