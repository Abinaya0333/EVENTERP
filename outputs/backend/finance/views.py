from rest_framework import viewsets

from rest_framework.permissions import SAFE_METHODS, BasePermission

from common.permissions import Roles, user_role
from .models import Budget, Expense
from .serializers import BudgetSerializer, ExpenseSerializer


class CanManageFinance(BasePermission):
    def has_permission(self, request, view):
        role = user_role(request.user)
        if request.method in SAFE_METHODS:
            return role in {Roles.ADMIN, Roles.CONVENER, Roles.SANCTIONER}
        return role in {Roles.ADMIN, Roles.CONVENER, Roles.SANCTIONER}


class BudgetViewSet(viewsets.ModelViewSet):
    serializer_class = BudgetSerializer
    permission_classes = [CanManageFinance]

    def get_queryset(self):
        qs = Budget.objects.select_related("event").all()
        if user_role(self.request.user) == Roles.CONVENER:
            qs = qs.filter(event__created_by=self.request.user)
        return qs


class ExpenseViewSet(viewsets.ModelViewSet):
    serializer_class = ExpenseSerializer
    permission_classes = [CanManageFinance]

    def get_queryset(self):
        qs = Expense.objects.select_related("budget", "budget__event", "spent_by").all()
        if user_role(self.request.user) == Roles.CONVENER:
            qs = qs.filter(budget__event__created_by=self.request.user)
        return qs

    def perform_create(self, serializer):
        serializer.save(spent_by=self.request.user)
