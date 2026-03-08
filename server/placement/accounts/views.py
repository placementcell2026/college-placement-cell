import traceback
from django.contrib.auth import authenticate
from rest_framework import status
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.permissions import AllowAny, IsAuthenticated
from .models import User, Teacher, Notification, Student, RegistrationRequest, PlacementOfficer
from .serializers import UserRegistrationSerializer
from .ats_utils import (
    extract_resume_text,
    calculate_ats_score,
    extract_skills,
    find_missing_skills,
    check_resume_sections
)
from django.contrib.auth.hashers import make_password

from django.contrib.auth.hashers import make_password
from captcha.models import CaptchaStore
from captcha.helpers import captcha_image_url

class CaptchaView(APIView):
    permission_classes = [AllowAny]
    def get(self, request):
        key = CaptchaStore.generate_key()
        image_url = captcha_image_url(key)
        # Ensure image_url is absolute for the frontend
        if not image_url.startswith('http'):
            image_url = f"http://127.0.0.1:8000{image_url}"
        return Response({"captcha_key": key, "captcha_image": image_url})

class RegisterView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        # Ensure we have a mutable dictionary
        if hasattr(request.data, 'dict'):
            data = request.data.dict()
        else:
            data = request.data.copy()

        role = data.get('role')

        if not role:
            return Response({"error": "Role is required"}, status=status.HTTP_400_BAD_REQUEST)

        # Captcha Verification
        captcha_key = data.get('captcha_key')
        captcha_value = data.get('captcha_value')
        
        if not captcha_key or not captcha_value:
             return Response({"error": "Captcha verification failed: Missing key or value"}, status=status.HTTP_400_BAD_REQUEST)

        try:
            captcha = CaptchaStore.objects.get(hashkey=captcha_key)
            if captcha.response.lower() != captcha_value.lower():
                return Response({"error": "Captcha verification failed: Wrong answer!"}, status=status.HTTP_400_BAD_REQUEST)
            captcha.delete() # Consumed
        except CaptchaStore.DoesNotExist:
            return Response({"error": "Captcha verification failed: Expired or invalid session"}, status=status.HTTP_400_BAD_REQUEST)

        # Ensure main user fields are snake_case (handle both frontend styles)
        field_mapping = {
            'fullName': 'full_name',
            'phone': 'phone',
            'email': 'email',
            'password': 'password',
        }
        for camel, snake in field_mapping.items():
            if camel in data and snake not in data:
                data[snake] = data.get(camel)

        # Define profile fields for each role
        profile_fields = {
            'student': ['dob', 'gender', 'college', 'department', 'course', 'semester', 'roll_no', 'image'],
            'teacher': ['designation', 'qualification', 'department', 'experience', 'position', 'image'],
            'placement': ['designation', 'office_role', 'experience', 'college', 'image'],
        }

        # Restructure flat data into nested format for serializer
        if role in profile_fields:
            profile_data = {}
            for field in profile_fields[role]:
                # Check for both snake_case and potential camelCase from frontend
                camel_field = ''.join(word.capitalize() if i > 0 else word for i, word in enumerate(field.split('_')))
                value = data.get(field) or data.get(camel_field)
                if value is not None:
                    profile_data[field] = value
            
            data[role] = profile_data

        try:
            # Handle student registration requests
            if role == 'student':
                # Check if user already exists
                phone = data.get('phone')
                email = data.get('email')
                
                if User.objects.filter(phone=phone).exists():
                    return Response({"error": "A user with this phone number is already registered."}, status=status.HTTP_400_BAD_REQUEST)
                if User.objects.filter(email=email).exists():
                    return Response({"error": "A user with this email is already registered."}, status=status.HTTP_400_BAD_REQUEST)
                
                # Check for existing pending request
                if RegistrationRequest.objects.filter(phone=phone, status='Pending').exists():
                    return Response({"error": "You already have a pending registration request. Please wait for approval."}, status=status.HTTP_400_BAD_REQUEST)

                student_data = data.get('student', {})
                req = RegistrationRequest.objects.create(
                    full_name=data.get('full_name'),
                    email=data.get('email'),
                    phone=data.get('phone'),
                    password=make_password(data.get('password')),
                    role='student',
                    dob=student_data.get('dob'),
                    gender=student_data.get('gender'),
                    college=student_data.get('college'),
                    department=student_data.get('department'),
                    course=student_data.get('course'),
                    semester=student_data.get('semester'),
                    roll_no=student_data.get('roll_no'),
                    image=request.FILES.get('image') or student_data.get('image')
                )
                
                # Prepare dynamic notification data with all student details
                notification_payload = {
                    "type": "registration_request",
                    "request_id": req.id,
                    "full_name": req.full_name,
                    "email": req.email,
                    "phone": req.phone,
                    "dob": str(req.dob) if req.dob else None,
                    "gender": req.gender,
                    "college": req.college,
                    "department": req.department,
                    "course": req.course,
                    "semester": req.semester,
                    "roll_no": req.roll_no
                }

                # Notify teachers of the department
                department = student_data.get('department')
                if department:
                    teachers = Teacher.objects.filter(department__iexact=department)
                    for teacher in teachers:
                        Notification.objects.create(
                            user=teacher.user,
                            title="New Registration Request",
                            message=f"Student {req.full_name} from {department} department has requested registration.",
                            extra_data=notification_payload
                        )

                return Response({
                    "message": "Registration request submitted. Please wait for teacher approval.",
                    "role": "student",
                    "pending": True
                }, status=status.HTTP_201_CREATED)

            # For others (Teacher/Placement), use standard serializer
            print("Registering non-student user. Data:", data)
            serializer = UserRegistrationSerializer(data=data)
            if serializer.is_valid():
                user = serializer.save()
                return Response({
                    "message": "User registered successfully",
                    "user_id": user.phone,
                    "id": user.id,
                    "role": user.role,
                    "full_name": user.full_name
                }, status=status.HTTP_201_CREATED)
            
            print("Serializer Errors:", serializer.errors)
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        except Exception as e:
            traceback.print_exc()
            return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

