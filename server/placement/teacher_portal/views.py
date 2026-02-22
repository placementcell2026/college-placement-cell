from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from accounts.models import Student, User, Teacher, RegistrationRequest, Notification
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

            data = {
                "message": f"Welcome to the {dept} Teacher Dashboard",
                "stats": [
                    {"label": "Total Students", "value": str(total_students)},
                    {"label": "Placed Students", "value": str(placed_students)},
                    {"label": "Pending Approvals", "value": str(pending_approvals)},
                ]
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
                "college": r.college,
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
            if User.objects.filter(phone=reg_request.phone).exists():
                return Response({"error": "User with this phone number already exists"}, status=status.HTTP_400_BAD_REQUEST)
            if User.objects.filter(email=reg_request.email).exists():
                return Response({"error": "User with this email already exists"}, status=status.HTTP_400_BAD_REQUEST)

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
