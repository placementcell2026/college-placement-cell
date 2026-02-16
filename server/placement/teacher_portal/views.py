from rest_framework.views import APIView
from rest_framework.response import Response

class TeacherDashboardView(APIView):
    def get(self, request):
        data = {
            "message": "Welcome to the Teacher Dashboard",
            "stats": [
                {"label": "Total Students", "value": "120"},
                {"label": "Placed Students", "value": "45"},
                {"label": "Pending Approvals", "value": "12"},
            ]
        }
        return Response(data)
