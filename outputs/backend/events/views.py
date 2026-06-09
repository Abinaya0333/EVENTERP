from django.db.models import Count
from rest_framework import viewsets
from rest_framework.decorators import action
from rest_framework.response import Response

from rest_framework.permissions import SAFE_METHODS, BasePermission, IsAuthenticated

from common.permissions import IsAdminConvenerOrCommittee, IsAdminOrConvener, Roles, user_role
from .models import Attendance, Certificate, Event, Feedback, Registration
from .serializers import AttendanceSerializer, CertificateSerializer, EventSerializer, FeedbackSerializer, RegistrationSerializer


class CanReadEventsWriteAsStaff(BasePermission):
    def has_permission(self, request, view):
        if request.method in SAFE_METHODS:
            return request.user and request.user.is_authenticated
        return user_role(request.user) in {Roles.ADMIN, Roles.CONVENER, Roles.SANCTIONER}


class EventViewSet(viewsets.ModelViewSet):
    serializer_class = EventSerializer
    permission_classes = [CanReadEventsWriteAsStaff]

    def get_queryset(self):
        qs = Event.objects.select_related("created_by", "department").annotate(registrations_count=Count("registrations"))
        role = user_role(self.request.user)
        if role == Roles.CONVENER:
            qs = qs.filter(created_by=self.request.user)
        elif role == Roles.PARTICIPANT:
            qs = qs.filter(status=Event.Status.APPROVED)
        status_value = self.request.query_params.get("status")
        if status_value:
            qs = qs.filter(status=status_value.upper())
        return qs

    def perform_create(self, serializer):
        serializer.save(created_by=self.request.user)

    @action(detail=True, methods=["post"], permission_classes=[CanReadEventsWriteAsStaff])
    def approve(self, request, pk=None):
        event = self.get_object()
        event.status = Event.Status.APPROVED
        event.save(update_fields=["status"])
        return Response(self.get_serializer(event).data)

    @action(detail=True, methods=["post"], permission_classes=[CanReadEventsWriteAsStaff])
    def complete(self, request, pk=None):
        event = self.get_object()
        event.status = Event.Status.COMPLETED
        event.save(update_fields=["status"])
        return Response(self.get_serializer(event).data)


class RegistrationViewSet(viewsets.ModelViewSet):
    serializer_class = RegistrationSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        qs = Registration.objects.select_related("event", "user").all()
        role = user_role(self.request.user)
        if role == Roles.PARTICIPANT:
            qs = qs.filter(user=self.request.user)
        elif role == Roles.CONVENER:
            qs = qs.filter(event__created_by=self.request.user)
        return qs

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)


class AttendanceViewSet(viewsets.ModelViewSet):
    queryset = Attendance.objects.select_related("event", "user").all()
    serializer_class = AttendanceSerializer
    permission_classes = [IsAdminConvenerOrCommittee]


class FeedbackViewSet(viewsets.ModelViewSet):
    serializer_class = FeedbackSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        qs = Feedback.objects.select_related("event", "user").all()
        if user_role(self.request.user) == Roles.PARTICIPANT:
            qs = qs.filter(user=self.request.user)
        return qs

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)


class CertificateViewSet(viewsets.ModelViewSet):
    serializer_class = CertificateSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        qs = Certificate.objects.select_related("event", "user").all()
        if user_role(self.request.user) == Roles.PARTICIPANT:
            qs = qs.filter(user=self.request.user)
        return qs
