from django.db import migrations, models


class Migration(migrations.Migration):

    initial = True

    dependencies = []

    operations = [
        migrations.CreateModel(
            name="PermissionRule",
            fields=[
                ("id", models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name="ID")),
                ("permission", models.CharField(max_length=80)),
                ("role", models.CharField(max_length=30)),
                ("allowed", models.BooleanField(default=False)),
                ("updated_at", models.DateTimeField(auto_now=True)),
            ],
            options={
                "db_table": "common_permission_rule",
                "ordering": ("permission", "role"),
                "unique_together": {("permission", "role")},
            },
        ),
    ]
