from django.conf import settings
from django.db import models


class Profile(models.Model):
    class Role(models.TextChoices):
        ADMIN = "ADMIN", "Admin"
        CONVENER = "CONVENER", "Convener"
        PARTICIPANT = "PARTICIPANT", "Participant"
        SANCTIONER = "SANCTIONER", "Sanctioner"
        COMMITTEE_MEMBER = "COMMITTEE_MEMBER", "Committee Member"

    user = models.OneToOneField(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="profile")
    role = models.CharField(max_length=30, choices=Role.choices, default=Role.PARTICIPANT)
    phone = models.CharField(max_length=20, blank=True)
    department = models.ForeignKey("departments.Department", on_delete=models.SET_NULL, null=True, blank=True, related_name="profiles")

    class Meta:
        db_table = "accounts_profile"

    def __str__(self):
        return f"{self.user.email} ({self.role})"
