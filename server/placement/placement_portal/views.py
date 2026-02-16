from rest_framework.views import APIView
from rest_framework.response import Response

class PlacementDashboardView(APIView):
    def get(self, request):
        data = {
            "message": "Welcome to the Placement Officer Dashboard",
            "stats": [
                {"label": "Active Drives", "value": "5"},
                {"label": "Total Companies", "value": "50"},
                {"label": "Students Registered", "value": "500"},
            ]
        }
        return Response(data)
