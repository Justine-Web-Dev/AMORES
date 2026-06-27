from django.shortcuts import render
from .serializers import (
    UsersSerializers, ApplicantSerializer, ApplicationSerializer, 
    EvaluationSerializer, ApplicantFullSerializer, ApplicantDocumentSerializer, 
    SystemSettingsSerializer, AuditLogSerializer
)
from .models import User, Applicant, Application, Evaluation, ApplicantDocument, SystemSettings, AuditLog
from .utils import create_audit_log, get_user_from_request, detect_backup_format, import_sqlite_backup_to_postgres
from rest_framework.decorators import api_view, parser_classes
from rest_framework.response import Response
from rest_framework import status
from rest_framework.parsers import MultiPartParser, FormParser
from django.contrib.auth.hashers import check_password, make_password

import jwt
import datetime
import os
from django.conf import settings
from django.http import FileResponse
from django.db import connections
from django.db.models import Prefetch
import subprocess
import tempfile

# Create your views here.

@api_view(['GET'])
def get_user(request):
  is_archived = request.query_params.get('archived', 'false') == 'true'
  users = User.objects.filter(is_archived=is_archived)
  serializers = UsersSerializers(users, many=True)
  return Response(serializers.data)

@api_view(['POST'])
def register_user(request):
  username = request.data.get('username')
  name = request.data.get('name')

  if User.objects.filter(username=username).exists():
      return Response({"error": f"Username '{username}' is already taken."}, status=status.HTTP_400_BAD_REQUEST)
  
  if User.objects.filter(name=name).exists():
      return Response({"error": f"A personnel with the name '{name}' is already registered."}, status=status.HTTP_400_BAD_REQUEST)

  serializers = UsersSerializers(data=request.data)
  if serializers.is_valid():
    user = serializers.save()
    performer_username = get_user_from_request(request)
    performer = User.objects.filter(username=performer_username).first()
    
    create_audit_log(
        performer, 
        'USER_REGISTRATION', 
        f"New user '{user.username}' registered as {user.role}.",
        performer_name=performer_username if not performer else None
    )
    return Response(serializers.data, status=status.HTTP_201_CREATED)
  return Response(serializers.errors, status=status.HTTP_400_BAD_REQUEST)

@api_view(['POST'])
def login_user(request):
  username = request.data.get('username')
  password = request.data.get('password')

  try:
    user = User.objects.get(username=username, is_archived=False)
  except User.DoesNotExist:
    return Response({'error': 'User not found'}, status=status.HTTP_404_NOT_FOUND)
  
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
    "username": user.username,
    "exp": datetime.datetime.utcnow() + datetime.timedelta(hours=1)
  }
  
  token = jwt.encode(payload, settings.SECRET_KEY, algorithm="HS256")
  create_audit_log(user, 'LOGIN', f"User '{user.username}' logged in successfully.")

  return Response({
    "token": token,
    "username": user.username,
  })

@api_view(['GET','PUT','DELETE'])
def update_user(request, pk):
  try:
    user_obj = User.objects.get(pk=pk)
  except User.DoesNotExist:
    return Response(status=status.HTTP_404_NOT_FOUND)

  if request.method == 'GET':
    serializers = UsersSerializers(user_obj)
    return Response(serializers.data)
  elif request.method == 'PUT':
    target_username = user_obj.username
    new_username = request.data.get('username')
    new_name = request.data.get('name')

    if User.objects.filter(username=new_username).exclude(pk=pk).exists():
        return Response({"error": f"Username '{new_username}' is already taken."}, status=status.HTTP_400_BAD_REQUEST)
    
    if User.objects.filter(name=new_name).exclude(pk=pk).exists():
        return Response({"error": f"A personnel with the name '{new_name}' is already registered."}, status=status.HTTP_400_BAD_REQUEST)

    serializers = UsersSerializers(user_obj, data=request.data)
    if serializers.is_valid():
      serializers.save()
      performer_username = get_user_from_request(request)
      performer = User.objects.filter(username=performer_username).first()
      create_audit_log(performer, 'USER_UPDATE', f"User '{target_username}' details updated.", performer_name=performer_username if not performer else None)
      return Response(serializers.data)
    return Response(serializers.errors, status=status.HTTP_400_BAD_REQUEST)
  elif request.method == 'DELETE':
    username = user_obj.username
    user_obj.is_archived = True
    user_obj.save()
    performer_username = get_user_from_request(request)
    performer = User.objects.filter(username=performer_username).first()
    create_audit_log(performer, 'USER_ARCHIVE', f"User '{username}' archived.", performer_name=performer_username if not performer else None)
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
       
       return Response({
                 "id": applicant.id,
                 "tracking_code": application.tracking_code, 
                 "message": "Success"
       }, status=status.HTTP_201_CREATED)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

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
        
        performer_username = get_user_from_request(request)
        performer = User.objects.filter(username=performer_username).first()
        create_audit_log(performer, 'STATUS_UPDATE', f"Applicant '{applicant.first_name} {applicant.last_name}' status updated to '{application.status}'", performer_name=performer_username if not performer else None)

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
        serializer.save()
        return Response(serializer.data, status=status.HTTP_201_CREATED)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

