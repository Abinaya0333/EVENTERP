from rest_framework import serializers

from .models import Budget, Expense


class BudgetSerializer(serializers.ModelSerializer):
    event_title = serializers.CharField(source="event.title", read_only=True)

    class Meta:
        model = Budget
        fields = ("id", "event", "event_title", "total_amount", "approved_amount", "status")


class ExpenseSerializer(serializers.ModelSerializer):
    spent_by_name = serializers.CharField(source="spent_by.get_full_name", read_only=True)

    class Meta:
        model = Expense
        fields = ("id", "budget", "title", "amount", "category", "spent_by", "spent_by_name", "date")
        read_only_fields = ("spent_by",)
