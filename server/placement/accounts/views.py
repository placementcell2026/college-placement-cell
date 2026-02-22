import traceback
from django.contrib.auth import authenticate
from rest_framework import status
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.permissions import AllowAny, IsAuthenticated
from .models import User, Teacher, Notification, Student, RegistrationRequest
from .serializers import UserRegistrationSerializer
from django.contrib.auth.hashers import make_password

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
            serializer = UserRegistrationSerializer(data=data)
            if serializer.is_valid():
                user = serializer.save()
                return Response({
                    "message": "User registered successfully",
                    "user_id": user.phone,
                    "role": user.role,
                    "full_name": user.full_name
                }, status=status.HTTP_201_CREATED)
            
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
                 return Response({'error': f'Invalid role. You are registered as {user.role}'}, status=status.HTTP_401_UNAUTHORIZED)
            
            return Response({
                "message": "Login successful",
                "user_id": user.phone,
                "role": user.role,
                "full_name": user.full_name
            }, status=status.HTTP_200_OK)
        
        # Check if user exists but is inactive
        try:
            user_exists = User.objects.get(phone=phone)
            if not user_exists.is_active:
                return Response({'error': 'Your account is pending teacher approval. Please check back later.'}, status=status.HTTP_401_UNAUTHORIZED)
        except User.DoesNotExist:
            pass
            
        return Response({'error': 'Invalid credentials'}, status=status.HTTP_401_UNAUTHORIZED)