@api_view(['GET'])
def get_applicant_documents(request, applicant_id):
    documents = ApplicantDocument.objects.filter(applicant_id=applicant_id)
    serializer = ApplicantDocumentSerializer(documents, many=True, context={'request': request})
    return Response(serializer.data)

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
        performer_username = get_user_from_request(request)
        performer = User.objects.filter(username=performer_username).first()
        create_audit_log(performer, 'SETTINGS_UPDATE', f"System settings updated. Current Batch: {settings_obj.current_batch}", performer_name=performer_username if not performer else None)
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
    if db_settings.get('ENGINE', '').endswith('postgresql'):
        backup_dir = tempfile.gettempdir()
        backup_path = os.path.join(backup_dir, f"amores_backup_{datetime.datetime.now().strftime('%Y%m%d_%H%M%S')}.sql")
        try:
            command = ['pg_dump', '--dbname=postgresql://{user}:{password}@{host}:{port}/{name}'.format(
                user=db_settings.get('USER', ''),
                password=db_settings.get('PASSWORD', ''),
                host=db_settings.get('HOST', 'localhost'),
                port=db_settings.get('PORT', '5432'),
                name=db_settings.get('NAME', ''),
            ), '-f', backup_path]
            subprocess.run(command, check=True, capture_output=True, text=True)
            with open(backup_path, 'rb') as backup_file:
                response = FileResponse(backup_file, content_type='application/sql')
                response['Content-Disposition'] = f'attachment; filename="{os.path.basename(backup_path)}"'
                performer_username = get_user_from_request(request)
                performer = User.objects.filter(username=performer_username).first()
                create_audit_log(performer, 'BACKUP', "System database backup exported.", performer_name=performer_username if not performer else None)
                return response
        except Exception as e:
            return Response({"error": f"Backup failed: {str(e)}"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    return Response({"error": "PostgreSQL database configuration not found."}, status=status.HTTP_404_NOT_FOUND)

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
    if not db_settings.get('ENGINE', '').endswith('postgresql'):
        return Response({"error": "This restore flow only supports PostgreSQL databases."}, status=status.HTTP_400_BAD_REQUEST)

    temp_dir = tempfile.gettempdir()
    temp_backup_path = os.path.join(temp_dir, file_obj.name)
    try:
        with open(temp_backup_path, 'wb+') as destination:
            for chunk in file_obj.chunks():
                destination.write(chunk)

        if backup_format == 'postgresql':
            connections.close_all()
            restore_command = ['psql', '--dbname=postgresql://{user}:{password}@{host}:{port}/{name}'.format(
                user=db_settings.get('USER', ''),
                password=db_settings.get('PASSWORD', ''),
                host=db_settings.get('HOST', 'localhost'),
                port=db_settings.get('PORT', '5432'),
                name=db_settings.get('NAME', ''),
            ), '-f', temp_backup_path]
            subprocess.run(restore_command, check=True, capture_output=True, text=True)
        else:
            import_sqlite_backup_to_postgres(temp_backup_path, [
                User,
                Applicant,
                Application,
                Evaluation,
                ApplicantDocument,
                SystemSettings,
                AuditLog,
            ])
            
        performer_username = get_user_from_request(request)
        performer = User.objects.filter(username=performer_username).first()
        create_audit_log(performer, 'RESTORE', "System database restored.", performer_name=performer_username if not performer else None)
        return Response({"message": "Database restored successfully."}, status=status.HTTP_200_OK)
    except Exception as e:
        return Response({"error": f"Restore failed: {str(e)}"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
