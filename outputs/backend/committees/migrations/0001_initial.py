import django.db.models.deletion
from django.conf import settings
from django.db import migrations, models


class Migration(migrations.Migration):
    initial = True

    dependencies = [
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
        ("events", "0001_initial"),
    ]

    operations = [
        migrations.CreateModel(
            name="Committee",
            fields=[
                ("id", models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name="ID")),
                ("name", models.CharField(max_length=150)),
                ("description", models.TextField(blank=True)),
                ("event", models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name="committees", to="events.event")),
            ],
            options={"db_table": "committees_committee", "ordering": ("event", "name"), "unique_together": {("name", "event")}},
        ),
        migrations.CreateModel(
            name="CommitteeMember",
            fields=[
                ("id", models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name="ID")),
                ("role", models.CharField(max_length=100)),
                ("committee", models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name="members", to="committees.committee")),
                ("user", models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name="committee_memberships", to=settings.AUTH_USER_MODEL)),
            ],
            options={"db_table": "committees_committeemember", "unique_together": {("committee", "user")}},
        ),
        migrations.CreateModel(
            name="Task",
            fields=[
                ("id", models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name="ID")),
                ("title", models.CharField(max_length=200)),
                ("description", models.TextField(blank=True)),
                ("status", models.CharField(choices=[("TODO", "To Do"), ("IN_PROGRESS", "In Progress"), ("DONE", "Done"), ("BLOCKED", "Blocked")], default="TODO", max_length=20)),
                ("deadline", models.DateTimeField()),
                ("assigned_to", models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name="tasks", to=settings.AUTH_USER_MODEL)),
                ("committee", models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name="tasks", to="committees.committee")),
            ],
            options={"db_table": "committees_task", "ordering": ("deadline",)},
        ),
    ]
