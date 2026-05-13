from .models import AuditLog, User

def get_user_from_request(request):
    """
    Extracts the username from the JWT token in the headers.
    Checks 'Authorization', 'X-User-Token', and META fallback.
    """
    token = None
    if hasattr(request, 'headers'):
        token = request.headers.get('X-User-Token') or request.headers.get('Authorization')
        if token and token.startswith('Bearer '):
            token = token.split(' ')[1]
    
    if not token:
        token = request.META.get('HTTP_X_USER_TOKEN')
        if not token:
            auth_header = request.META.get('HTTP_AUTHORIZATION')
            if auth_header and auth_header.startswith('Bearer '):
                token = auth_header.split(' ')[1]

    if token:
        try:
            import jwt
            from django.conf import settings
            payload = jwt.decode(token, settings.SECRET_KEY, algorithms=["HS256"])
            return payload.get('username', 'Unknown')
        except Exception:
            return 'Unknown'
    return 'Unknown'

def create_audit_log(performer, action, details, performer_name=None):
    """
    Standardizes log creation across the application.
    - performer: User object, or None
    - action: Short description
    - details: Detailed description
    - performer_name: String fallback if performer is None
    """
    if isinstance(performer, User):
        return AuditLog.objects.create(
            performer=performer,
            action=action,
            details=details
        )
    
    return AuditLog.objects.create(
        performer_name=str(performer) if performer else (performer_name or 'System'),
        action=action,
        details=details
    )
