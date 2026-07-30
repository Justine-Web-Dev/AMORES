from rest_framework import serializers
from .models import User, Applicant, Application, Evaluation, ApplicantDocument, SystemSettings, AuditLog, GlobalSetting, Role, Permission, RolePermission, ApiKey, MasterLookup
from django.utils.dateparse import parse_datetime
from django.contrib.auth.hashers import make_password, identify_hasher

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
        fields = [
            'id', 'name', 'email', 'password', 'role', 
            'is_archived', 'profile_picture', 'must_change_password'
        ]
        extra_kwargs = {
            'password': {'write_only': True, 'required': False}
        }

    def create(self, validated_data):
        # Hash password directly if provided
        if 'password' in validated_data:
            validated_data['password'] = make_password(validated_data['password'])
        return super().create(validated_data)

    def update(self, instance, validated_data):
        # Hash password directly if provided during update
        if 'password' in validated_data:
            validated_data['password'] = make_password(validated_data['password'])
        return super().update(instance, validated_data)

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
    birthdate = FlexibleDateField(required=False, allow_null=True)
    created_at = serializers.DateTimeField(read_only=True)
    age = serializers.SerializerMethodField()
    address = serializers.ReadOnlyField()
    
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
    
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        is_reapply = self.context.get('is_reapply', False)
        
        if is_reapply:
            from rest_framework.validators import UniqueValidator
            for field_name, field in self.fields.items():
                if hasattr(field, 'validators'):
                    field.validators = [v for v in field.validators if not isinstance(v, UniqueValidator)]

    def validate(self, attrs):
        is_reapply = self.context.get('is_reapply', False)
        
        if not is_reapply:
            email = attrs.get('email')
            if email and Applicant.objects.filter(email=email).exists():
                # We skip manual error raising here because DRF UniqueValidator handles it normally
                # However, since the prompt requested a custom validate, we include it.
                pass
                
        return attrs
    
    def get_middle_initial(self, obj):
        if obj.middle_name:
            return f"{obj.middle_name[0]}."
        return ""

    def get_age(self, obj):
        return getattr(obj, 'age', None)

