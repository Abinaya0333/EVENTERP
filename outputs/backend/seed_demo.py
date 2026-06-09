import os

os.environ.setdefault("DJANGO_SETTINGS_MODULE", "event_management.settings")

import django

django.setup()

from accounts.models import Profile
from departments.models import Department
from users.models import User


PASSWORD = "Password123"


def upsert_user(email, name, role, is_staff=False, is_superuser=False):
    first_name, *rest = name.split()
    user, created = User.objects.get_or_create(
        email=email,
        defaults={
            "username": email,
            "first_name": first_name,
            "last_name": " ".join(rest),
            "is_staff": is_staff,
            "is_superuser": is_superuser,
        },
    )
    user.username = email
    user.first_name = first_name
    user.last_name = " ".join(rest)
    user.is_staff = is_staff
    user.is_superuser = is_superuser
    user.is_active = True
    user.set_password(PASSWORD)
    user.save()
    Profile.objects.update_or_create(user=user, defaults={"role": role})
    print(("created" if created else "updated"), email, role)


Department.objects.get_or_create(name="Computer Science and Engineering", code="CSE")
Department.objects.get_or_create(name="Information Technology", code="IT")
Department.objects.get_or_create(name="Electronics and Communication Engineering", code="ECE")

upsert_user("admin@cit.edu", "Admin User", Profile.Role.ADMIN, is_staff=True, is_superuser=True)
upsert_user("convener@cit.edu", "Convener User", Profile.Role.CONVENER)
upsert_user("participant@cit.edu", "Participant User", Profile.Role.PARTICIPANT)
upsert_user("sanctioner@cit.edu", "Sanctioner User", Profile.Role.SANCTIONER)
upsert_user("committee@cit.edu", "Committee User", Profile.Role.COMMITTEE_MEMBER)

print(f"password for all demo users: {PASSWORD}")
