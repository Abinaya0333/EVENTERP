from django.contrib.auth import get_user_model
from django.contrib.auth.tokens import default_token_generator
from django.utils.encoding import force_bytes, force_str
from django.utils.http import urlsafe_base64_decode, urlsafe_base64_encode
from rest_framework import serializers
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework_simplejwt.token_blacklist.models import BlacklistedToken, OutstandingToken

from accounts.models import Profile


User = get_user_model()


class CustomTokenObtainPairSerializer(TokenObtainPairSerializer):
    email = serializers.EmailField()
    password = serializers.CharField(write_only=True)

    def validate(self, attrs):
        email = attrs.get("email", "").strip().lower()
        password = attrs.get("password", "")

        user = User.objects.filter(email__iexact=email).select_related("profile", "profile__department").first()
        if not user or not user.check_password(password):
            raise serializers.ValidationError({"detail": "No active account found with the given credentials"})

        if not user.is_active:
            raise serializers.ValidationError({"detail": "This account is inactive."})

        refresh = RefreshToken.for_user(user)
        data = {
            "refresh": str(refresh),
            "access": str(refresh.access_token),
            "user": UserDetailSerializer(user).data,
        }
        return data


class RegisterSerializer(serializers.ModelSerializer):
    name = serializers.CharField(write_only=True, required=False, allow_blank=True)
    role = serializers.ChoiceField(choices=Profile.Role.choices, default=Profile.Role.PARTICIPANT, write_only=True)
    password = serializers.CharField(write_only=True, min_length=8)

    class Meta:
        model = User
        fields = ("id", "email", "password", "name", "role")
        read_only_fields = ("id",)

    def create(self, validated_data):
        name = validated_data.pop("name", "")
        role = validated_data.pop("role", Profile.Role.PARTICIPANT)
        name_parts = name.strip().split()
        first_name = name_parts[0] if name_parts else ""
        rest = name_parts[1:]
        user = User.objects.create_user(
            email=validated_data["email"].lower(),
            password=validated_data["password"],
            first_name=first_name if name else "",
            last_name=" ".join(rest),
        )
        Profile.objects.update_or_create(user=user, defaults={"role": role})
        return user


class UserDetailSerializer(serializers.ModelSerializer):
    role = serializers.CharField(source="profile.role", read_only=True)
    phone = serializers.CharField(source="profile.phone", read_only=True)
    department = serializers.CharField(source="profile.department.name", read_only=True)
    department_id = serializers.IntegerField(source="profile.department_id", read_only=True)
    name = serializers.SerializerMethodField()

    class Meta:
        model = User
        fields = (
            "id",
            "username",
            "email",
            "first_name",
            "last_name",
            "name",
            "role",
            "phone",
            "department",
            "department_id",
            "is_staff",
            "is_active",
            "date_joined",
        )
        read_only_fields = fields

    def get_name(self, obj):
        return obj.get_full_name() or obj.email


class UserWriteSerializer(serializers.ModelSerializer):
    role = serializers.ChoiceField(choices=Profile.Role.choices, write_only=True, required=False)
    phone = serializers.CharField(write_only=True, required=False, allow_blank=True)
    department_id = serializers.IntegerField(write_only=True, required=False, allow_null=True)
    password = serializers.CharField(write_only=True, required=False, min_length=8)

    class Meta:
        model = User
        fields = (
            "id",
            "username",
            "email",
            "password",
            "first_name",
            "last_name",
            "role",
            "phone",
            "department_id",
            "is_staff",
            "is_active",
        )
        read_only_fields = ("id",)

    def create(self, validated_data):
        profile_data = {
            "role": validated_data.pop("role", Profile.Role.PARTICIPANT),
            "phone": validated_data.pop("phone", ""),
            "department_id": validated_data.pop("department_id", None),
        }
        password = validated_data.pop("password", None)
        validated_data.setdefault("username", validated_data.get("email", ""))
        user = User(**validated_data)
        if password:
            user.set_password(password)
        else:
            user.set_unusable_password()
        user.save()
        Profile.objects.update_or_create(user=user, defaults=profile_data)
        return user

    def update(self, instance, validated_data):
        profile_fields = {}
        for key in ("role", "phone", "department_id"):
            if key in validated_data:
                profile_fields[key] = validated_data.pop(key)
        password = validated_data.pop("password", None)
        for key, value in validated_data.items():
            setattr(instance, key, value)
        if password:
            instance.set_password(password)
        instance.save()
        if profile_fields:
            Profile.objects.update_or_create(user=instance, defaults=profile_fields)
        return instance


class PasswordResetRequestSerializer(serializers.Serializer):
    email = serializers.EmailField()

    def validate_email(self, value):
        return value.strip().lower()

    def create(self, validated_data):
        email = validated_data["email"]
        user = User.objects.filter(email__iexact=email, is_active=True).first()
        if not user:
            raise serializers.ValidationError({"email": "No active account found for that email address."})

        uid = urlsafe_base64_encode(force_bytes(user.pk))
        token = default_token_generator.make_token(user)
        return {
            "uid": uid,
            "token": token,
            "email": user.email,
            "reset_link": f"/reset-password?uid={uid}&token={token}",
        }


class PasswordResetConfirmSerializer(serializers.Serializer):
    uid = serializers.CharField()
    token = serializers.CharField()
    new_password = serializers.CharField(write_only=True, min_length=8)
    confirm_password = serializers.CharField(write_only=True, min_length=8)

    def validate(self, attrs):
        if attrs["new_password"] != attrs["confirm_password"]:
            raise serializers.ValidationError({"confirm_password": "Passwords do not match."})

        try:
            user_id = force_str(urlsafe_base64_decode(attrs["uid"]))
            user = User.objects.get(pk=user_id, is_active=True)
        except (TypeError, ValueError, OverflowError, User.DoesNotExist):
            raise serializers.ValidationError({"uid": "Invalid reset link."})

        if not default_token_generator.check_token(user, attrs["token"]):
            raise serializers.ValidationError({"token": "This reset token is invalid or has expired."})

        attrs["user"] = user
        return attrs

    def save(self, **kwargs):
        user = self.validated_data["user"]
        user.set_password(self.validated_data["new_password"])
        user.save(update_fields=["password"])

        for token in OutstandingToken.objects.filter(user=user):
            BlacklistedToken.objects.get_or_create(token=token)

        return user
