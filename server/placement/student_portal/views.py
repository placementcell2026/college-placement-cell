from rest_framework import status
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from accounts.models import Student, Job, JobApplication, Notification
from accounts.serializers import JobSerializer, JobApplicationSerializer, NotificationSerializer

class StudentDashboardView(APIView):
    # permission_classes = [IsAuthenticated]

    def get(self, request):
        # For now, let's try to get student from request.user or a phone query param
        phone = request.query_params.get('phone')
        try:
            if phone:
                student = Student.objects.get(user__phone=phone)
            else:
                # Fallback to first student for demo if no session/param
                student = Student.objects.first()
        except Student.DoesNotExist:
            return Response({"error": "Student not found"}, status=status.HTTP_404_NOT_FOUND)

        if not student:
             return Response({"error": "No student profile exists"}, status=status.HTTP_404_NOT_FOUND)

        # 1. Eligibility Filtering for Jobs
        eligible_jobs = Job.objects.filter(
            min_cgpa__lte=student.overall_cgpa,
            max_backlogs__gte=student.total_backlogs,
            allowed_departments__icontains=student.department
        ).order_by('-posted_on')[:5]

        # 2. Stats Calculation
        stats = [
            {"label": "Jobs Applied", "value": str(student.applications.count()), "trend": "Total Applications"},
            {"label": "Overall CGPA", "value": f"{student.overall_cgpa:.2f}", "trend": f"Sem {student.semester}"},
            {"label": "Backlogs", "value": str(student.total_backlogs), "trend": "Active Backlogs"},
            {"label": "Profile Strength", "value": f"{student.profile_completion}%", "trend": "Update Skills"},
        ]

        # 3. Formatted Dashboard Data
        data = {
            "student_info": {
                "name": student.user.full_name,
                "cgpa": student.overall_cgpa,
                "department": student.department,
                "image": student.image.url if student.image else None
            },
            "stats": stats,
            "recommended_jobs": JobSerializer(eligible_jobs, many=True).data,
            "upcoming_drives": [
                 # This would ideally come from a special 'Event' or 'Drive' model
                 # For now, return a placeholder or list from Job model with deadlines
                {"id": j.id, "company": j.company, "role": j.role, "month": j.deadline.strftime('%b').upper(), "day": j.deadline.strftime('%d'), "time": j.deadline.strftime('%H:%M %p')}
                for j in eligible_jobs[:3]
            ]
        }
        return Response(data)

class JobApplicationView(APIView):
    # permission_classes = [IsAuthenticated]

    def post(self, request):
        phone = request.data.get('phone')
        job_id = request.data.get('job_id')
        
        try:
            student = Student.objects.get(user__phone=phone)
            job = Job.objects.get(id=job_id)
            
            # Check eligibility again for safety
            if student.overall_cgpa < job.min_cgpa or student.total_backlogs > job.max_backlogs:
                return Response({"error": "You are not eligible for this job"}, status=status.HTTP_400_BAD_REQUEST)

            application, created = JobApplication.objects.get_or_create(student=student, job=job)
            
            if not created:
                return Response({"message": "You have already applied for this job"}, status=status.HTTP_400_BAD_REQUEST)
            
            # Create notification
            Notification.objects.create(
                user=student.user,
                title="Application Successful",
                message=f"You have successfully applied for the {job.role} position at {job.company}."
            )
            
            return Response({"message": "Application submitted successfully"}, status=status.HTTP_201_CREATED)
            
        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)

class NotificationListView(APIView):
    # permission_classes = [IsAuthenticated]

    def get(self, request):
        phone = request.query_params.get('phone')
        notifications = Notification.objects.filter(user__phone=phone)
        serializer = NotificationSerializer(notifications, many=True)
        return Response(serializer.data)

class StudentProfileView(APIView):
    # permission_classes = [IsAuthenticated]

    def get(self, request):
        phone = request.query_params.get('phone')
        try:
            student = Student.objects.get(user__phone=phone)
            # We want to return both User and Student fields
            data = {
                "full_name": student.user.full_name,
                "email": student.user.email,
                "phone": student.user.phone,
                "dob": student.dob,
                "gender": student.gender,
                "college": student.college,
                "department": student.department,
                "course": student.course,
                "semester": student.semester,
                "roll_no": student.roll_no,
                "skills": student.skills,
                "overall_cgpa": student.overall_cgpa,
                "total_backlogs": student.total_backlogs,
                "profile_completion": student.profile_completion,
                "image": student.image.url if student.image else None,
                "resume": student.resume.url if student.resume else None,
            }
            return Response(data)
        except Student.DoesNotExist:
            return Response({"error": "Student not found"}, status=status.HTTP_404_NOT_FOUND)

    def patch(self, request):
        phone = request.data.get('phone')
        try:
            student = Student.objects.get(user__phone=phone)
            
            # Simple manual mapping for profile update
            # In a more complex app, we'd use a dedicated UpdateSerializer
            fields = ['dob', 'gender', 'college', 'department', 'course', 'semester', 'roll_no', 'skills']
            for field in fields:
                if field in request.data:
                    setattr(student, field, request.data.get(field))
            
            if 'image' in request.FILES:
                student.image = request.FILES['image']
            if 'resume' in request.FILES:
                student.resume = request.FILES['resume']
                
            student.save()
            return Response({"message": "Profile updated successfully"})
        except Student.DoesNotExist:
            return Response({"error": "Student not found"}, status=status.HTTP_404_NOT_FOUND)
        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)
