from django.conf import settings
from django.db import models


class Committee(models.Model):
    name = models.CharField(max_length=150)
    event = models.ForeignKey("events.Event", on_delete=models.CASCADE, related_name="committees")
    description = models.TextField(blank=True)

    class Meta:
        db_table = "committees_committee"
        unique_together = ("name", "event")
        ordering = ("event", "name")

    def __str__(self):
        return self.name


class CommitteeMember(models.Model):
    committee = models.ForeignKey(Committee, on_delete=models.CASCADE, related_name="members")
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="committee_memberships")
    role = models.CharField(max_length=100)

    class Meta:
        db_table = "committees_committeemember"
        unique_together = ("committee", "user")


class Task(models.Model):
    class Status(models.TextChoices):
        PENDING = "PENDING", "Pending"
        IN_PROGRESS = "IN_PROGRESS", "In Progress"
        COMPLETED = "COMPLETED", "Completed"
        OVERDUE = "OVERDUE", "Overdue"
        TODO = "TODO", "To Do"
        DONE = "DONE", "Done"
        BLOCKED = "BLOCKED", "Blocked"

    committee = models.ForeignKey(Committee, on_delete=models.CASCADE, related_name="tasks")
    event = models.ForeignKey("events.Event", on_delete=models.CASCADE, related_name="committee_tasks", null=True, blank=True)
    assigned_to = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="tasks")
    assigned_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="assigned_tasks",
    )
    title = models.CharField(max_length=200)
    description = models.TextField(blank=True)
    status = models.CharField(max_length=20, choices=Status.choices, default=Status.PENDING)
    assigned_date = models.DateTimeField(auto_now_add=True)
    due_date = models.DateTimeField()
    completed_at = models.DateTimeField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = "committees_task"
        ordering = ("due_date", "assigned_date")


class Meeting(models.Model):
    class MeetingType(models.TextChoices):
        ONLINE = "ONLINE", "Online"
        OFFLINE = "OFFLINE", "Offline"

    class Status(models.TextChoices):
        UPCOMING = "UPCOMING", "Upcoming"
        LIVE = "LIVE", "Live"
        COMPLETED = "COMPLETED", "Completed"

    event = models.ForeignKey("events.Event", on_delete=models.CASCADE, related_name="committee_meetings")
    title = models.CharField(max_length=200)
    description = models.TextField(blank=True)
    meeting_type = models.CharField(max_length=20, choices=MeetingType.choices, default=MeetingType.ONLINE)
    meeting_link = models.URLField(blank=True)
    venue = models.CharField(max_length=200, blank=True)
    start_time = models.DateTimeField()
    end_time = models.DateTimeField()
    status = models.CharField(max_length=20, choices=Status.choices, default=Status.UPCOMING)
    created_by = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="created_meetings")
    committee_members = models.ManyToManyField(settings.AUTH_USER_MODEL, related_name="assigned_meetings", blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = "committees_meeting"
        ordering = ("start_time",)


class MeetingAttendance(models.Model):
    meeting = models.ForeignKey(Meeting, on_delete=models.CASCADE, related_name="attendance_records")
    committee_member = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="meeting_attendance")
    joined_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = "committees_meetingattendance"
        unique_together = ("meeting", "committee_member")
        ordering = ("-joined_at",)
