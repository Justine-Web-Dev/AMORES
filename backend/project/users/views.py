from django.shortcuts import render
from .serializers import UsersSerializers,ApplicantInfosSerializers,ApplicantDocumentSerializer, SystemSettingsSerializer, AuditLogSerializer
from .models import User,Applicant_infos,ApplicantDocument, SystemSettings, AuditLog
from .utils import create_audit_log, get_user_from_request
from rest_framework.decorators import api_view, parser_classes
from rest_framework.response import Response
from rest_framework import status
from rest_framework.parsers import MultiPartParser, FormParser

import jwt
import datetime
import os
import shutil
from django.conf import settings
from django.http import FileResponse
from django.db import connections

# Create your views here.

@api_view(['GET'])
def get_user(request):
  is_archived = request.query_params.get('archived', 'false') == 'true'
  users = User.objects.filter(is_archived=is_archived)
  serializers = UsersSerializers(users,many=True)
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
    performer = get_user_from_request(request)
    if performer == 'Unknown':
        performer = request.data.get('username', 'Unknown')
    create_audit_log(performer, 'USER_REGISTRATION', f"New user '{user.username}' registered as {user.role}.")
    return Response(serializers.data, status=status.HTTP_201_CREATED)
  return Response(serializers.errors, status=status.HTTP_400_BAD_REQUEST)

@api_view(['POST'])
def login_user(request):
  # extract credentials from payload
  username = request.data.get('username')
  password = request.data.get('password')

  # look up user by username
  try:
    user = User.objects.get(username=username, is_archived=False)
  except User.DoesNotExist:
    return Response({'error': 'User not found'}, status=status.HTTP_404_NOT_FOUND)
  
  # simple plaintext check (should be hashed in production)
  if user.password != password:
    return Response({'error': 'Invalid password'}, status=status.HTTP_400_BAD_REQUEST)
  
  payload = {
    "user_id": user.id,
    "username": user.username,
    "exp": datetime.datetime.utcnow() + datetime.timedelta(hours=1)
  }
  
  token = jwt.encode(payload, settings.SECRET_KEY, algorithm="HS256")

  create_audit_log(user.username, 'LOGIN', f"User '{user.username}' logged in successfully.")

  return Response({
    "token": token,
    "username": user.username,
    # you could add additional fields here (is_admin, etc.)
  })

#Update user details
@api_view(['GET','PUT','DELETE'])
def update_user(request,pk):
  try:
    users = User.objects.get(pk=pk)
  except User.DoesNotExist:
    return Response(status=status.HTTP_404_NOT_FOUND)

  if request.method == 'GET':
    serializers = UsersSerializers(users)
    return Response(serializers.data)
  elif request.method == 'PUT':
    target_username = users.username
    new_username = request.data.get('username')
    new_name = request.data.get('name')

    if User.objects.filter(username=new_username).exclude(pk=pk).exists():
        return Response({"error": f"Username '{new_username}' is already taken."}, status=status.HTTP_400_BAD_REQUEST)
    
    if User.objects.filter(name=new_name).exclude(pk=pk).exists():
        return Response({"error": f"A personnel with the name '{new_name}' is already registered."}, status=status.HTTP_400_BAD_REQUEST)

    serializers = UsersSerializers(users,data=request.data)
    if serializers.is_valid():
      serializers.save()
      performer = get_user_from_request(request)
      if performer == 'Unknown':
          performer = 'Administrator'
      create_audit_log(performer, 'USER_UPDATE', f"User '{target_username}' details updated.")
      return Response(serializers.data)
    return Response(serializers.errors, status=status.HTTP_400_BAD_REQUEST)
  elif request.method == 'DELETE':
    username = users.username
    users.is_archived = True
    users.save()
    performer = get_user_from_request(request)
    if performer == 'Unknown':
        performer = 'Administrator'
    create_audit_log(performer, 'USER_ARCHIVE', f"User '{username}' archived.")
    return Response(status=status.HTTP_204_NO_CONTENT)

#applicant applications
@api_view(['GET'])
def get_applicant_form(request):
  infos = Applicant_infos.objects.all()
  serializers = ApplicantInfosSerializers(infos,many=True)
  return Response(serializers.data)

@api_view(['GET'])
def get_single_applicant(request, pk):
    try:
        # Fetch only the applicant matching the ID from the URL
        applicant = Applicant_infos.objects.get(pk=pk)
        serializer = ApplicantInfosSerializers(applicant)
        
        data = serializer.data
        data['rejection_reason'] = applicant.rejection_reason

        return Response(serializer.data)
    except Applicant_infos.DoesNotExist:
        return Response({"error": "Applicant not found"}, status=status.HTTP_404_NOT_FOUND)

