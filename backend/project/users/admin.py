from django.contrib import admin
from .models import User, Applicant_infos, ApplicantDocument

# Register your models here.
class UserAdmin(admin.ModelAdmin):
  list_display = ("name","username","role")

admin.site.register(User, UserAdmin)

class ApplicantAdmin(admin.ModelAdmin):
  list_display = ("firstname","lastname","program","latin_honor","email","tribe_affiliated","date_graduated","created_at","tracking_code","status")
  search_fields = ("firstname","lastname","tracking_code","email")
  list_filter = ("status","program","date_graduated")

admin.site.register(Applicant_infos, ApplicantAdmin)

class ApplicantDocumentAdmin(admin.ModelAdmin):
  list_display = ("applicant","document_type","file","uploaded_at")
  search_fields = ("applicant__firstname","applicant__lastname","document_type")
  list_filter = ("document_type","uploaded_at")

admin.site.register(ApplicantDocument, ApplicantDocumentAdmin)
