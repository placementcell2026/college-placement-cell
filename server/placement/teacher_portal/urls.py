from django.urls import path
from .views import (
    TeacherDashboardView, PendingRegistrationsView, ApproveRegistrationView, 
    RejectRegistrationView, TeacherProfileView, TeacherStudentListView,
    TeacherInterviewView, SelectStudentsForInterviewView
)

urlpatterns = [
    path('dashboard/', TeacherDashboardView.as_view(), name='teacher-dashboard'),
    path('registrations/pending/', PendingRegistrationsView.as_view(), name='pending-registrations'),
    path('registrations/approve/', ApproveRegistrationView.as_view(), name='approve-registration'),
    path('registrations/reject/', RejectRegistrationView.as_view(), name='reject-registration'),
    path('profile/', TeacherProfileView.as_view(), name='teacher-profile'),
    path('students/', TeacherStudentListView.as_view(), name='teacher-student-list'),
    path('interviews/', TeacherInterviewView.as_view(), name='teacher-interviews'),
    path('interviews/select-students/', SelectStudentsForInterviewView.as_view(), name='select-students-for-interview'),
]
