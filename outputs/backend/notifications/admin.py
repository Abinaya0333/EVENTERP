from django.contrib import admin

from .models import EventReport, Notification


admin.site.register(Notification)
admin.site.register(EventReport)
