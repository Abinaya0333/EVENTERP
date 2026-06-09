from django.contrib import admin

from .models import Profile


@admin.register(Profile)
class ProfileAdmin(admin.ModelAdmin):
    list_display = ("id", "user", "role", "phone", "department")
    list_filter = ("role", "department")
    search_fields = ("user__email", "user__first_name", "user__last_name", "phone")
