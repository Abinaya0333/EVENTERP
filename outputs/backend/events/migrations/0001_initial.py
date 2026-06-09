import django.core.validators
import django.db.models.deletion
from django.conf import settings
from django.db import migrations, models


class Migration(migrations.Migration):
    initial = True

    dependencies = [
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
        ("departments", "0001_initial"),
    ]

    operations = [
        migrations.CreateModel(
            name="Event",
            fields=[
                ("id", models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name="ID")),
                ("title", models.CharField(max_length=200)),
                ("description", models.TextField(blank=True)),
                ("start_date", models.DateTimeField()),
                ("end_date", models.DateTimeField()),
                ("location", models.CharField(max_length=200)),
                ("status", models.CharField(choices=[("DRAFT", "Draft"), ("PENDING", "Pending Approval"), ("APPROVED", "Approved"), ("REJECTED", "Rejected"), ("COMPLETED", "Completed")], default="DRAFT", max_length=20)),
                ("created_by", models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name="created_events", to=settings.AUTH_USER_MODEL)),
                ("department", models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name="events", to="departments.department")),
            ],
            options={"db_table": "events_event", "ordering": ("-start_date",)},
        ),
        migrations.CreateModel(
            name="Registration",
            fields=[
                ("id", models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name="ID")),
                ("registered_at", models.DateTimeField(auto_now_add=True)),
                ("status", models.CharField(choices=[("REGISTERED", "Registered"), ("CANCELLED", "Cancelled"), ("WAITLISTED", "Waitlisted")], default="REGISTERED", max_length=20)),
                ("event", models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name="registrations", to="events.event")),
                ("user", models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name="registrations", to=settings.AUTH_USER_MODEL)),
            ],
            options={"db_table": "events_registration", "ordering": ("-registered_at",), "unique_together": {("event", "user")}},
        ),
        migrations.CreateModel(
            name="Attendance",
            fields=[
                ("id", models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name="ID")),
                ("status", models.CharField(choices=[("PRESENT", "Present"), ("ABSENT", "Absent")], max_length=10)),
                ("marked_at", models.DateTimeField(auto_now=True)),
                ("event", models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name="attendance", to="events.event")),
                ("user", models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name="attendance", to=settings.AUTH_USER_MODEL)),
            ],
            options={"db_table": "events_attendance", "ordering": ("-marked_at",), "unique_together": {("event", "user")}},
        ),
        migrations.CreateModel(
            name="Feedback",
            fields=[
                ("id", models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name="ID")),
                ("rating", models.PositiveSmallIntegerField(validators=[django.core.validators.MinValueValidator(1), django.core.validators.MaxValueValidator(5)])),
                ("comment", models.TextField(blank=True)),
                ("event", models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name="feedback", to="events.event")),
                ("user", models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name="feedback", to=settings.AUTH_USER_MODEL)),
            ],
            options={"db_table": "events_feedback", "unique_together": {("event", "user")}},
        ),
        migrations.CreateModel(
            name="Certificate",
            fields=[
                ("id", models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name="ID")),
                ("certificate_url", models.URLField(max_length=500)),
                ("issued_at", models.DateTimeField(auto_now_add=True)),
                ("event", models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name="certificates", to="events.event")),
                ("user", models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name="certificates", to=settings.AUTH_USER_MODEL)),
            ],
            options={"db_table": "events_certificate", "ordering": ("-issued_at",), "unique_together": {("event", "user")}},
        ),
    ]
