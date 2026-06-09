import os

os.environ.setdefault("DJANGO_SETTINGS_MODULE", "event_management.settings")

import django

django.setup()

from accounts.models import Profile
from departments.models import Department
from users.models import User


PASSWORDS = {
    "admin@cit.edu": "Admin@123",
    "convener@cit.edu": "Convener@123",
    "committee@cit.edu": "Committee@123",
    "participant@cit.edu": "Participant@123",
    "sanctioner@cit.edu": "Password123",
    "hod@cit.edu": "Hod@123456",
    "dean@cit.edu": "Dean@123456",
    "principal@cit.edu": "Principal@123456",
}


def upsert_user(email, name, role, is_staff=False, is_superuser=False, approval_level=None, approval_title=""):
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
    user.set_password(PASSWORDS.get(email, "Password123"))
    user.save()
    Profile.objects.update_or_create(
        user=user,
        defaults={"role": role, "approval_level": approval_level, "approval_title": approval_title},
    )
    print(("created" if created else "updated"), email, role)


Department.objects.get_or_create(name="Computer Science and Engineering", code="CSE")
Department.objects.get_or_create(name="Information Technology", code="IT")
Department.objects.get_or_create(name="Electronics and Communication Engineering", code="ECE")

upsert_user("admin@cit.edu", "Admin User", Profile.Role.ADMIN, is_staff=True, is_superuser=True)
upsert_user("convener@cit.edu", "Convener User", Profile.Role.CONVENER)
upsert_user("participant@cit.edu", "Participant User", Profile.Role.PARTICIPANT)
upsert_user("sanctioner@cit.edu", "Sanctioner User", Profile.Role.SANCTIONER, approval_level=1, approval_title="HOD")
upsert_user("committee@cit.edu", "Committee User", Profile.Role.COMMITTEE_MEMBER)
upsert_user("hod@cit.edu", "HoD Sanctioner", Profile.Role.SANCTIONER, approval_level=1, approval_title="HOD")
upsert_user("dean@cit.edu", "Dean Sanctioner", Profile.Role.SANCTIONER, approval_level=2, approval_title="DEAN")
upsert_user("principal@cit.edu", "Principal Sanctioner", Profile.Role.SANCTIONER, approval_level=3, approval_title="PRINCIPAL")

for email, password in PASSWORDS.items():
    user = User.objects.get(email=email)
    user.set_password(password)
    user.save(update_fields=["password"])

print("demo passwords updated to match the reference workflow")
