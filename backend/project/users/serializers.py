from rest_framework import serializers
from .models import User,Applicant_infos

class UsersSerializers(serializers.ModelSerializer):
  class Meta:
    model = User
    fields = "__all__"

class ApplicantInfosSerializers(serializers.ModelSerializer):
  class Meta:
    model = Applicant_infos
    fields = '__all__'

