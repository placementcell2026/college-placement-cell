from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    PlacementDashboardView, JobViewSet, PlacementOfficerProfileView,
    RegisteredStudentsView, TotalApplicationsView, ExportStudentsPDFView, ExportApplicationsPDFView,
    RegisteredTeachersView, ExportTeachersPDFView, DepartmentListView, InterviewViewSet,
    DrivePosterViewSet, PlacementAnalysisView
)

router = DefaultRouter()
router.register(r'jobs', JobViewSet, basename='job')
router.register(r'interviews', InterviewViewSet, basename='interview')
router.register(r'posters', DrivePosterViewSet, basename='poster')


urlpatterns = [
    path('dashboard/', PlacementDashboardView.as_view(), name='placement-dashboard'),
    path('profile/', PlacementOfficerProfileView.as_view(), name='placement-profile'),
    path('', include(router.urls)),
    path('students/', RegisteredStudentsView.as_view(), name='registered-students'),
    path('teachers/', RegisteredTeachersView.as_view(), name='registered-teachers'),
    path('departments/', DepartmentListView.as_view(), name='department-list'),
    path('applications/', TotalApplicationsView.as_view(), name='total-applications'),
    path('students/export/', ExportStudentsPDFView.as_view(), name='export-students-pdf'),
    path('teachers/export/', ExportTeachersPDFView.as_view(), name='export-teachers-pdf'),
    path('applications/export/', ExportApplicationsPDFView.as_view(), name='export-applications-pdf'),
    path('analysis/', PlacementAnalysisView.as_view(), name='placement-analysis'),
]
