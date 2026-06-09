from django.conf import settings
from django.db import models


class Notification(models.Model):
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="notifications")
    event = models.ForeignKey("events.Event", on_delete=models.CASCADE, related_name="notifications", null=True, blank=True)
    message = models.TextField()
    type = models.CharField(max_length=50)
    is_read = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = "notifications_notification"
        ordering = ("-created_at",)


class EventReport(models.Model):
    event = models.ForeignKey("events.Event", on_delete=models.CASCADE, related_name="reports")
    report = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = "notifications_eventreport"
        ordering = ("-created_at",)