@api_view(['GET'])
def track_status(request, code):
    try:
        # We look up the applicant by the unique tracking code
        applicant = Applicant_infos.objects.get(tracking_code=code.upper())
        serializers = ApplicantInfosSerializers(applicant)
        return Response({
            "status": applicant.status,
            "name": f"{applicant.firstname} {applicant.lastname}",
            "program": applicant.program
        }, status=status.HTTP_200_OK)
    except Applicant_infos.DoesNotExist:
        return Response({"error": "Application not found"}, status=status.HTTP_404_NOT_FOUND)

@api_view(['POST'])
def register_applicant_form(request):
    # Prevent duplicate applicant submissions by email, CP number, Pag-IBIG, or PhilHealth ID
    email = request.data.get('email', '').strip().lower()
    cp_number = request.data.get('cp_number', '').strip()
    pag_ibig_number = request.data.get('pag_ibig_number', '').strip()
    phil_health_id_num = request.data.get('phil_health_id_num', '').strip()

    if not email or not cp_number or not pag_ibig_number or not phil_health_id_num:
        return Response({"error": "Email, CP number, Pag-IBIG number, and PhilHealth ID are required for validation."}, status=status.HTTP_400_BAD_REQUEST)

    duplicate_by_email = Applicant_infos.objects.filter(email__iexact=email).exists()
    duplicate_by_cp = Applicant_infos.objects.filter(cp_number=cp_number).exists()
    duplicate_by_pag_ibig = Applicant_infos.objects.filter(pag_ibig_number=pag_ibig_number).exists()
    duplicate_by_phil_health = Applicant_infos.objects.filter(phil_health_id_num=phil_health_id_num).exists()

    if duplicate_by_email or duplicate_by_cp or duplicate_by_pag_ibig or duplicate_by_phil_health:
        message_parts = []
        if duplicate_by_email:
            message_parts.append('email')
        if duplicate_by_cp:
            message_parts.append('CP number')
        if duplicate_by_pag_ibig:
            message_parts.append('Pag-IBIG number')
        if duplicate_by_phil_health:
            message_parts.append('PhilHealth ID')

        message = 'Applicant with this ' + ' and '.join(message_parts) + ' already exists.'
        return Response({"error": message}, status=status.HTTP_409_CONFLICT)

    serializer = ApplicantInfosSerializers(data=request.data)
    if serializer.is_valid():
       instance = serializer.save() 
       create_audit_log('System', 'APPLICANT_REGISTRATION', f"New applicant '{instance.firstname} {instance.lastname}' ({instance.tracking_code}) registered.")
       return Response({
                 "id": instance.id,
                 "tracking_code": instance.tracking_code, 
                 "message": "Success"
       }, status=status.HTTP_201_CREATED)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

@api_view(['PUT'])
def update_applicant_status(request, pk):
    try:
        applicant = Applicant_infos.objects.get(pk=pk)
        
        # We only want to update the 'status' field from the request body
        new_status = request.data.get('status')
        reason = request.data.get('rejection_reason')

        # Evaluation fields
        bmi_height = request.data.get('bmi_height')
        bmi_weight = request.data.get('bmi_weight')
        bmi_result = request.data.get('bmi_result')
        pat_score = request.data.get('pat_score')
        psychological_result = request.data.get('psychological_result')
        medical_result = request.data.get('medical_result')
        drug_test_result = request.data.get('drug_test_result')
        final_interview_score = request.data.get('final_interview_score')
        oath_taking_date = request.data.get('oath_taking_date')
        scheduled_date = request.data.get('scheduled_date')
        scheduled_time = request.data.get('scheduled_time')

        if new_status == 'Rejected':
           applicant.rejection_reason = reason

        if bmi_height is not None: applicant.bmi_height = bmi_height
        if bmi_weight is not None: applicant.bmi_weight = bmi_weight
        if bmi_result is not None: applicant.bmi_result = bmi_result
        if pat_score is not None: applicant.pat_score = pat_score
        if psychological_result is not None: applicant.psychological_result = psychological_result
        if medical_result is not None: applicant.medical_result = medical_result
        if drug_test_result is not None: applicant.drug_test_result = drug_test_result
        if final_interview_score is not None: applicant.final_interview_score = final_interview_score
        if oath_taking_date is not None: applicant.oath_taking_date = oath_taking_date
        
        # Always allow updating schedule and remarks
        if scheduled_date is not None: applicant.scheduled_date = scheduled_date
        if scheduled_time is not None: applicant.scheduled_time = scheduled_time
        if request.data.get('evaluation_remarks') is not None:
            applicant.evaluation_remarks = request.data.get('evaluation_remarks')

        if not new_status:
            return Response({"error": "Status is required"}, status=status.HTTP_400_BAD_REQUEST)
            
        applicant.status = new_status
        applicant.save()
        
        performer = get_user_from_request(request)
        if performer == 'Unknown':
            performer = 'Administrator'
        create_audit_log(performer, 'STATUS_UPDATE', f"Applicant '{applicant.firstname} {applicant.lastname}' status updated to '{new_status}'" + (f" with reason: {reason}" if reason else ""))

        return Response({
            "message": "Status updated successfully",
            "new_status": applicant.status
        }, status=status.HTTP_200_OK)
        
    except Applicant_infos.DoesNotExist:
        return Response({"error": "Applicant not found"}, status=status.HTTP_404_NOT_FOUND)

