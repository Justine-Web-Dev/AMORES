from django.contrib import admin
from .models import User,Applicant_infos

# Register your models here.
class UserAdmin(admin.ModelAdmin):
  list_display = ("name","username","role")

admin.site.register(User,UserAdmin)

class ApplicantAdmin(admin.ModelAdmin):
  list_display =("firstname","lastname","program","latin_honor","email","tribe_affiliated","created_at")

admin.site.register(Applicant_infos,ApplicantAdmin)
