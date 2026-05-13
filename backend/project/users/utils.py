from .models import AuditLog, User

def get_user_from_request(request):
    """
    Extracts the username from the JWT token in the headers.
    Checks 'Authorization', 'X-User-Token', and META fallback.
    Returns 'Unknown' if no user found.
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
            username = payload.get('username', 'Unknown')
            print(f"[AUDIT] Extracted user from token: {username}")  # Debug log
            return username
        except Exception as e:
            print(f"[AUDIT] Error decoding token: {str(e)}")  # Debug log
            return 'Unknown'
    print("[AUDIT] No token found in request")  # Debug log
    return 'Unknown'

def create_audit_log(performer, action, details, performer_name=None):
    """
    Standardizes log creation across the application.
    - performer: User object, or None
    - action: Short description (e.g., 'LOGIN', 'USER_REGISTRATION', 'STATUS_UPDATE')
    - details: Detailed description of what happened
    - performer_name: String fallback if performer is None
    
    Returns the created AuditLog object or None if creation failed.
    """
    try:
        if isinstance(performer, User) and performer.username:
            log = AuditLog.objects.create(
                performer=performer,
                action=action,
                details=details
            )
            print(f"[AUDIT] Created log: {performer.username} - {action}")
            return log
        
        # Fallback: use performer_name or 'System'
        user_str = str(performer) if performer else (performer_name or 'System')
        log = AuditLog.objects.create(
            performer_name=user_str,
            action=action,
            details=details
        )
        print(f"[AUDIT] Created log: {user_str} - {action}")
        return log
    except Exception as e:
        print(f"[AUDIT] Error creating audit log: {str(e)}")
        return None
