import jwt
from django.conf import settings
from .models import AuditLog

def get_user_from_request(request):
    """
    Extracts the username from the JWT token in the headers.
    Checks 'Authorization', 'X-User-Token', and META fallback.
    """
    token = None
    
    # Debug: Print available headers
    # print(f"Available Headers: {list(request.headers.keys()) if hasattr(request, 'headers') else 'No headers attribute'}")
    
    # Try request.headers (DRF or newer Django)
    if hasattr(request, 'headers'):
        token = request.headers.get('X-User-Token') or request.headers.get('Authorization')
        if token and token.startswith('Bearer '):
            token = token.split(' ')[1]
    
    # Fallback to META (Standard Django)
    if not token:
        token = request.META.get('HTTP_X_USER_TOKEN')
        if not token:
            auth_header = request.META.get('HTTP_AUTHORIZATION')
            if auth_header and auth_header.startswith('Bearer '):
                token = auth_header.split(' ')[1]

    if token:
        try:
            # Decode without strict checking first to see if it's even a JWT
            payload = jwt.decode(token, settings.SECRET_KEY, algorithms=["HS256"])
            return payload.get('username', 'Unknown')
        except Exception as e:
            # For debugging purposes in development
            print(f"JWT Decode Error: {e}")
            return 'Unknown'
    return 'Unknown'

def create_audit_log(user, action, details, request=None):
    """
    Standardizes log creation across the application.
    - user: Username or 'System'
    - action: Short description (e.g., 'LOGIN', 'STATUS_UPDATE')
    - details: Detailed description of the event
    - request: Optional Django request object to extract user info
    """
    # Priority 1: Check the request body for an explicit 'performed_by'
    if request and hasattr(request, 'data'):
        body_user = request.data.get('performed_by')
        if body_user and body_user != 'Unknown':
            user = body_user
            return AuditLog.objects.create(user=user, action=action, details=details)

    # Priority 2: Try to get the actual user from the token in headers
    # We SKIP this for LOGIN and REGISTRATION because the request might contain 
    # a stale token from a previous session (e.g. logging in as a different user).
    if request and action not in ['LOGIN', 'USER_REGISTRATION', 'APPLICANT_REGISTRATION']:
        token_user = get_user_from_request(request)
        if token_user != 'Unknown':
            user = token_user
        else:
            # Debugging: Why was the user not found?
            print(f"Warning: Could not resolve user from token for action {action}. Falling back to {user}.")
    
    return AuditLog.objects.create(
        user=user,
        action=action,
        details=details
    )
