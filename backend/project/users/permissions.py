from rest_framework.permissions import BasePermission
from .models import User

class IsSuperAdmin(BasePermission):
    def has_permission(self, request, view):
        return bool(request.user and request.user.is_authenticated and request.user.role == User.Roles.SUPER_ADMIN)

class IsAdministrator(BasePermission):
    def has_permission(self, request, view):
        return bool(request.user and request.user.is_authenticated and request.user.role in [User.Roles.SUPER_ADMIN, User.Roles.ADMINISTRATOR])

class IsRecruiter(BasePermission):
    def has_permission(self, request, view):
        is_auth = bool(request.user and request.user.is_authenticated)
        role = getattr(request.user, 'role', None)
        has_perm = is_auth and role in [User.Roles.SUPER_ADMIN, User.Roles.ADMINISTRATOR, User.Roles.RECRUITER]
        print(f"[DEBUG IsRecruiter] user: {request.user}, is_auth: {is_auth}, role: {role}, has_perm: {has_perm}", flush=True)
        return has_perm

class IsRecruiterOrInterviewer(BasePermission):
    def has_permission(self, request, view):
        is_auth = bool(request.user and request.user.is_authenticated)
        role = getattr(request.user, 'role', None)
        return is_auth and role in [User.Roles.SUPER_ADMIN, User.Roles.ADMINISTRATOR, User.Roles.RECRUITER, User.Roles.INTERVIEWER]

class IsInterviewer(BasePermission):
    def has_permission(self, request, view):
        return bool(request.user and request.user.is_authenticated and request.user.role == User.Roles.INTERVIEWER)

class HasDynamicPermission:
    """
    A factory function that returns a BasePermission class 
    which checks if the user has a specific dynamic permission.
    """
    def __init__(self, resource, action):
        self.resource = resource
        self.action = action
        
    def __call__(self):
        resource = self.resource
        action = self.action
        
        class _HasDynamicPermission(BasePermission):
            def has_permission(self, request, view):
                if not request.user or not request.user.is_authenticated:
                    return False
                
                # Super Admin bypasses all checks
                if getattr(request.user, 'role', None) == 'SUPER_ADMIN':
                    return True
                    
                # Dynamic check
                # Check if any of the user's roles have this permission
                # (Assuming we might map users to roles in the future, for now they just have a string 'role' which we'll need to look up in the Role table)
                from .models import Role, RolePermission
                
                try:
                    user_role = Role.objects.get(name=request.user.role)
                    return RolePermission.objects.filter(
                        role=user_role,
                        permission__resource=resource,
                        permission__action=action
                    ).exists()
                except Role.DoesNotExist:
                    return False
                    
        return _HasDynamicPermission
