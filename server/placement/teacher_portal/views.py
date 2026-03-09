from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status, permissions
from accounts.models import Student, User, Teacher, RegistrationRequest, Notification, PlacementOfficer, Interview
from accounts.serializers import InterviewSerializer, StudentSimpleSerializer
from django.db.models import Count

class TeacherDashboardView(APIView):
    def get(self, request):
        phone = request.query_params.get('phone')
        if not phone:
            return Response({"error": "Teacher phone required"}, status=status.HTTP_400_BAD_REQUEST)
        
        try:
            teacher = Teacher.objects.get(user__phone=phone)
            dept = teacher.department
            
            total_students = Student.objects.filter(department__iexact=dept, user__is_active=True).count()
            pending_approvals = RegistrationRequest.objects.filter(department__iexact=dept, status='Pending').count()
            # Placeholder for placed students until that logic is implemented
            placed_students = Student.objects.filter(department__iexact=dept, applications__status='Selected').distinct().count()
            incomplete_profiles = Student.objects.filter(department__iexact=dept, user__is_active=True, profile_completion__lt=100).count()

            data = {
                "message": f"Welcome to the {dept} Teacher Dashboard",
                "stats": [
                    {"label": "Total Students", "value": str(total_students)},
                    {"label": "Placed Students", "value": str(placed_students)},
                    {"label": "Pending Approvals", "value": str(pending_approvals)},
                ],
                "incomplete_profiles": incomplete_profiles
            }
            return Response(data)
        except Teacher.DoesNotExist:
            return Response({"error": "Teacher profile not found"}, status=status.HTTP_404_NOT_FOUND)


class PendingRegistrationsView(APIView):
    def get(self, request):
        phone = request.query_params.get('phone')
        if not phone:
            return Response({"error": "Teacher phone required"}, status=status.HTTP_400_BAD_REQUEST)
            
        try:
            teacher = Teacher.objects.get(user__phone=phone)
            pending_requests = RegistrationRequest.objects.filter(
                department__iexact=teacher.department, 
                status='Pending'
            ).order_by('-created_at')
            
            data = [{
                "id": r.id,
                "full_name": r.full_name,
                "email": r.email,
                "phone": r.phone,
                "roll_no": r.roll_no,
                "department": r.department,
                "semester": r.semester,
                "course": r.course,
                "college": r.college,
                "dob": r.dob,
                "gender": r.gender,
                "image": r.image.url if r.image else None,
                "created_at": r.created_at
            } for r in pending_requests]
            
            return Response(data)
        except Teacher.DoesNotExist:
            return Response({"error": "Teacher profile not found"}, status=status.HTTP_404_NOT_FOUND)

class ApproveRegistrationView(APIView):
    def post(self, request):
        request_id = request.data.get('student_id') # Keeping student_id for frontend compatibility
        if not request_id:
            return Response({"error": "Request ID required"}, status=status.HTTP_400_BAD_REQUEST)
            
        try:
            reg_request = RegistrationRequest.objects.get(id=request_id, status='Pending')
            
            # Check if user already exists
            user_exists = User.objects.filter(phone=reg_request.phone).first() or \
                          User.objects.filter(email=reg_request.email).first()
            
            if user_exists:
                # If they already exist, we should probably just mark this request as processed
                reg_request.status = 'Approved'
                reg_request.save()
                
                # Clean up notifications
                Notification.objects.filter(extra_data__request_id=request_id, extra_data__type="registration_request").delete()
                
                return Response({
                    "message": f"Student {reg_request.full_name} is already registered. This request has been marked as processed.",
                    "already_exists": True
                })

            # Create User
            user = User.objects.create(
                phone=reg_request.phone,
                email=reg_request.email,
                full_name=reg_request.full_name,
                role='student',
                password=reg_request.password, # Already hashed
                is_active=True
            )
            
            # Create Student Profile
            Student.objects.create(
                user=user,
                dob=reg_request.dob,
                gender=reg_request.gender,
                college=reg_request.college,
                department=reg_request.department,
                course=reg_request.course,
                semester=reg_request.semester,
                roll_no=reg_request.roll_no,
                image=reg_request.image
            )
            
            # Mark request as approved
            reg_request.status = 'Approved'
            reg_request.save()
            
            # Remove this registration request notification from all teachers' lists
            Notification.objects.filter(extra_data__request_id=request_id, extra_data__type="registration_request").delete()

            # Notification for student (Success)
            Notification.objects.create(
                user=user,
                title="Account Approved",
                message="Your registration request has been approved. You can now login."
            )

            return Response({"message": f"Student {user.full_name} approved and account created successfully"})
        except RegistrationRequest.DoesNotExist:
            return Response({"error": "Registration request not found or already processed"}, status=status.HTTP_404_NOT_FOUND)
        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

