from rest_framework import serializers

from .models import Committee, CommitteeMember, Task


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
    assigned_to_name = serializers.CharField(source="assigned_to.get_full_name", read_only=True)

    class Meta:
        model = Task
        fields = ("id", "committee", "committee_name", "assigned_to", "assigned_to_name", "title", "description", "status", "deadline")
