import traceback
from django.contrib.auth import authenticate
from rest_framework import status
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.permissions import AllowAny
from .serializers import UserRegistrationSerializer

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
            serializer = UserRegistrationSerializer(data=data)
            if serializer.is_valid():
                user = serializer.save()
                return Response({
                    "message": "User registered successfully",
                    "user_id": user.phone,
                    "role": user.role
                }, status=status.HTTP_201_CREATED)
            
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        except Exception as e:
            traceback.print_exc()
            return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

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
        
        return Response({'error': 'Invalid credentials'}, status=status.HTTP_401_UNAUTHORIZED)
