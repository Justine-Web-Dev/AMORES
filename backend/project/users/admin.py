from django.contrib import admin
from .models import User, Applicant, Application, Evaluation, ApplicantDocument, AuditLog, SystemSettings, ApplicationDraft, EvaluationCriteria, EvaluationScore

class UserAdmin(admin.ModelAdmin):
    list_display = ("name", "email", "role", "is_archived")
    search_fields = ("name", "email")
    list_filter = ("role", "is_archived")

admin.site.register(User, UserAdmin)

class EvaluationInline(admin.StackedInline):
    model = Evaluation
    can_delete = False
    verbose_name_plural = 'Evaluation Results'

class ApplicationInline(admin.StackedInline):
    model = Application
    extra = 0
    show_change_link = True

class ApplicantAdmin(admin.ModelAdmin):
    list_display = ("first_name", "last_name", "gender", "email", "contact_number", "program", "birthdate", "age", "created_at", "quota_type")
    list_editable = ("gender",)
    search_fields = ("first_name", "last_name", "email", "contact_number")
    list_filter = ("gender", "program", "created_at")
    inlines = [ApplicationInline]

admin.site.register(Applicant, ApplicantAdmin)

class ApplicationAdmin(admin.ModelAdmin):
    list_display = ("tracking_code", "applicant", "status", "scheduled_date", "updated_at")
    list_filter = ("status", "scheduled_date")
    search_fields = ("tracking_code", "applicant__first_name", "applicant__last_name")
    inlines = [EvaluationInline]

admin.site.register(Application, ApplicationAdmin)

class ApplicantDocumentAdmin(admin.ModelAdmin):
    list_display = ("applicant", "document_type", "uploaded_at")
    list_filter = ("document_type", "uploaded_at")

admin.site.register(ApplicantDocument, ApplicantDocumentAdmin)

class AuditLogAdmin(admin.ModelAdmin):
    list_display = ("timestamp", "get_performer", "action", "details")
    list_filter = ("action", "timestamp")
    search_fields = ("performer__username", "performer_name", "details")

    def get_performer(self, obj):
        return obj.performer.username if obj.performer else obj.performer_name
    get_performer.short_description = 'Performer'

admin.site.register(AuditLog, AuditLogAdmin)
admin.site.register(SystemSettings)
class EvaluationAdmin(admin.ModelAdmin):
    list_display = ("application", "is_qualified_evaluated")
    search_fields = ("application__tracking_code", "application__applicant__last_name")

admin.site.register(Evaluation, EvaluationAdmin)

from .models import EvaluationBMI, EvaluationPAT, EvaluationFinalInterview, FailedApplicant

class EvaluationBMIAdmin(admin.ModelAdmin):
    list_display = ("application", "height", "weight", "result")

    def get_queryset(self, request):
        qs = super().get_queryset(request)
        return qs.filter(application__status='Body Mass Index')

class EvaluationPATAdmin(admin.ModelAdmin):
    list_display = ("application", "pushups", "situps", "run", "pat_result")

    def get_queryset(self, request):
        qs = super().get_queryset(request)
        return qs.filter(application__status='Physical Agility Test')

    def pat_result(self, obj):
        if obj.pushups_passed is True and obj.situps_passed is True and obj.run_passed is True:
            return "PASSED"
        elif obj.pushups_passed is False or obj.situps_passed is False or obj.run_passed is False:
            return "FAILED"
        return "-"
    pat_result.short_description = "PAT RESULT"

class EvaluationFinalInterviewAdmin(admin.ModelAdmin):
    list_display = ("application", "score")

    def get_queryset(self, request):
        qs = super().get_queryset(request)
        return qs.filter(application__status='Final Interview')

class FailedApplicantAdmin(admin.ModelAdmin):
    list_display = ("application", "get_applicant_name", "failed_stage", "reason", "failed_at")
    search_fields = ("application__tracking_code", "application__applicant__last_name", "application__applicant__first_name", "failed_stage")

    def get_applicant_name(self, obj):
        return f"{obj.application.applicant.first_name} {obj.application.applicant.last_name}"
    get_applicant_name.short_description = "Applicant Name"

admin.site.register(EvaluationBMI, EvaluationBMIAdmin)
admin.site.register(EvaluationPAT, EvaluationPATAdmin)
admin.site.register(EvaluationFinalInterview, EvaluationFinalInterviewAdmin)
admin.site.register(FailedApplicant, FailedApplicantAdmin)
admin.site.register(EvaluationCriteria)
admin.site.register(EvaluationScore)

class ApplicationDraftAdmin(admin.ModelAdmin):
    list_display = ("draft_code", "created_at", "updated_at")
    search_fields = ("draft_code",)
    list_filter = ("created_at", "updated_at")

admin.site.register(ApplicationDraft, ApplicationDraftAdmin)