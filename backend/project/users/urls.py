from django.urls import path
from .views import register_user,login_user, get_user,update_user, change_password, forgot_password, verify_otp, reset_password, get_applicant_form,register_applicant_form, track_status,track_application_status, retrieve_application_data, upload_document,get_applicant_documents, scan_document, get_single_applicant,update_applicant_status,get_active_applicants, get_all_applicants, get_system_settings, update_system_settings, get_global_settings, update_global_setting, get_audit_logs, backup_database, restore_database, validate_applicant_form, SubmitApplicationView, reapply_update_view, get_system_health, anonymize_applicant, export_applicant_data, get_dashboard_applicants, save_application_draft, retrieve_application_draft

urlpatterns = [
  #Login Users
    path('register_user/', register_user,name='register_user'),
    path("login_user/", login_user,name='login_user'),
    path("change_password/", change_password, name='change_password'),
    path("forgot-password/", forgot_password, name='forgot_password'),
    path("verify-otp/", verify_otp, name='verify_otp'),
    path("reset-password/", reset_password, name='reset_password'),
    path("get_user/", get_user,name='get_user'),
    path("update_user/<int:pk>/", update_user, name='update_user'),
  
  #Reecruiter
    path("get_single_applicant_info/<int:pk>/", get_single_applicant, name='get_single_applicant'),
    path("update_status/<int:pk>/",update_applicant_status, name='update_applicant_status'),

  #Applicants
    path("get_applicant_info/",get_applicant_form,name='get_applicant_form'),
    path("dashboard-applicants/", get_dashboard_applicants, name='get_dashboard_applicants'),
    path("validate_applicant_form/", validate_applicant_form, name='validate_applicant_form'),
    path("register_applicant_info/", register_applicant_form,name='register_applicant_form'),
    path("applications/submit/", SubmitApplicationView.as_view(), name='submit_application'),
    path("track_status/<str:code>/", track_status,name='track_status'),

  #Applicant document
    path("upload-document/",upload_document, name="upload_document"),
    path("view-applicant-document/<int:applicant_id>/",get_applicant_documents, name="get_applicant_documents"),
    path("scan-document/<int:doc_id>/", scan_document, name="scan_document"),

  #Track the applicant code
    path('track-status/', track_application_status, name='track_application_status'),
    path('retrieve-application/', retrieve_application_data, name='retrieve_application_data'),
    path('applications/<str:tracking_code>/reapply/', reapply_update_view, name='reapply_update_view'),
    
  #Draft Applications
    path('applications/draft/save/', save_application_draft, name='save_application_draft'),
    path('applications/draft/<str:draft_code>/', retrieve_application_draft, name='retrieve_application_draft'),

  #get applicants
    path('applicants/active/', get_active_applicants, name='get_active_applicants'),
    path('applicants/all/', get_all_applicants, name='get_all_applicants'),
    
  #System Settings
    path('system-settings/', get_system_settings, name='get_system_settings'),
    path('system-settings/update/', update_system_settings, name='update_system_settings'),
    
  #Global Platform Settings (Super Admin)
    path('global-settings/', get_global_settings, name='get_global_settings'),
    path('global-settings/update/', update_global_setting, name='update_global_setting'),
    
  #Audit Logs
    path('audit-logs/', get_audit_logs, name='get_audit_logs'),
    
  #System Operations & Governance (Super Admin)
    path('system-health/', get_system_health, name='get_system_health'),
    path('privacy/anonymize/', anonymize_applicant, name='anonymize_applicant'),
    path('privacy/export/<int:applicant_id>/', export_applicant_data, name='export_applicant_data'),
    
  #Backup & Restore
    path('backup/', backup_database, name='backup_database'),
    path('restore/', restore_database, name='restore_database'),

]
