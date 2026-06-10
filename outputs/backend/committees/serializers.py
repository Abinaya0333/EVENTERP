from django.utils import timezone
from rest_framework import serializers

from .models import Committee, CommitteeMember, Meeting, MeetingAttendance, Task


def normalize_task_status(task):
    status = (task.status or "").upper()
    if status in {"COMPLETED", "DONE"}:
        return "COMPLETED"
    if status in {"IN_PROGRESS"}:
        return "IN_PROGRESS"
    due_date = getattr(task, "due_date", None)
    if status in {"OVERDUE", "BLOCKED"}:
        return "OVERDUE"
    if due_date and due_date < timezone.now() and status not in {"COMPLETED", "DONE"}:
        return "OVERDUE"
    return "PENDING"


def normalize_meeting_status(meeting):
    start = getattr(meeting, "start_time", None)
    end = getattr(meeting, "end_time", None)
    now = timezone.now()
    if start and end:
      if start <= now <= end:
            return "LIVE"
      if now > end:
            return "COMPLETED"
    stored = (meeting.status or "").upper()
    if stored in {"LIVE", "UPCOMING", "COMPLETED"}:
        return stored
    return "UPCOMING"


class CommitteeSerializer(serializers.ModelSerializer):
    event_title = serializers.CharField(source="event.title", read_only=True)

    class Meta:
        model = Committee
        fields = ("id", "name", "event", "event_title", "description")


class CommitteeMemberSerializer(serializers.ModelSerializer):
    committee_name = serializers.CharField(source="committee.name", read_only=True)
    user_name = serializers.CharField(source="user.get_full_name", read_only=True)

    class Meta:
        model = CommitteeMember
        fields = ("id", "committee", "committee_name", "user", "user_name", "role")


class TaskSerializer(serializers.ModelSerializer):
    committee_name = serializers.CharField(source="committee.name", read_only=True)
    event_title = serializers.CharField(source="event.title", read_only=True)
    assigned_to_name = serializers.CharField(source="assigned_to.get_full_name", read_only=True)
    assigned_by_name = serializers.CharField(source="assigned_by.get_full_name", read_only=True)

    class Meta:
        model = Task
        fields = (
            "id",
            "committee",
            "committee_name",
            "event",
            "event_title",
            "assigned_to",
            "assigned_to_name",
            "assigned_by",
            "assigned_by_name",
            "title",
            "description",
            "status",
            "assigned_date",
            "due_date",
            "completed_at",
            "created_at",
            "updated_at",
        )
        read_only_fields = ("assigned_by", "assigned_date", "completed_at", "created_at", "updated_at")

    def to_representation(self, instance):
        data = super().to_representation(instance)
        data["status"] = normalize_task_status(instance)
        return data


class MeetingSerializer(serializers.ModelSerializer):
    event_title = serializers.CharField(source="event.title", read_only=True)
    created_by_name = serializers.CharField(source="created_by.get_full_name", read_only=True)
    committee_member_names = serializers.SerializerMethodField()

    class Meta:
        model = Meeting
        fields = (
            "id",
            "event",
            "event_title",
            "title",
            "description",
            "meeting_type",
            "meeting_link",
            "venue",
            "start_time",
            "end_time",
            "status",
            "created_by",
            "created_by_name",
            "committee_members",
            "committee_member_names",
            "created_at",
            "updated_at",
        )
        read_only_fields = ("created_by", "created_at", "updated_at")

    def get_committee_member_names(self, obj):
        return [member.get_full_name() or member.email for member in obj.committee_members.all()]

    def to_representation(self, instance):
        data = super().to_representation(instance)
        data["status"] = normalize_meeting_status(instance)
        return data


class MeetingAttendanceSerializer(serializers.ModelSerializer):
    meeting_title = serializers.CharField(source="meeting.title", read_only=True)
    event_title = serializers.CharField(source="meeting.event.title", read_only=True)
    committee_member_name = serializers.CharField(source="committee_member.get_full_name", read_only=True)

    class Meta:
        model = MeetingAttendance
        fields = ("id", "meeting", "meeting_title", "event_title", "committee_member", "committee_member_name", "joined_at")
        read_only_fields = ("joined_at",)
