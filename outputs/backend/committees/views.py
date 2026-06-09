from rest_framework import viewsets

from common.permissions import IsAdminOrConvener, Roles, user_role
from .models import Committee, CommitteeMember, Task
from .serializers import CommitteeMemberSerializer, CommitteeSerializer, TaskSerializer


class CommitteeViewSet(viewsets.ModelViewSet):
    serializer_class = CommitteeSerializer
    permission_classes = [IsAdminOrConvener]

    def get_queryset(self):
        qs = Committee.objects.select_related("event").all()
        if user_role(self.request.user) == Roles.CONVENER:
            qs = qs.filter(event__created_by=self.request.user)
        return qs


class CommitteeMemberViewSet(viewsets.ModelViewSet):
    serializer_class = CommitteeMemberSerializer
    permission_classes = [IsAdminOrConvener]

    def get_queryset(self):
        qs = CommitteeMember.objects.select_related("committee", "committee__event", "user").all()
        if user_role(self.request.user) == Roles.CONVENER:
            qs = qs.filter(committee__event__created_by=self.request.user)
        return qs


class TaskViewSet(viewsets.ModelViewSet):
    serializer_class = TaskSerializer

    def get_queryset(self):
        qs = Task.objects.select_related("committee", "committee__event", "assigned_to").all()
        role = user_role(self.request.user)
        if role == Roles.COMMITTEE_MEMBER:
            qs = qs.filter(assigned_to=self.request.user)
        elif role == Roles.CONVENER:
            qs = qs.filter(committee__event__created_by=self.request.user)
        return qs
