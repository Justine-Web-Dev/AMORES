from django.urls import path
from .views import screen_initial_application

urlpatterns = [
    path('screen-initial/', screen_initial_application, name='screen-initial'),
]