class ApplicantFullSerializer(serializers.ModelSerializer):
    """
    A flattened version of the Applicant data for backward compatibility with existing frontend views.
    """
    date_graduated = FlexibleDateField()
    birthdate = FlexibleDateField(required=False, allow_null=True)
    created_at = serializers.SerializerMethodField()
    age = serializers.SerializerMethodField()
    address = serializers.ReadOnlyField()
    
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
    batch = serializers.SerializerMethodField()
    
    # Flattened Evaluation Fields (Safely handle missing evaluations)
    bmi_height = serializers.SerializerMethodField()
    bmi_weight = serializers.SerializerMethodField()
    bmi_result = serializers.SerializerMethodField()
    pat_score = serializers.SerializerMethodField()
    psychological_result = serializers.SerializerMethodField()
    medical_result = serializers.SerializerMethodField()
    drug_test_result = serializers.SerializerMethodField()
    final_interview_score = serializers.SerializerMethodField()
    
    pat_pushups = serializers.SerializerMethodField()
    pat_pushups_passed = serializers.SerializerMethodField()
    pat_situps = serializers.SerializerMethodField()
    pat_situps_passed = serializers.SerializerMethodField()
    pat_run = serializers.SerializerMethodField()
    pat_run_passed = serializers.SerializerMethodField()
    status_updated_at = serializers.SerializerMethodField()
    
    class Meta:
        model = Applicant
        fields = [
            'id', 'first_name', 'last_name', 'middle_name', 'birthdate', 'age', 'email', 
            'contact_number', 'gender', 'program', 'date_graduated', 'address',
            'barangay', 'city_municipality', 'province', 'zip_code',
            'name_of_school', 'latin_honor', 'pag_ibig_number', 
            'phil_health_id_num', 'height', 'tribe', 'created_at',
            'firstname', 'lastname', 'cp_number', 'middle_initial',
            'status', 'status_updated_at', 'tracking_code', 'rejection_reason', 'scheduled_date', 
            'scheduled_time', 'evaluation_remarks', 'oath_taking_date', 'batch',
            'bmi_height', 'bmi_weight', 'bmi_result', 'pat_score', 
            'psychological_result', 'medical_result', 'drug_test_result', 
            'final_interview_score',
            'pat_pushups', 'pat_pushups_passed', 'pat_situps', 
            'pat_situps_passed', 'pat_run', 'pat_run_passed'
        ]

    def get_middle_initial(self, obj):
        if obj.middle_name:
            return f"{obj.middle_name[0]}."
        return ""

    def get_age(self, obj):
        return getattr(obj, 'age', None)

    def get_created_at(self, obj):
        if obj.created_at:
            return obj.created_at.date()
        return None

    def _get_app(self, obj):
        if hasattr(obj, 'prefetched_applications'):
            return obj.prefetched_applications[0] if obj.prefetched_applications else None
        return obj.active_application

    def _get_eval(self, obj):
        app = self._get_app(obj)
        return getattr(app, 'evaluation', None) if app else None

    def get_status(self, obj):
        app = self._get_app(obj)
        return app.status if app else None

    def get_status_updated_at(self, obj):
        app = self._get_app(obj)
        return app.updated_at if app else None

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

    def get_batch(self, obj):
        app = self._get_app(obj)
        return app.batch if app else 1

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

    def get_pat_pushups(self, obj):
        eval_obj = self._get_eval(obj)
        return eval_obj.pat_pushups if eval_obj else None

    def get_pat_pushups_passed(self, obj):
        eval_obj = self._get_eval(obj)
        return eval_obj.pat_pushups_passed if eval_obj else None

    def get_pat_situps(self, obj):
        eval_obj = self._get_eval(obj)
        return eval_obj.pat_situps if eval_obj else None

    def get_pat_situps_passed(self, obj):
        eval_obj = self._get_eval(obj)
        return eval_obj.pat_situps_passed if eval_obj else None

    def get_pat_run(self, obj):
        eval_obj = self._get_eval(obj)
        return eval_obj.pat_run if eval_obj else None

    def get_pat_run_passed(self, obj):
        eval_obj = self._get_eval(obj)
        return eval_obj.pat_run_passed if eval_obj else None

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
        fields = ['id', 'applicant', 'document_type', 'file', 'uploaded_at', 'expiration_date', 'file_url', 'ocr_text', 'ai_verified', 'ai_remarks']
        read_only_fields = ['uploaded_at', 'expiration_date']

    def get_file_url(self, obj):
        if obj.file:
            # If it's a Cloudinary storage, generate a signed URL to allow PDF delivery
            try:
                import cloudinary.utils
                from django.conf import settings
                if hasattr(obj.file.storage, 'bucket_name') or 'cloudinary' in str(type(obj.file.storage)).lower():
                    # Check if it's raw or image based on storage class
                    res_type = 'raw' if 'Raw' in str(type(obj.file.storage)) else 'image'
                    # Force output format to jpg for image resources to bypass PDF blocks
                    url, _ = cloudinary.utils.cloudinary_url(
                        obj.file.name, 
                        resource_type=res_type, 
                        sign_url=True,
                        format='jpg' if res_type == 'image' else None
                    )
                    return url
            except Exception as e:
                print(f"Error signing URL: {e}")
                
            url = obj.file.url
            if url.startswith('http'):
                return url
            request = self.context.get('request')
            if request:
                return request.build_absolute_uri(url)
        return None

class SystemSettingsSerializer(serializers.ModelSerializer):
    class Meta:
        model = SystemSettings
        fields = '__all__'

class AuditLogSerializer(serializers.ModelSerializer):
    user = serializers.SerializerMethodField()
    
    class Meta:
        model = AuditLog
        fields = ['id', 'user', 'action', 'details', 'target_resource', 'changes', 'ip_address', 'timestamp']
    
    def get_user(self, obj):
        """Return the performer username, with fallback to performer_name or 'System'"""
        if obj.performer:
            return obj.performer.name
        elif obj.performer_name:
            return obj.performer_name
        return 'System'

class GlobalSettingSerializer(serializers.ModelSerializer):
    class Meta:
        model = GlobalSetting
        fields = '__all__'

# --- Governance & RBAC Serializers ---

class PermissionSerializer(serializers.ModelSerializer):
    class Meta:
        model = Permission
        fields = '__all__'

class RoleSerializer(serializers.ModelSerializer):
    permissions = serializers.SerializerMethodField()
    
    class Meta:
        model = Role
        fields = '__all__'
        
    def get_permissions(self, obj):
        return [rp.permission.action for rp in obj.permissions.all()]

class RolePermissionSerializer(serializers.ModelSerializer):
    class Meta:
        model = RolePermission
        fields = '__all__'

# --- System Operations Serializers ---

class ApiKeySerializer(serializers.ModelSerializer):
    created_by_name = serializers.CharField(source='created_by.name', read_only=True)
    
    class Meta:
        model = ApiKey
        fields = ['id', 'name', 'created_by_name', 'created_at', 'last_used_at', 'is_active']
        # key_hash is deliberately excluded for security

class MasterLookupSerializer(serializers.ModelSerializer):
    class Meta:
        model = MasterLookup
        fields = '__all__'
