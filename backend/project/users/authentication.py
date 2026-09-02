import jwt
from django.conf import settings
from rest_framework.authentication import BaseAuthentication
from rest_framework.exceptions import AuthenticationFailed
from .models import User, GlobalSetting

class JWTAuthentication(BaseAuthentication):
    def authenticate_header(self, request):
        return 'Bearer'

    def authenticate(self, request):
        token = request.headers.get('X-User-Token') or request.headers.get('Authorization')
        
        if token and token.startswith('Bearer '):
            token = token.split(' ')[1]
            
        if not token:
            token = request.META.get('HTTP_X_USER_TOKEN')
            if not token:
                auth_header = request.META.get('HTTP_AUTHORIZATION')
                if auth_header and auth_header.startswith('Bearer '):
                    token = auth_header.split(' ')[1]

        if not token:
            return None

        try:
            payload = jwt.decode(token, settings.SECRET_KEY, algorithms=["HS256"])
            email = payload.get('email')
            if not email:
                raise AuthenticationFailed('Invalid payload.')
            
            user = User.objects.get(email=email)
            
            if user.is_banned:
                raise AuthenticationFailed('This account has been permanently banned.')
            if user.is_suspended:
                raise AuthenticationFailed('This account is currently suspended.')
                
            if user.role == User.Roles.ADMINISTRATOR:
                try:
                    active_admin_setting = GlobalSetting.objects.get(key='ACTIVE_ADMIN_ID')
                    if active_admin_setting.value != user.id:
                        raise AuthenticationFailed('Another administrator has logged in. You have been logged out.')
                except GlobalSetting.DoesNotExist:
                    pass
                
            return (user, token)
        except jwt.ExpiredSignatureError:
            raise AuthenticationFailed('Token has expired.')
        except jwt.DecodeError:
            raise AuthenticationFailed('Error decoding token.')
        except User.DoesNotExist:
            raise AuthenticationFailed('No user found for this token.')
