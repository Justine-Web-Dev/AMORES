from rest_framework import serializers
from .models import User,Applicant_infos,ApplicantDocument
from django.utils.dateparse import parse_datetime, parse_date

class FlexibleDateField(serializers.DateField):
    def to_internal_value(self, data):
        if not data:
            return None
        # If it's already a datetime string from JS (ISO format)
        if isinstance(data, str) and 'T' in data:
            dt = parse_datetime(data)
            return dt.date() if dt else None
        return super().to_internal_value(data)

    # This handles the GET (Outgoing data / Serializers.data)
    def to_representation(self, value):
        if not value:
            return None
        # If the DB gave us a datetime object, force it to just a date string
        if hasattr(value, 'date'):
            return value.date().isoformat()
        return super().to_representation(value)
class UsersSerializers(serializers.ModelSerializer):
  class Meta:
    model = User
    fields = ['id', 'name', 'username', 'password', 'role']
    extra_kwargs = {
            'password': {'write_only': True, 'required': False}
        }

class ApplicantInfosSerializers(serializers.ModelSerializer):
  date_graduated = FlexibleDateField()
  created_at = serializers.DateField(read_only=True)

  class Meta:
    model = Applicant_infos
    fields = '__all__'
    read_only_fields = ['tracking_code', 'created_at', 'status','rejection_reason']

class ApplicantDocumentSerializer(serializers.ModelSerializer):
   # We include the ID of the applicant to link the file to their profile
    applicant = serializers.PrimaryKeyRelatedField(queryset=Applicant_infos.objects.all())

    # This identifies the file URL so the frontend can display it
    file_url = serializers.SerializerMethodField()

    class Meta:
        model = ApplicantDocument
        fields = ['id', 'applicant', 'document_type', 'file', 'uploaded_at', 'file_url']
        read_only_fields = ['uploaded_at']

    def get_file_url(self, obj):
        request = self.context.get('request')
        if obj.file and request:
            return request.build_absolute_uri(obj.file.url)
        return None

