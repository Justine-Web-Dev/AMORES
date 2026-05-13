from rest_framework import serializers
from .models import User, Applicant, Application, Evaluation, ApplicantDocument, SystemSettings, AuditLog
from django.utils.dateparse import parse_datetime

class FlexibleDateField(serializers.DateField):
    def to_internal_value(self, data):
        if not data:
            return None
        if isinstance(data, str) and 'T' in data:
            dt = parse_datetime(data)
            return dt.date() if dt else None
        return super().to_internal_value(data)

    def to_representation(self, value):
        if not value:
            return None
        if hasattr(value, 'date'):
            return value.date().isoformat()
        return super().to_representation(value)

class UsersSerializers(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'name', 'username', 'password', 'role', 'is_archived']
        extra_kwargs = {
            'password': {'write_only': True, 'required': False}
        }

class EvaluationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Evaluation
        fields = '__all__'

class ApplicationSerializer(serializers.ModelSerializer):
    evaluation = EvaluationSerializer(read_only=True)
    
    class Meta:
        model = Application
        fields = '__all__'

class ApplicantSerializer(serializers.ModelSerializer):
    date_graduated = FlexibleDateField()
    created_at = serializers.DateTimeField(read_only=True)
    
    # We include fields from active applications to help the frontend
    current_application = ApplicationSerializer(source='active_application', read_only=True)
    
    # Backward compatibility mappings
    firstname = serializers.CharField(source='first_name', read_only=True)
    lastname = serializers.CharField(source='last_name', read_only=True)
    cp_number = serializers.CharField(source='contact_number', read_only=True)
    middle_initial = serializers.SerializerMethodField()

    class Meta:
        model = Applicant
        fields = '__all__'
    
    def get_middle_initial(self, obj):
        if obj.middle_name:
            return f"{obj.middle_name[0]}."
        return ""

class ApplicantFullSerializer(serializers.ModelSerializer):
    """
    A flattened version of the Applicant data for backward compatibility with existing frontend views.
    """
    date_graduated = FlexibleDateField()
    created_at = serializers.SerializerMethodField()
    
    # Mapping back to old names for frontend compatibility
    firstname = serializers.CharField(source='first_name')
    lastname = serializers.CharField(source='last_name')
    cp_number = serializers.CharField(source='contact_number')
    middle_initial = serializers.SerializerMethodField()
    
    # Flattened Application Fields (Safely handle missing applications)
    status = serializers.SerializerMethodField()
    tracking_code = serializers.SerializerMethodField()
    rejection_reason = serializers.SerializerMethodField()
    scheduled_date = serializers.SerializerMethodField()
    scheduled_time = serializers.SerializerMethodField()
    evaluation_remarks = serializers.SerializerMethodField()
    oath_taking_date = serializers.SerializerMethodField()
    
    # Flattened Evaluation Fields (Safely handle missing evaluations)
    bmi_height = serializers.SerializerMethodField()
    bmi_weight = serializers.SerializerMethodField()
    bmi_result = serializers.SerializerMethodField()
    pat_score = serializers.SerializerMethodField()
    psychological_result = serializers.SerializerMethodField()
    medical_result = serializers.SerializerMethodField()
    drug_test_result = serializers.SerializerMethodField()
    final_interview_score = serializers.SerializerMethodField()

    class Meta:
        model = Applicant
        fields = '__all__'

    def get_middle_initial(self, obj):
        if obj.middle_name:
            return f"{obj.middle_name[0]}."
        return ""

    def get_created_at(self, obj):
        if obj.created_at:
            return obj.created_at.date()
        return None

    def _get_app(self, obj):
        return obj.active_application

    def _get_eval(self, obj):
        app = self._get_app(obj)
        return getattr(app, 'evaluation', None) if app else None

    def get_status(self, obj):
        app = self._get_app(obj)
        return app.status if app else None

    def get_tracking_code(self, obj):
        app = self._get_app(obj)
        return app.tracking_code if app else None

    def get_rejection_reason(self, obj):
        app = self._get_app(obj)
        return app.rejection_reason if app else None

    def get_scheduled_date(self, obj):
        app = self._get_app(obj)
        return app.scheduled_date if app else None

    def get_scheduled_time(self, obj):
        app = self._get_app(obj)
        return app.scheduled_time if app else None

    def get_evaluation_remarks(self, obj):
        app = self._get_app(obj)
        return app.evaluation_remarks if app else None

    def get_oath_taking_date(self, obj):
        app = self._get_app(obj)
        return app.oath_taking_date if app else None

    def get_bmi_height(self, obj):
        eval_obj = self._get_eval(obj)
        return eval_obj.bmi_height if eval_obj else None

    def get_bmi_weight(self, obj):
        eval_obj = self._get_eval(obj)
        return eval_obj.bmi_weight if eval_obj else None

    def get_bmi_result(self, obj):
        eval_obj = self._get_eval(obj)
        return eval_obj.bmi_result if eval_obj else None

    def get_pat_score(self, obj):
        eval_obj = self._get_eval(obj)
        return eval_obj.pat_score if eval_obj else None

    def get_psychological_result(self, obj):
        eval_obj = self._get_eval(obj)
        return eval_obj.psychological_result if eval_obj else None

    def get_medical_result(self, obj):
        eval_obj = self._get_eval(obj)
        return eval_obj.medical_result if eval_obj else None

    def get_drug_test_result(self, obj):
        eval_obj = self._get_eval(obj)
        return eval_obj.drug_test_result if eval_obj else None

    def get_final_interview_score(self, obj):
        eval_obj = self._get_eval(obj)
        return eval_obj.final_interview_score if eval_obj else None

class ApplicantDocumentSerializer(serializers.ModelSerializer):
    applicant = serializers.PrimaryKeyRelatedField(queryset=Applicant.objects.all())
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

class SystemSettingsSerializer(serializers.ModelSerializer):
    class Meta:
        model = SystemSettings
        fields = '__all__'

class AuditLogSerializer(serializers.ModelSerializer):
    performer_username = serializers.CharField(source='performer.username', read_only=True)
    
    class Meta:
        model = AuditLog
        fields = ['id', 'performer', 'performer_username', 'performer_name', 'action', 'details', 'timestamp']
