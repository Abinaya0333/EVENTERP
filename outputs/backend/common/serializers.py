from rest_framework import serializers

from .models import PermissionRule


class PermissionRuleSerializer(serializers.ModelSerializer):
    class Meta:
        model = PermissionRule
        fields = ("id", "permission", "role", "allowed", "updated_at")
        read_only_fields = ("updated_at",)
