from django.urls import path
from .views import StudentDashboardView, JobApplicationView, NotificationListView, StudentProfileView

urlpatterns = [
    path('dashboard/', StudentDashboardView.as_view(), name='student-dashboard'),
    path('apply/', JobApplicationView.as_view(), name='job-apply'),
    path('notifications/', NotificationListView.as_view(), name='notifications'),
    path('profile/', StudentProfileView.as_view(), name='student-profile'),
]