#tracking the applicants status
@api_view(['GET'])
def track_application_status(request):
  code = request.query_params.get('code',None)

  if not code:
    return Response({"error": "Tracking code is required"}, status=status.HTTP_400_BAD_REQUEST)
  
  try:
    # Search for the applicant using your specific tracking_code field
    applicant = Applicant_infos.objects.get(tracking_code=code)

    # Return only safe, non-sensitive data
    return Response({
        "tracking_code": applicant.tracking_code,
        "full_name": f"{applicant.firstname} {applicant.lastname}",
        "status": applicant.status,
        "program": applicant.program,
        "date_applied": applicant.created_at,
        "rejection_reason" : applicant.rejection_reason,
        "scheduled_date": applicant.scheduled_date,
        "scheduled_time": applicant.scheduled_time,
        "drug_test_result": applicant.drug_test_result,
        "bmi_height": applicant.bmi_height,
        "bmi_weight": applicant.bmi_weight
    }, status=status.HTTP_200_OK)
  
  except Applicant_infos.DoesNotExist:
    return Response({"error": "Invalid tracking code. Please check and try again."}, status=status.HTTP_404_NOT_FOUND)
  
#upload an image
@api_view(['POST'])
@parser_classes([MultiPartParser, FormParser])
def upload_document(request):
    # Pass the request in context so the serializer can generate full URLs for the file
    serializer = ApplicantDocumentSerializer(data=request.data, context={'request': request})
    
    if serializer.is_valid():
        # Check if the applicant already uploaded this specific type (Optional but recommended)
        applicant_id = request.data.get('applicant')
        doc_type = request.data.get('document_type')
        
        # Example logic: delete the old one if they are re-uploading
        # ApplicantDocument.objects.filter(applicant_id=applicant_id, document_type=doc_type).delete()
        
        serializer.save()
        return Response(serializer.data, status=status.HTTP_201_CREATED)
    
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

@api_view(['GET'])
def get_applicant_documents(request, applicant_id):
    documents = ApplicantDocument.objects.filter(applicant_id=applicant_id)
    serializer = ApplicantDocumentSerializer(documents, many=True, context={'request': request})
    return Response(serializer.data)

# Add these to your views.py

@api_view(['GET'])
def get_active_applicants(request):
    # Exclude those that are marked as Rejected
    applicants = Applicant_infos.objects.exclude(status='Rejected')
    serializer = ApplicantInfosSerializers(applicants, many=True)
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
        performer = get_user_from_request(request)
        if performer == 'Unknown':
            performer = 'Administrator'
        create_audit_log(performer, 'SETTINGS_UPDATE', "System settings updated.")
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
        
        performer = get_user_from_request(request)
        if performer == 'Unknown':
            performer = 'Administrator'
        create_audit_log(performer, 'BACKUP', "System database backup exported.")
        
        return response
    return Response({"error": "Database file not found"}, status=status.HTTP_404_NOT_FOUND)

@api_view(['POST'])
@parser_classes([MultiPartParser, FormParser])
def restore_database(request):
    file_obj = request.FILES.get('backup_file')
    if not file_obj:
        return Response({"error": "No backup file provided"}, status=status.HTTP_400_BAD_REQUEST)
    
    if not file_obj.name.endswith('.sqlite3'):
        return Response({"error": "Invalid file format. Please upload a .sqlite3 file."}, status=status.HTTP_400_BAD_REQUEST)

    db_path = os.path.join(settings.BASE_DIR, 'db.sqlite3')
    
    try:
        # Close all active database connections to release the file lock
        connections.close_all()
        
        # Save the uploaded file as the new database
        with open(db_path, 'wb+') as destination:
            for chunk in file_obj.chunks():
                destination.write(chunk)
        
        performer = get_user_from_request(request)
        if performer == 'Unknown':
            performer = 'Administrator'
        create_audit_log(performer, 'RESTORE', "System database restored from backup file.")
        
        return Response({"message": "Database restored successfully. The system may require a restart to reflect changes."}, status=status.HTTP_200_OK)
    except Exception as e:
        return Response({"error": f"Failed to restore database: {str(e)}"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
