from django.conf import settings
from django.core.validators import MaxValueValidator, MinValueValidator
from django.db import models


class Event(models.Model):
    class Status(models.TextChoices):
        DRAFT = "DRAFT", "Draft"
        PENDING = "PENDING", "Pending Approval"
        APPROVED = "APPROVED", "Approved"
        REJECTED = "REJECTED", "Rejected"
        COMPLETED = "COMPLETED", "Completed"

    title = models.CharField(max_length=200)
    description = models.TextField(blank=True)
    start_date = models.DateTimeField()
    end_date = models.DateTimeField()
    location = models.CharField(max_length=200)
    status = models.CharField(max_length=20, choices=Status.choices, default=Status.DRAFT)
    approval_level = models.PositiveSmallIntegerField(default=1)
    created_by = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="created_events")
    department = models.ForeignKey("departments.Department", on_delete=models.CASCADE, related_name="events")

    class Meta:
        db_table = "events_event"
        ordering = ("-start_date",)

    def __str__(self):
        return self.title


class Registration(models.Model):
    class Status(models.TextChoices):
        REGISTERED = "REGISTERED", "Registered"
        CANCELLED = "CANCELLED", "Cancelled"
        WAITLISTED = "WAITLISTED", "Waitlisted"

    event = models.ForeignKey(Event, on_delete=models.CASCADE, related_name="registrations")
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="registrations")
    registered_at = models.DateTimeField(auto_now_add=True)
    status = models.CharField(max_length=20, choices=Status.choices, default=Status.REGISTERED)

    class Meta:
        db_table = "events_registration"
        unique_together = ("event", "user")
        ordering = ("-registered_at",)


class Attendance(models.Model):
    class Status(models.TextChoices):
        PRESENT = "PRESENT", "Present"
        ABSENT = "ABSENT", "Absent"

    event = models.ForeignKey(Event, on_delete=models.CASCADE, related_name="attendance")
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="attendance")
    status = models.CharField(max_length=10, choices=Status.choices)
    marked_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = "events_attendance"
        unique_together = ("event", "user")
        ordering = ("-marked_at",)


class Feedback(models.Model):
    event = models.ForeignKey(Event, on_delete=models.CASCADE, related_name="feedback")
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="feedback")
    rating = models.PositiveSmallIntegerField(validators=[MinValueValidator(1), MaxValueValidator(5)])
    comment = models.TextField(blank=True)

    class Meta:
        db_table = "events_feedback"
        unique_together = ("event", "user")


class Certificate(models.Model):
    event = models.ForeignKey(Event, on_delete=models.CASCADE, related_name="certificates")
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="certificates")
    certificate_url = models.URLField(max_length=500)
    issued_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = "events_certificate"
        unique_together = ("event", "user")
        ordering = ("-issued_at",)


class ApprovalRequest(models.Model):
    class Decision(models.TextChoices):
        PENDING = "PENDING", "Pending"
        APPROVED = "APPROVED", "Approved"
        REJECTED = "REJECTED", "Rejected"
        SENT_BACK = "SENT_BACK", "Sent back"

    event = models.ForeignKey(Event, on_delete=models.CASCADE, related_name="approval_requests")
    level = models.PositiveSmallIntegerField()
    decision = models.CharField(max_length=20, choices=Decision.choices, default=Decision.PENDING)
    decided_by = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, blank=True, related_name="approval_decisions")
    comment = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    decided_at = models.DateTimeField(null=True, blank=True)

    class Meta:
        db_table = "events_approval_request"
        ordering = ("-created_at",)
