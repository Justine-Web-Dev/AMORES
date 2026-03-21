from django.urls import path
from .views import register_user,login_user, get_user,update_user

urlpatterns = [
  #Login Users
    path('register_user/', register_user,name='register_user'),
    path("login_user/", login_user,name='login_user'),
    path("get_user/", get_user,name='get_user'),
    path("update_user/<int:pk>/", update_user, name='update_user')

    #Applicants
]