class RejectRegistrationView(APIView):
    def post(self, request):
        request_id = request.data.get('student_id')
        if not request_id:
            return Response({"error": "Request ID required"}, status=status.HTTP_400_BAD_REQUEST)
            
        try:
            reg_request = RegistrationRequest.objects.get(id=request_id, status='Pending')
            
            # Mark request as rejected
            reg_request.status = 'Rejected'
            reg_request.save()
            
            # Remove notifications
            Notification.objects.filter(extra_data__request_id=request_id, extra_data__type="registration_request").delete()
            
            return Response({"message": "Registration request rejected successfully"})
        except RegistrationRequest.DoesNotExist:
            return Response({"error": "Registration request not found or already processed"}, status=status.HTTP_404_NOT_FOUND)

class TeacherProfileView(APIView):
    def get(self, request):
        phone = request.query_params.get('phone')
        try:
            teacher = Teacher.objects.get(user__phone=phone)
            data = {
                "full_name": teacher.user.full_name,
                "email": teacher.user.email,
                "phone": teacher.user.phone,
                "designation": teacher.designation,
                "qualification": teacher.qualification,
                "department": teacher.department,
                "experience": teacher.experience,
                "position": teacher.position,
                "image": teacher.image.url if teacher.image else None,
            }
            return Response(data)
        except Teacher.DoesNotExist:
            return Response({"error": "Teacher not found"}, status=status.HTTP_404_NOT_FOUND)

    def patch(self, request):
        phone = request.data.get('phone', '').strip()
        try:
            if phone:
                teacher = Teacher.objects.get(user__phone=phone)
            elif request.user.is_authenticated:
                teacher = Teacher.objects.get(user=request.user)
            else:
                return Response({"error": "Phone number required"}, status=status.HTTP_400_BAD_REQUEST)
            fields = ['designation', 'qualification', 'department', 'experience', 'position']
            for field in fields:
                if field in request.data:
                    setattr(teacher, field, request.data.get(field))
            
            if 'image' in request.FILES:
                teacher.image = request.FILES['image']
                
            teacher.save()
            return Response({
                "message": "Profile updated successfully",
                "full_name": teacher.user.full_name,
                "email": teacher.user.email,
                "phone": teacher.user.phone,
                "designation": teacher.designation,
                "qualification": teacher.qualification,
                "department": teacher.department,
                "experience": teacher.experience,
                "position": teacher.position,
                "image": teacher.image.url if teacher.image else None,
            })
        except Teacher.DoesNotExist:
            return Response({"error": "Teacher not found"}, status=status.HTTP_404_NOT_FOUND)
        except Exception as e:
            import traceback
            traceback.print_exc()
            return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)
class TeacherStudentListView(APIView):
    def get(self, request):
        phone = request.query_params.get('phone')
        if not phone:
            return Response({"error": "Teacher phone required"}, status=status.HTTP_400_BAD_REQUEST)
            
        try:
            teacher = Teacher.objects.get(user__phone=phone)
            students = Student.objects.filter(department__iexact=teacher.department, user__is_active=True).order_by('roll_no')
            
            data = [{
                "id": s.id,
                "full_name": s.user.full_name,
                "email": s.user.email,
                "phone": s.user.phone,
                "roll_no": s.roll_no,
                "department": s.department,
                "course": s.course,
                "semester": s.semester,
                "college": s.college,
                "gender": s.gender,
                "dob": s.dob,
                "cgpa": float(s.overall_cgpa),
                "backlogs": s.total_backlogs,
                "image": s.image.url if s.image else None,
                "is_blacklisted": s.is_blacklisted,
            } for s in students]
            
            return Response(data)
        except Teacher.DoesNotExist:
            return Response({"error": "Teacher profile not found"}, status=status.HTTP_404_NOT_FOUND)

