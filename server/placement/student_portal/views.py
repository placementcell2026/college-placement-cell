from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated

class StudentDashboardView(APIView):
    # permission_classes = [IsAuthenticated] # Uncomment when auth is ready

    def get(self, request):
        data = {
            "stats": [
                {"label": "Jobs Applied", "value": "12", "trend": "+2 this week"},
                {"label": "Companies Visiting", "value": "5", "trend": "Next: Google"},
                {"label": "Interviews Shortlisted", "value": "3", "trend": "Check Schedule"},
                {"label": "Profile Strength", "value": "85%", "trend": "Update Skills"},
            ],
            "recommended_jobs": [
                {"id": 1, "role": "Software Engineer Intern", "company": "Microsoft", "location": "Bangalore", "type": "Full Time", "salary": "12 LPA", "logo": "M"},
                {"id": 2, "role": "Frontend Developer", "company": "Adobe", "location": "Noida", "type": "Full Time", "salary": "10 LPA", "logo": "A"},
                {"id": 3, "role": "Data Analyst", "company": "Dons", "location": "Remote", "type": "Internship", "salary": "25k/mo", "logo": "D"},
            ],
            "upcoming_drives": [
                {"id": 1, "company": "Google", "role": "SDE - I", "month": "FEB", "day": "10", "time": "10:00 AM"},
                {"id": 2, "company": "Amazon", "role": "Cloud Support", "month": "FEB", "day": "15", "time": "09:30 AM"},
                {"id": 3, "company": "TCS", "role": "Ninja / Digital", "month": "FEB", "day": "20", "time": "11:00 AM"},
            ]
        }
        return Response(data)
