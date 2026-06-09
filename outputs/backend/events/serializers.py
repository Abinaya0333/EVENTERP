from rest_framework import serializers

from .models import ApprovalRequest, Attendance, Certificate, Event, Feedback, Registration


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
            "approval_level",
            "created_by",
            "created_by_name",
            "department",
            "department_name",
            "registrations_count",
        )
        read_only_fields = ("created_by", "registrations_count")


class ApprovalRequestSerializer(serializers.ModelSerializer):
    event_title = serializers.CharField(source="event.title", read_only=True)
    event_description = serializers.CharField(source="event.description", read_only=True)
    event_location = serializers.CharField(source="event.location", read_only=True)
    event_start_date = serializers.DateTimeField(source="event.start_date", read_only=True)
    event_end_date = serializers.DateTimeField(source="event.end_date", read_only=True)
    event_status = serializers.CharField(source="event.status", read_only=True)
    decided_by_name = serializers.CharField(source="decided_by.get_full_name", read_only=True)

    class Meta:
        model = ApprovalRequest
        fields = (
            "id",
            "event",
            "event_title",
            "event_description",
            "event_location",
            "event_start_date",
            "event_end_date",
            "event_status",
            "level",
            "decision",
            "decided_by",
            "decided_by_name",
            "comment",
            "created_at",
            "decided_at",
        )
        read_only_fields = fields


class RegistrationSerializer(serializers.ModelSerializer):
    event_title = serializers.CharField(source="event.title", read_only=True)
    event_description = serializers.CharField(source="event.description", read_only=True)
    event_location = serializers.CharField(source="event.location", read_only=True)
    event_start_date = serializers.DateTimeField(source="event.start_date", read_only=True)
    event_end_date = serializers.DateTimeField(source="event.end_date", read_only=True)
    event_status = serializers.CharField(source="event.status", read_only=True)
    user_name = serializers.CharField(source="user.get_full_name", read_only=True)

    class Meta:
        model = Registration
        fields = (
            "id",
            "event",
            "event_title",
            "event_description",
            "event_location",
            "event_start_date",
            "event_end_date",
            "event_status",
            "user",
            "user_name",
            "registered_at",
            "status",
        )
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
    event_status = serializers.CharField(source="event.status", read_only=True)
    user_name = serializers.CharField(source="user.get_full_name", read_only=True)

    class Meta:
        model = Feedback
        fields = ("id", "event", "event_title", "event_status", "user", "user_name", "rating", "comment")
        read_only_fields = ("user",)


class CertificateSerializer(serializers.ModelSerializer):
    event_title = serializers.CharField(source="event.title", read_only=True)
    event_status = serializers.CharField(source="event.status", read_only=True)
    user_name = serializers.CharField(source="user.get_full_name", read_only=True)

    class Meta:
        model = Certificate
        fields = ("id", "event", "event_title", "event_status", "user", "user_name", "certificate_url", "issued_at")
        read_only_fields = ("issued_at",)
