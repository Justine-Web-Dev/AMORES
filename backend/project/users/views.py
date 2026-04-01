from django.shortcuts import render
from .serializers import UsersSerializers,ApplicantInfosSerializers
from .models import User,Applicant_infos
from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework import status

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

@api_view(['POST'])
def register_applicant_form(request):
  serializers = ApplicantInfosSerializers(data=request.data)

  if serializers.is_valid():
    serializers.save()
    return Response(serializers.data, status=status.HTTP_201_CREATED)
  return Response(serializers.errors, status=status.HTTP_400_BAD_REQUEST)