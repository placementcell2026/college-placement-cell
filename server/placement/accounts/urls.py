from django.urls import path
from .views import RegisterView, LoginView, NotificationListView, CaptchaView, StudentActionView

urlpatterns = [
    path('register/', RegisterView.as_view(), name='register'),
    path('login/', LoginView.as_view(), name='login'),
    path('notifications/', NotificationListView.as_view(), name='notifications'),
    path('captcha/', CaptchaView.as_view(), name='captcha'),
    path('student-action/', StudentActionView.as_view(), name='student-action'),
]