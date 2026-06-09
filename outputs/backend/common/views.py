from rest_framework import viewsets

from .permissions import IsAdminRole
from .models import PermissionRule
from .serializers import PermissionRuleSerializer


class PermissionRuleViewSet(viewsets.ModelViewSet):
    queryset = PermissionRule.objects.all()
    serializer_class = PermissionRuleSerializer
    permission_classes = [IsAdminRole]
