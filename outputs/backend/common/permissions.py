from rest_framework.permissions import SAFE_METHODS, BasePermission


class Roles:
    ADMIN = "ADMIN"
    CONVENER = "CONVENER"
    PARTICIPANT = "PARTICIPANT"
    SANCTIONER = "SANCTIONER"
    COMMITTEE_MEMBER = "COMMITTEE_MEMBER"


def user_role(user):
    if not user or not user.is_authenticated:
        return None
    if user.is_staff or user.is_superuser:
        return Roles.ADMIN
    return getattr(getattr(user, "profile", None), "role", None)


class IsAdminRole(BasePermission):
    def has_permission(self, request, view):
        return user_role(request.user) == Roles.ADMIN


class IsAdminOrReadOnly(BasePermission):
    def has_permission(self, request, view):
        return request.method in SAFE_METHODS or user_role(request.user) == Roles.ADMIN


class IsAdminOrConvener(BasePermission):
    def has_permission(self, request, view):
        return user_role(request.user) in {Roles.ADMIN, Roles.CONVENER}


class IsAdminConvenerOrCommittee(BasePermission):
    def has_permission(self, request, view):
        return user_role(request.user) in {Roles.ADMIN, Roles.CONVENER, Roles.COMMITTEE_MEMBER}


class IsAdminConvenerOrSanctioner(BasePermission):
    def has_permission(self, request, view):
        return user_role(request.user) in {Roles.ADMIN, Roles.CONVENER, Roles.SANCTIONER}


class IsOwnerAdminOrReadOnly(BasePermission):
    owner_field = "user"

    def has_object_permission(self, request, view, obj):
        if user_role(request.user) == Roles.ADMIN:
            return True
        owner = getattr(obj, self.owner_field, None)
        if request.method in SAFE_METHODS:
            return owner == request.user or user_role(request.user) in {Roles.CONVENER, Roles.SANCTIONER}
        return owner == request.user
