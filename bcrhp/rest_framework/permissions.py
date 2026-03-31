from arches.app.utils.permission_backend import group_required
from rest_framework import permissions


class LocalGovernment(permissions.BasePermission):
    def has_permission(self, request, view):
        return group_required(request.user, "Local Government")
