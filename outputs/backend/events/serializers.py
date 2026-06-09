from rest_framework import serializers

from .models import Attendance, Certificate, Event, Feedback, Registration


class EventSerializer(serializers.ModelSerializer):
    created_by_name = serializers.CharField(source="created_by.get_full_name", read_only=True)
    department_name = serializers.CharField(source="department.name", read_only=True)
    registrations_count = serializers.IntegerField(read_only=True)

    class Meta:
        model = Event
        fields = (
            "id",
            "title",
            "description",
            "start_date",
            "end_date",
            "location",
            "status",
            "created_by",
            "created_by_name",
            "department",
            "department_name",
            "registrations_count",
        )
        read_only_fields = ("created_by", "registrations_count")


class RegistrationSerializer(serializers.ModelSerializer):
    event_title = serializers.CharField(source="event.title", read_only=True)
    user_name = serializers.CharField(source="user.get_full_name", read_only=True)

    class Meta:
        model = Registration
        fields = ("id", "event", "event_title", "user", "user_name", "registered_at", "status")
        read_only_fields = ("user", "registered_at")


class AttendanceSerializer(serializers.ModelSerializer):
    event_title = serializers.CharField(source="event.title", read_only=True)
    user_name = serializers.CharField(source="user.get_full_name", read_only=True)

    class Meta:
        model = Attendance
        fields = ("id", "event", "event_title", "user", "user_name", "status", "marked_at")
        read_only_fields = ("marked_at",)


class FeedbackSerializer(serializers.ModelSerializer):
    event_title = serializers.CharField(source="event.title", read_only=True)
    user_name = serializers.CharField(source="user.get_full_name", read_only=True)

    class Meta:
        model = Feedback
        fields = ("id", "event", "event_title", "user", "user_name", "rating", "comment")
        read_only_fields = ("user",)


class CertificateSerializer(serializers.ModelSerializer):
    event_title = serializers.CharField(source="event.title", read_only=True)
    user_name = serializers.CharField(source="user.get_full_name", read_only=True)

    class Meta:
        model = Certificate
        fields = ("id", "event", "event_title", "user", "user_name", "certificate_url", "issued_at")
        read_only_fields = ("issued_at",)