class TeacherInterviewView(APIView):
    def get(self, request):
        phone = request.query_params.get('phone')
        try:
            teacher = Teacher.objects.get(user__phone=phone)
            # Find interviews that match the teacher's department exactly or partially
            interviews = Interview.objects.filter(department__icontains=teacher.department).order_by('-date_time')
            serializer = InterviewSerializer(interviews, many=True)
            return Response(serializer.data)
        except Teacher.DoesNotExist:
            return Response({"error": "Teacher profile not found"}, status=status.HTTP_404_NOT_FOUND)

class SelectStudentsForInterviewView(APIView):
    def post(self, request):
        interview_id = request.data.get('interview_id')
        student_ids = request.data.get('student_ids', []) # List of student IDs
        
        try:
            interview = Interview.objects.get(id=interview_id)
            students = Student.objects.filter(id__in=student_ids)
            
            # Update selected students
            interview.selected_students.set(students)
            interview.save()
            
            # Notify students
            for student in students:
                Notification.objects.get_or_create(
                    user=student.user,
                    title="Interview Invitation",
                    message=f"You have been selected for the {interview.company} interview on {interview.date_time.strftime('%H:%M %p, %d %b %Y')}.",
                    extra_data={"interview_id": interview.id, "type": "interview_invitation", "link": interview.meeting_link}
                )
            
            return Response({"message": f"Successfully selected {len(students)} students and notified them."})
        except Interview.DoesNotExist:
            return Response({"error": "Interview not found"}, status=status.HTTP_404_NOT_FOUND)
        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)

class TeacherAnnouncementView(APIView):
    def post(self, request):
        phone = request.data.get('phone')
        title = request.data.get('title')
        message = request.data.get('message')
        
        if not phone or not title or not message:
            return Response({"error": "Phone, title, and message are required"}, status=status.HTTP_400_BAD_REQUEST)
            
        try:
            teacher = Teacher.objects.get(user__phone=phone)
            students = Student.objects.filter(department__iexact=teacher.department, user__is_active=True)
            
            # Create notifications for all students in the department
            notifications = []
            for student in students:
                notifications.append(
                    Notification(
                        user=student.user,
                        title=f"Announcement: {title}",
                        message=message,
                        extra_data={"type": "announcement", "teacher": teacher.user.full_name, "department": teacher.department}
                    )
                )
            
            if notifications:
                Notification.objects.bulk_create(notifications)
                
            return Response({"message": f"Announcement sent successfully to {len(students)} students in the {teacher.department} department."})
        except Teacher.DoesNotExist:
            return Response({"error": "Teacher profile not found"}, status=status.HTTP_404_NOT_FOUND)
        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

class AlertIncompleteProfilesView(APIView):
    def post(self, request):
        phone = request.data.get('phone')
        
        if not phone:
            return Response({"error": "Phone is required"}, status=status.HTTP_400_BAD_REQUEST)
            
        try:
            teacher = Teacher.objects.get(user__phone=phone)
            incomplete_students = Student.objects.filter(
                department__iexact=teacher.department, 
                user__is_active=True, 
                profile_completion__lt=100
            )
            
            if not incomplete_students.exists():
                return Response({"message": "No students found with incomplete profiles."})
                
            notifications = []
            for student in incomplete_students:
                missing = []
                if not student.resume:
                    missing.append("Resume")
                if student.overall_cgpa == 0:
                    missing.append("CGPA/Marks")
                if not student.skills:
                    missing.append("Skills")
                if not student.image:
                    missing.append("Profile Photo")
                
                details = ", ".join(missing) if missing else "some required fields"
                
                notifications.append(
                    Notification(
                        user=student.user,
                        title="Action Required: Incomplete Profile",
                        message=f"Please complete your profile to be eligible for placements. You are missing: {details}.",
                        extra_data={"type": "profile_alert", "teacher": teacher.user.full_name}
                    )
                )
            
            if notifications:
                Notification.objects.bulk_create(notifications)
                
            return Response({"message": f"Alert sent successfully to {len(notifications)} students."})
            
        except Teacher.DoesNotExist:
            return Response({"error": "Teacher profile not found"}, status=status.HTTP_404_NOT_FOUND)
        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
