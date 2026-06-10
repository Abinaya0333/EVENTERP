from django.contrib.auth import get_user_model
from django.db.models import Count
from django.utils import timezone
from rest_framework import viewsets
from rest_framework.decorators import action
from rest_framework.response import Response

from rest_framework.permissions import SAFE_METHODS, BasePermission, IsAuthenticated

from common.permissions import IsAdminConvenerOrCommittee, IsAdminOrConvener, Roles, user_role
from .models import ApprovalRequest, Attendance, Certificate, Event, Feedback, Registration
from .serializers import ApprovalRequestSerializer, AttendanceSerializer, CertificateSerializer, EventSerializer, FeedbackSerializer, RegistrationSerializer


User = get_user_model()


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
        event = serializer.save(created_by=self.request.user)
        if event.status == Event.Status.PENDING:
            ApprovalRequest.objects.get_or_create(event=event, level=1, decision=ApprovalRequest.Decision.PENDING)

    def perform_update(self, serializer):
        previous_status = self.get_object().status
        event = serializer.save()
        if event.status == Event.Status.PENDING and previous_status != Event.Status.PENDING:
            event.approval_level = 1
            event.save(update_fields=["approval_level"])
            ApprovalRequest.objects.get_or_create(event=event, level=1, decision=ApprovalRequest.Decision.PENDING)

    @action(detail=True, methods=["post"], permission_classes=[CanReadEventsWriteAsStaff])
    def approve(self, request, pk=None):
        event = self.get_object()
        event.status = Event.Status.PENDING
        event.approval_level = 1
        event.save(update_fields=["status", "approval_level"])
        ApprovalRequest.objects.get_or_create(event=event, level=1, decision=ApprovalRequest.Decision.PENDING)
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

        event_id = self.request.query_params.get("event")
        if event_id:
            qs = qs.filter(event_id=event_id)

        return qs

    def perform_create(self, serializer):
        target_user = self.request.user
        requester_role = user_role(self.request.user)
        requested_user_id = self.request.data.get("user") or self.request.data.get("user_id")

        if requested_user_id and requester_role in {Roles.ADMIN, Roles.CONVENER, Roles.COMMITTEE_MEMBER}:
            target_user = User.objects.filter(pk=requested_user_id).first() or self.request.user

        serializer.save(user=target_user)


class ApprovalRequestViewSet(viewsets.ReadOnlyModelViewSet):
    serializer_class = ApprovalRequestSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        qs = ApprovalRequest.objects.select_related("event", "decided_by").all()
        role = user_role(self.request.user)
        if role == Roles.SANCTIONER:
            level = getattr(getattr(self.request.user, "profile", None), "approval_level", None)
            if self.action == "list":
                qs = qs.filter(level=level)
        elif role == Roles.CONVENER:
            qs = qs.filter(event__created_by=self.request.user)
        elif role != Roles.ADMIN:
            qs = qs.none()

        decision = self.request.query_params.get("decision")
        if decision:
            qs = qs.filter(decision=decision.upper())
        pending = self.request.query_params.get("pending")
        if pending == "1":
            qs = qs.filter(decision=ApprovalRequest.Decision.PENDING, event__status=Event.Status.PENDING, event__approval_level=models.F("level"))
        return qs

    @action(detail=True, methods=["post"])
    def approve(self, request, pk=None):
        approval = self.get_object()
        level = getattr(getattr(request.user, "profile", None), "approval_level", None)
        if user_role(request.user) != Roles.ADMIN and approval.level != level:
            return Response({"detail": "This approval is not assigned to your level."}, status=403)
        if approval.decision != ApprovalRequest.Decision.PENDING:
            return Response({"detail": "This request is already decided."}, status=400)

        event = approval.event
        approval.decision = ApprovalRequest.Decision.APPROVED
        approval.decided_by = request.user
        approval.comment = request.data.get("comment", "")
        approval.decided_at = timezone.now()
        approval.save()

        if approval.level >= 3:
            event.status = Event.Status.APPROVED
            event.save(update_fields=["status"])
        else:
            event.approval_level = approval.level + 1
            event.save(update_fields=["approval_level"])
            ApprovalRequest.objects.get_or_create(event=event, level=event.approval_level, decision=ApprovalRequest.Decision.PENDING)
        return Response(self.get_serializer(approval).data)

    @action(detail=True, methods=["post"])
    def reject(self, request, pk=None):
        approval = self.get_object()
        level = getattr(getattr(request.user, "profile", None), "approval_level", None)
        if user_role(request.user) != Roles.ADMIN and approval.level != level:
            return Response({"detail": "This approval is not assigned to your level."}, status=403)
        if approval.decision != ApprovalRequest.Decision.PENDING:
            return Response({"detail": "This request is already decided."}, status=400)

        approval.decision = ApprovalRequest.Decision.REJECTED
        approval.decided_by = request.user
        approval.comment = request.data.get("comment", "")
        approval.decided_at = timezone.now()
        approval.save()

        event = approval.event
        event.status = Event.Status.REJECTED
        event.approval_level = 1
        event.save(update_fields=["status", "approval_level"])
        return Response(self.get_serializer(approval).data)


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