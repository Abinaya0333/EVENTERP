from rest_framework import serializers

from .models import Profile


class ProfileSerializer(serializers.ModelSerializer):
    email = serializers.EmailField(source="user.email", read_only=True)
    name = serializers.SerializerMethodField()
    department_name = serializers.CharField(source="department.name", read_only=True)

    class Meta:
        model = Profile
        fields = ("id", "user", "email", "name", "role", "approval_level", "approval_title", "phone", "department", "department_name")

    def get_name(self, obj):
        return obj.user.get_full_name() or obj.user.email
