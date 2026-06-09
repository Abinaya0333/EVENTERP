from django.db import models


class PermissionRule(models.Model):
    permission = models.CharField(max_length=80)
    role = models.CharField(max_length=30)
    allowed = models.BooleanField(default=False)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = "common_permission_rule"
        unique_together = ("permission", "role")
        ordering = ("permission", "role")

    def __str__(self):
        return f"{self.permission}:{self.role}={self.allowed}"
