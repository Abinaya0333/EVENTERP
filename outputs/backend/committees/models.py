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
        TODO = "TODO", "To Do"
        IN_PROGRESS = "IN_PROGRESS", "In Progress"
        DONE = "DONE", "Done"
        BLOCKED = "BLOCKED", "Blocked"

    committee = models.ForeignKey(Committee, on_delete=models.CASCADE, related_name="tasks")
    assigned_to = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="tasks")
    title = models.CharField(max_length=200)
    description = models.TextField(blank=True)
    status = models.CharField(max_length=20, choices=Status.choices, default=Status.TODO)
    deadline = models.DateTimeField()

    class Meta:
        db_table = "committees_task"
        ordering = ("deadline",)
