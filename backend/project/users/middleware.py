from django.http import JsonResponse
from .models import GlobalSetting

class PlatformSecurityMiddleware:
    """
    Middleware to enforce global platform security policies like Maintenance Mode.
    """
    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        
        # Check maintenance mode for API routes
        if request.path.startswith('/api/'):
            # Allow super admin endpoints to bypass maintenance mode
            if not request.path.startswith('/api/users/login/'):
                try:
                    maintenance_mode = GlobalSetting.objects.filter(key='MAINTENANCE_MODE').first()
                    if maintenance_mode and str(maintenance_mode.value).lower() == 'true':
                        # Ideally we would check if user is SUPER_ADMIN from request.user,
                        # but request.user is set by DRF later. 
                        # For simple middleware, we just return a 503 if not hitting an admin route.
                        
                        if not any(x in request.path for x in ['global-settings', 'system-health', 'api-keys']):
                            return JsonResponse({
                                'error': 'Platform is currently under maintenance. Please try again later.'
                            }, status=503)
                except Exception:
                    pass

        response = self.get_response(request)
        return response
