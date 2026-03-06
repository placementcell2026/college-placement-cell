from django.urls import path
from .views import TeacherDashboardView, PendingRegistrationsView, ApproveRegistrationView, RejectRegistrationView, TeacherProfileView

urlpatterns = [
    path('dashboard/', TeacherDashboardView.as_view(), name='teacher-dashboard'),
    path('registrations/pending/', PendingRegistrationsView.as_view(), name='pending-registrations'),
    path('registrations/approve/', ApproveRegistrationView.as_view(), name='approve-registration'),
    path('registrations/reject/', RejectRegistrationView.as_view(), name='reject-registration'),
    path('profile/', TeacherProfileView.as_view(), name='teacher-profile'),
]
