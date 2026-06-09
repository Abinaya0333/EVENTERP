from django.contrib import admin

from .models import Attendance, Certificate, Event, Feedback, Registration


@admin.register(Event)
class EventAdmin(admin.ModelAdmin):
    list_display = ("id", "title", "department", "status", "start_date", "end_date", "created_by")
    list_filter = ("status", "department")
    search_fields = ("title", "description", "location")


admin.site.register(Registration)
admin.site.register(Attendance)
admin.site.register(Feedback)
admin.site.register(Certificate)
