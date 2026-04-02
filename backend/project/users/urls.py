from django.urls import path
from .views import register_user,login_user, get_user,update_user, get_applicant_form,register_applicant_form, track_status,track_application_status

urlpatterns = [
  #Login Users
    path('register_user/', register_user,name='register_user'),
    path("login_user/", login_user,name='login_user'),
    path("get_user/", get_user,name='get_user'),
    path("update_user/<int:pk>/", update_user, name='update_user'),

  #Applicants
    path("get_applicant_info/",get_applicant_form,name='get_applicant_form'),
    path("register_applicant_info/", register_applicant_form,name='register_applicant_form'),
    path("track_status/<str:code>/", track_status,name='track_status'),

    #Track the applicant code
    path('track-status/', track_application_status, name='track_application_status'),
]
