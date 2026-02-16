from django.urls import path
from .views import PlacementDashboardView

urlpatterns = [
    path('dashboard/', PlacementDashboardView.as_view(), name='placement-dashboard'),
]
