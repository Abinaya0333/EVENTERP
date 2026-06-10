from django.contrib import admin
from django.urls import include, path
from rest_framework.routers import DefaultRouter
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework_simplejwt.views import TokenRefreshView, TokenVerifyView

from accounts.views import ProfileViewSet
from common.views import PermissionRuleViewSet
from committees.views import CommitteeMemberViewSet, CommitteeViewSet, TaskViewSet
from departments.views import DepartmentViewSet
from events.views import ApprovalRequestViewSet, AttendanceViewSet, CertificateViewSet, EventViewSet, FeedbackViewSet, RegistrationViewSet
from finance.views import BudgetViewSet, ExpenseViewSet
from notifications.views import EventReportViewSet, NotificationViewSet
from users.views import (
    CustomTokenObtainPairView,
    LogoutView,
    PasswordResetConfirmView,
    PasswordResetRequestView,
    RegisterView,
    UserViewSet,
)


router = DefaultRouter()
router.include_root_view = False
router.register("users", UserViewSet, basename="user")
router.register("permission-rules", PermissionRuleViewSet, basename="permission-rule")
router.register("profiles", ProfileViewSet, basename="profile")
router.register("departments", DepartmentViewSet, basename="department")
router.register("events", EventViewSet, basename="event")
router.register("approval-requests", ApprovalRequestViewSet, basename="approval-request")
router.register("registrations", RegistrationViewSet, basename="registration")
router.register("attendance", AttendanceViewSet, basename="attendance")
router.register("feedback", FeedbackViewSet, basename="feedback")
router.register("certificates", CertificateViewSet, basename="certificate")
router.register("committees", CommitteeViewSet, basename="committee")
router.register("committee-members", CommitteeMemberViewSet, basename="committee-member")
router.register("tasks", TaskViewSet, basename="task")
router.register("budgets", BudgetViewSet, basename="budget")
router.register("expenses", ExpenseViewSet, basename="expense")
router.register("notifications", NotificationViewSet, basename="notification")
router.register("event-reports", EventReportViewSet, basename="event-report")


@api_view(["GET"])
@permission_classes([AllowAny])
def api_root(request):
    return Response(
        {
            "status": "ok",
            "message": "Event management API",
            "auth": {
                "token": "/api/token/",
                "refresh": "/api/token/refresh/",
                "verify": "/api/token/verify/",
                "register": "/api/register/",
                "logout": "/api/logout/",
                "password_reset_request": "/api/password-reset/request/",
                "password_reset_confirm": "/api/password-reset/confirm/",
                "me": "/api/users/me/",
            },
            "resources": [
                "/api/users/",
                "/api/profiles/",
                "/api/departments/",
                "/api/events/",
                "/api/registrations/",
                "/api/attendance/",
                "/api/feedback/",
                "/api/certificates/",
                "/api/committees/",
                "/api/committee-members/",
                "/api/tasks/",
                "/api/budgets/",
                "/api/expenses/",
                "/api/notifications/",
                "/api/event-reports/",
            ],
        }
    )

urlpatterns = [
    path("admin/", admin.site.urls),
    path("api/", api_root, name="api-root"),
    path("api/token/", CustomTokenObtainPairView.as_view(), name="token_obtain_pair"),
    path("api/token/refresh/", TokenRefreshView.as_view(), name="token_refresh"),
    path("api/token/verify/", TokenVerifyView.as_view(), name="token_verify"),
    path("api/register/", RegisterView.as_view(), name="register"),
    path("api/logout/", LogoutView.as_view(), name="logout"),
    path("api/password-reset/request/", PasswordResetRequestView.as_view(), name="password_reset_request"),
    path("api/password-reset/confirm/", PasswordResetConfirmView.as_view(), name="password_reset_confirm"),
    path("api/", include(router.urls)),
]
