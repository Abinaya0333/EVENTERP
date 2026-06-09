from django.contrib import admin

from .models import Committee, CommitteeMember, Task


admin.site.register(Committee)
admin.site.register(CommitteeMember)
admin.site.register(Task)
