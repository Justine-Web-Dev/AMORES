from django.shortcuts import render
from .serializers import UsersSerializers,ApplicantInfosSerializers,ApplicantDocumentSerializer
from .models import User,Applicant_infos,ApplicantDocument
from rest_framework.decorators import api_view, parser_classes
from rest_framework.response import Response
from rest_framework import status
from rest_framework.parsers import MultiPartParser, FormParser

import jwt
import datetime
from django.conf import settings

# Create your views here.

@api_view(['GET'])
def get_user(request):
  users = User.objects.all()
  serializers = UsersSerializers(users,many=True)
  return Response(serializers.data)

@api_view(['POST'])
def register_user(request):
  serializers = UsersSerializers(data=request.data)

  if serializers.is_valid():
    serializers.save()
    return Response(serializers.data, status=status.HTTP_201_CREATED)
  return Response(serializers.errors, status=status.HTTP_400_BAD_REQUEST)

@api_view(['POST'])
def login_user(request):
  # extract credentials from payload
  username = request.data.get('username')
  password = request.data.get('password')

  # look up user by username
  try:
    user = User.objects.get(username=username)
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
  except User.DoNotExist:
    return Response(status=status.HTTP_404_NOT_FOUND)

  if request.method == 'GET':
    serializers = UsersSerializers(users)
    return Response(serializers.data)
  elif request.method == 'PUT':
    serializers = UsersSerializers(users,data=request.data)
    if serializers.is_valid():
      serializers.save()
      return Response(serializers.data)
    return Response(serializers.errors, status=status.HTTP_400_BAD_REQUEST)
  elif request.method == 'DELETE':
    users.delete()
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
 serializer = ApplicantInfosSerializers(data=request.data)
 if serializer.is_valid():
    instance = serializer.save() 
    # Crucial: return the tracking_code in the JSON response
    return Response({
              "id": instance.id,
              "tracking_code": instance.tracking_code, 
              "message": "Success"
  }, status=status.HTTP_201_CREATED)
 return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

@api_view(['PATCH'])
def update_applicant_status(request, pk):
    try:
        applicant = Applicant_infos.objects.get(pk=pk)
        
        # We only want to update the 'status' field from the request body
        new_status = request.data.get('status')
        if not new_status:
            return Response({"error": "Status is required"}, status=status.HTTP_400_BAD_REQUEST)
            
        applicant.status = new_status
        applicant.save()
        
        return Response({
            "message": "Status updated successfully",
            "new_status": applicant.status
        }, status=status.HTTP_200_OK)
        
    except Applicant_infos.DoesNotExist:
        return Response({"error": "Applicant not found"}, status=status.HTTP_404_NOT_FOUND)

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
        "date_applied": applicant.created_at
    }, status=status.HTTP_200_OK)
  
  except Applicant_infos.DoesNotExist:
    return Response({"error": "Invalid tracking code. Please check and try again."}, status=status.HTTP_404_NOT_FOUND)
  
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