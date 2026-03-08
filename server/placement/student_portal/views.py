from rest_framework import status
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.utils import timezone
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

        # 1. Eligibility Filtering for Jobs (By Branch/Department)
        if student.is_blacklisted:
            eligible_jobs = Job.objects.none()
        else:
            branch = student.department if student.department else ""
            eligible_jobs = Job.objects.filter(
                allowed_departments__icontains=branch
            ).order_by('-posted_on')[:10]
            
            # If no branch specific jobs, show latest jobs
            if not eligible_jobs.exists():
                eligible_jobs = Job.objects.all().order_by('-posted_on')[:10]

        # 2. Stats Calculation
        stats = [
            {"label": "Jobs Applied", "value": str(student.applications.count()), "trend": "Total Applications"},
            {"label": "Overall CGPA", "value": f"{student.overall_cgpa:.2f}", "trend": f"Sem {student.semester}"},
            {"label": "ATS Score", "value": f"{student.ats_score}%", "trend": "Resume Match"},
            {"label": "Profile Strength", "value": f"{student.profile_completion}%", "trend": "Update Skills"},
        ]

        # 4. Collection of all drive dates for the calendar
        all_drives = Job.objects.filter(deadline__gte=timezone.now()).order_by('deadline')
        drive_dates = [
            {
                "id": drive.id,
                "date": drive.deadline.strftime('%Y-%m-%d'),
                "company": drive.company,
                "role": drive.role
            } for drive in all_drives
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
                {"id": j.id, "company": j.company, "role": j.role, "month": j.deadline.strftime('%b').upper(), "day": j.deadline.strftime('%d'), "time": j.deadline.strftime('%H:%M %p')}
                for j in eligible_jobs[:3]
            ],
            "all_drive_dates": drive_dates
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
            if student.is_blacklisted:
                return Response({"error": "You have been blacklisted and cannot apply for jobs."}, status=status.HTTP_403_FORBIDDEN)
                
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
                "ats_score": student.ats_score,
            }

            # Fetch jobs allowed for student's branch (relaxed filter for profile view)
            branch = student.department if student.department else ""
            eligible_jobs = Job.objects.filter(
                allowed_departments__icontains=branch
            ).order_by('-posted_on')[:10]
            
            # If no branch matches, just show latest jobs so section is never empty
            if not eligible_jobs.exists():
                eligible_jobs = Job.objects.all().order_by('-posted_on')[:10]
            
            job_serializer = JobSerializer(eligible_jobs, many=True)
            data["eligible_jobs"] = job_serializer.data

            return Response(data)
        except Student.DoesNotExist:
            return Response({"error": "Student not found"}, status=status.HTTP_404_NOT_FOUND)

    def patch(self, request):
        phone = request.data.get('phone', '').strip()
        try:
            if phone:
                student = Student.objects.get(user__phone=phone)
            elif request.user.is_authenticated:
                student = Student.objects.get(user=request.user)
            else:
                return Response({"error": "Phone number required"}, status=status.HTTP_400_BAD_REQUEST)
            
            # Simple manual mapping for profile update
            # In a more complex app, we'd use a dedicated UpdateSerializer
            # Robust mapping to handle empty strings for numeric and date fields
            fields = ['dob', 'gender', 'college', 'department', 'course', 'semester', 'roll_no', 'skills', 'overall_cgpa', 'total_backlogs']
            for field in fields:
                if field in request.data:
                    val = request.data.get(field)
                    
                    # Handle empty strings for specific field types
                    if val == '':
                        if field in ['overall_cgpa', 'total_backlogs']:
                            val = 0
                        elif field == 'dob':
                            continue # Skip empty DOB to avoid validation error
                    
                    setattr(student, field, val)
            
            if 'image' in request.FILES:
                student.image = request.FILES['image']
            if 'resume' in request.FILES:
                resume_file = request.FILES['resume']
                student.resume = resume_file
                # Auto-calculate ATS score on upload
                try:
                    from accounts.ats_utils import extract_resume_text, calculate_ats_score
                    # Use the file object from request.FILES which is seekable/readable
                    resume_text = extract_resume_text(resume_file)
                    if resume_text:
                        print(f"ATS Debug: Extracted {len(resume_text)} chars from {resume_file.name}")
                        print(f"ATS Debug: Text preview: {resume_text[:100]}...")
                        # Map department to branch code for ATS
                        branch = student.department if student.department else "CT"
                        student.ats_score = calculate_ats_score(resume_text, branch=branch)
                        print(f"ATS Success ({branch}): {student.ats_score}% for {student.user.full_name}")
                    else:
                        print(f"ATS Error: Extraction returned EMPTY text for {resume_file.name}")
                        student.ats_score = 0
                except Exception as e:
                    import traceback
                    print(f"ATS Exception: {e}")
                    traceback.print_exc()
                    student.ats_score = 0
                
            student.save()
            return Response({
                "message": "Profile updated successfully",
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
                "ats_score": student.ats_score,
                "resume": student.resume.url if student.resume else None,
                "image": student.image.url if student.image else None
            })
        except Student.DoesNotExist:
            return Response({"error": "Student not found"}, status=status.HTTP_404_NOT_FOUND)
        except Exception as e:
            import traceback
            traceback.print_exc()
            return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)
