from django.shortcuts import render
from .serializers import (
    UsersSerializers, ApplicantSerializer, ApplicationSerializer, 
    EvaluationSerializer, ApplicantFullSerializer, ApplicantDocumentSerializer, 
    SystemSettingsSerializer, AuditLogSerializer
)
from .models import User, Applicant, Application, Evaluation, ApplicantDocument, SystemSettings, AuditLog
from .utils import create_audit_log, get_user_from_request
from rest_framework.decorators import api_view, parser_classes
from rest_framework.response import Response
from rest_framework import status
from rest_framework.parsers import MultiPartParser, FormParser

import jwt
import datetime
import os
from django.conf import settings
from django.http import FileResponse
from django.db import connections

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
  
  if user.password != password:
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

@api_view(['GET'])
def get_applicant_form(request):
  applicants = Applicant.objects.all()
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
       # Create initial application
       application = Application.objects.create(applicant=applicant)
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
        "bmi_weight": evaluation.bmi_weight if evaluation else None
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
    applicants = Applicant.objects.exclude(applications__status='Rejected').distinct()
    serializer = ApplicantFullSerializer(applicants, many=True)
    return Response(serializer.data)

@api_view(['GET'])
def get_all_applicants(request):
    # Fetch all applicants including declined/rejected ones
    applicants = Applicant.objects.all().order_by('-created_at')
    serializer = ApplicantFullSerializer(applicants, many=True)
    return Response(serializer.data)

@api_view(['GET'])
def get_system_settings(request):
    settings_obj, created = SystemSettings.objects.get_or_create(id=1)
    serializer = SystemSettingsSerializer(settings_obj)
    return Response(serializer.data)

@api_view(['PUT'])
def update_system_settings(request):
    settings_obj, created = SystemSettings.objects.get_or_create(id=1)
    serializer = SystemSettingsSerializer(settings_obj, data=request.data)
    if serializer.is_valid():
        serializer.save()
        performer_username = get_user_from_request(request)
        performer = User.objects.filter(username=performer_username).first()
        create_audit_log(performer, 'SETTINGS_UPDATE', "System settings updated.", performer_name=performer_username if not performer else None)
        return Response(serializer.data)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

@api_view(['GET'])
def get_audit_logs(request):
    logs = AuditLog.objects.all().order_by('-timestamp')
    serializer = AuditLogSerializer(logs, many=True)
    return Response(serializer.data)

@api_view(['GET'])
def backup_database(request):
    db_path = os.path.join(settings.BASE_DIR, 'db.sqlite3')
    if os.path.exists(db_path):
        response = FileResponse(open(db_path, 'rb'), content_type='application/x-sqlite3')
        response['Content-Disposition'] = f'attachment; filename="backup_{datetime.datetime.now().strftime("%Y%m%d_%H%M%S")}.sqlite3"'
        performer_username = get_user_from_request(request)
        performer = User.objects.filter(username=performer_username).first()
        create_audit_log(performer, 'BACKUP', "System database backup exported.", performer_name=performer_username if not performer else None)
        return response
    return Response({"error": "Database file not found"}, status=status.HTTP_404_NOT_FOUND)

@api_view(['POST'])
@parser_classes([MultiPartParser, FormParser])
def restore_database(request):
    file_obj = request.FILES.get('backup_file')
    if not file_obj or not file_obj.name.endswith('.sqlite3'):
        return Response({"error": "Invalid backup file."}, status=status.HTTP_400_BAD_REQUEST)
    db_path = os.path.join(settings.BASE_DIR, 'db.sqlite3')
    try:
        connections.close_all()
        with open(db_path, 'wb+') as destination:
            for chunk in file_obj.chunks():
                destination.write(chunk)
        performer_username = get_user_from_request(request)
        performer = User.objects.filter(username=performer_username).first()
        create_audit_log(performer, 'RESTORE', "System database restored.", performer_name=performer_username if not performer else None)
        return Response({"message": "Database restored successfully."}, status=status.HTTP_200_OK)
    except Exception as e:
        return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
