from rest_framework import permissions

class IsTeacherOrReadOnly(permissions.BasePermission):
    """
    Custom permission to only allow teachers to edit an object.
    """

    def has_permission(self, request, view):
        # Read permissions are allowed to any request,
        # so we'll always allow GET, HEAD or OPTIONS requests.
        if request.method in permissions.SAFE_METHODS:
            return True

        # Write permissions are only allowed to the teacher of the course.
        return request.user and request.user.is_authenticated and request.user.role == 'teacher'
