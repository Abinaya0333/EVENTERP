from rest_framework import viewsets
from rest_framework.decorators import action
from rest_framework.response import Response

from common.permissions import IsAdminOrConvener, Roles, user_role
from .models import EventReport, Notification
from .serializers import EventReportSerializer, NotificationSerializer


class NotificationViewSet(viewsets.ModelViewSet):
    serializer_class = NotificationSerializer

    def get_queryset(self):
        qs = Notification.objects.select_related("user", "event").all()
        if user_role(self.request.user) != Roles.ADMIN:
            qs = qs.filter(user=self.request.user)
        return qs

    @action(detail=True, methods=["post"])
    def mark_read(self, request, pk=None):
        notification = self.get_object()
        notification.is_read = True
        notification.save(update_fields=["is_read"])
        return Response(self.get_serializer(notification).data)


class EventReportViewSet(viewsets.ModelViewSet):
    serializer_class = EventReportSerializer
    permission_classes = [IsAdminOrConvener]

    def get_queryset(self):
        qs = EventReport.objects.select_related("event").all()
        if user_role(self.request.user) == Roles.CONVENER:
            qs = qs.filter(event__created_by=self.request.user)
        return qs
