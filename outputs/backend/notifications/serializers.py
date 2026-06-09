from rest_framework import serializers

from .models import EventReport, Notification


class NotificationSerializer(serializers.ModelSerializer):
    event_title = serializers.CharField(source="event.title", read_only=True)

    class Meta:
        model = Notification
        fields = ("id", "user", "event", "event_title", "message", "type", "is_read", "created_at")
        read_only_fields = ("created_at",)


class EventReportSerializer(serializers.ModelSerializer):
    event_title = serializers.CharField(source="event.title", read_only=True)

    class Meta:
        model = EventReport
        fields = ("id", "event", "event_title", "report", "created_at")
        read_only_fields = ("created_at",)
