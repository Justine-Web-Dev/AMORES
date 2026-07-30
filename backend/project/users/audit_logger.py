from .models import AuditLog

def log_action(user, action, details, target_resource=None, changes=None, ip_address=None):
    """
    Utility function to safely create an AuditLog entry.
    """
    try:
        # Avoid breaking if user is AnonymousUser
        is_authenticated = getattr(user, 'is_authenticated', False)
        
        performer_name = ""
        user_instance = None
        
        if is_authenticated:
            user_instance = user
            performer_name = getattr(user, 'name', user.email)
        else:
            performer_name = "Anonymous / System"
        
        AuditLog.objects.create(
            performer=user_instance,
            performer_name=performer_name,
            action=action,
            details=details,
            target_resource=target_resource,
            changes=changes,
            ip_address=ip_address
        )
    except Exception as e:
        # We catch exceptions here to ensure that logging failure doesn't break the main request flow.
        print(f"[Audit Logger] Failed to create audit log: {e}", flush=True)
