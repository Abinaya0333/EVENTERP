from django.db import models


class Department(models.Model):
    name = models.CharField(max_length=150, unique=True)
    code = models.CharField(max_length=20, unique=True)

    class Meta:
        db_table = "departments_department"
        ordering = ("name",)

    def __str__(self):
        return f"{self.code} - {self.name}"
