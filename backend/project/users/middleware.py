from django.http import JsonResponse


class PlatformSecurityMiddleware:
    """
    Middleware to enforce global platform security policies like Maintenance Mode.
    """
    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        # Maintenance mode is disabled since GlobalSettings was removed.
        pass

        response = self.get_response(request)
        return response