class NotificationListView(APIView):
    # permission_classes = [IsAuthenticated] # Enable this after auth is stable
    
    def get(self, request):
        phone = request.query_params.get('phone')
        if not phone:
            return Response({"error": "Phone required"}, status=status.HTTP_400_BAD_REQUEST)
            
        notifications = Notification.objects.filter(user__phone=phone).order_by('-created_at')
        data = [{
            "id": n.id,
            "title": n.title,
            "message": n.message,
            "is_read": n.is_read,
            "extra_data": n.extra_data,
            "created_at": n.created_at,
            "type": "registration_request" if n.extra_data and n.extra_data.get("type") == "registration_request" else ("info" if "Job" in n.title else "success")
        } for n in notifications]
        
        return Response(data)

    def delete(self, request):
        phone = request.query_params.get('phone')
        notif_id = request.query_params.get('notif_id')
        
        if not phone:
            return Response({"error": "Phone required"}, status=status.HTTP_400_BAD_REQUEST)
        
        if notif_id:
            try:
                Notification.objects.filter(user__phone=phone, id=notif_id).delete()
                return Response({"message": "Notification deleted"}, status=status.HTTP_200_OK)
            except Exception as e:
                return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        
        Notification.objects.filter(user__phone=phone).delete()
        return Response({"message": "All notifications cleared"}, status=status.HTTP_200_OK)

class LoginView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        phone = request.data.get('phone')
        password = request.data.get('password')
        role = request.data.get('role')

        if not phone or not password:
            return Response({'error': 'Please provide both phone and password'}, status=status.HTTP_400_BAD_REQUEST)

        user = authenticate(username=phone, password=password)

        if user:
            if role and user.role != role:
                 return Response({'error': 'Invalid credentials'}, status=status.HTTP_401_UNAUTHORIZED)
            
            response_data = {
                "message": "Login successful",
                "phone": user.phone,
                "user_id": user.phone,
                "id": user.id,
                "role": user.role,
                "full_name": user.full_name
            }

            # Add more details based on role
            if user.role == 'teacher':
                try:
                    teacher = Teacher.objects.get(user=user)
                    response_data['department'] = teacher.department
                    if teacher.image:
                        response_data['image'] = teacher.image.url
                except Teacher.DoesNotExist:
                    pass
            elif user.role == 'student':
                try:
                    student = Student.objects.get(user=user)
                    response_data['department'] = student.department
                    response_data['ats_score'] = student.ats_score
                    if student.image:
                        response_data['image'] = student.image.url
                except Student.DoesNotExist:
                    pass
            elif user.role == 'placement':
                try:
                    pcf = PlacementOfficer.objects.get(user=user)
                    response_data['college'] = pcf.college
                    if pcf.image:
                        response_data['image'] = pcf.image.url
                except PlacementOfficer.DoesNotExist:
                    pass

            # Ensure image URL is absolute if it exists
            if 'image' in response_data and response_data['image'] and not response_data['image'].startswith('http'):
                response_data['image'] = f"http://127.0.0.1:8000{response_data['image']}"

            return Response(response_data, status=status.HTTP_200_OK)
        
        # Check if user exists but is inactive
        try:
            user_exists = User.objects.get(phone=phone)
            if not user_exists.is_active:
                return Response({'error': 'Your account is pending teacher approval. Please check back later.'}, status=status.HTTP_401_UNAUTHORIZED)
        except User.DoesNotExist:
            pass
            
        return Response({'error': 'Invalid credentials'}, status=status.HTTP_401_UNAUTHORIZED)

class StudentActionView(APIView):
    def post(self, request):
        student_id = request.data.get('student_id')
        action = request.data.get('action') # 'blacklist' or 'remove'
        
        if not student_id or not action:
            return Response({"error": "Student ID and action required"}, status=status.HTTP_400_BAD_REQUEST)
            
        try:
            student = Student.objects.get(id=student_id)
            user = student.user
            
            if action == 'blacklist':
                student.is_blacklisted = not student.is_blacklisted # Toggle blacklist
                student.save()
                msg = f"Student {user.full_name} {'blacklisted' if student.is_blacklisted else 'removed from blacklist'} successfully"
                return Response({"message": msg, "is_blacklisted": student.is_blacklisted})
                
            elif action == 'remove':
                user_name = user.full_name
                user.delete() # Deleting user will cascade delete student profile
                return Response({"message": f"Student {user_name} removed successfully"})
            
            return Response({"error": "Invalid action"}, status=status.HTTP_400_BAD_REQUEST)
            
        except Student.DoesNotExist:
            return Response({"error": "Student not found"}, status=status.HTTP_404_NOT_FOUND)


