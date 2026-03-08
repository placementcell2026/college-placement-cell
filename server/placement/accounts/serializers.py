from rest_framework import serializers
from rest_framework.validators import UniqueValidator
from django.db import transaction
from .models import User, Student, Teacher, PlacementOfficer, SemesterResult, Job, JobApplication, Notification, Interview

class SemesterResultSerializer(serializers.ModelSerializer):
    class Meta:
        model = SemesterResult
        fields = ['semester', 'gpa', 'credits', 'backlogs']

class StudentSerializer(serializers.ModelSerializer):
    results = SemesterResultSerializer(many=True, read_only=True)
    
    class Meta:
        model = Student
        fields = [
            'dob', 'gender', 'college', 'department', 'course', 'semester', 'roll_no', 'image',
            'overall_cgpa', 'total_backlogs', 'profile_completion', 'skills', 'resume', 'results'
        ]

    def validate_roll_no(self, value):
        if not value.isdigit() or len(value) != 10:
            raise serializers.ValidationError("Register Number must be exactly 10 digits.")
        return value

class JobSerializer(serializers.ModelSerializer):
    class Meta:
        model = Job
        fields = '__all__'

class JobApplicationSerializer(serializers.ModelSerializer):
    job_details = JobSerializer(source='job', read_only=True)
    
    class Meta:
        model = JobApplication
        fields = ['id', 'job', 'status', 'applied_on', 'job_details']

class NotificationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Notification
        fields = ['id', 'title', 'message', 'is_read', 'created_at']

class StudentSimpleSerializer(serializers.ModelSerializer):
    full_name = serializers.CharField(source='user.full_name', read_only=True)
    phone = serializers.CharField(source='user.phone', read_only=True)
    email = serializers.CharField(source='user.email', read_only=True)
    
    class Meta:
        model = Student
        fields = ['id', 'full_name', 'phone', 'email', 'roll_no', 'department', 'semester']

class InterviewSerializer(serializers.ModelSerializer):
    selected_students_details = StudentSimpleSerializer(source='selected_students', many=True, read_only=True)
    
    class Meta:
        model = Interview
        fields = '__all__'
        extra_kwargs = {
            'created_by': {'required': False, 'allow_null': True}
        }

class TeacherSerializer(serializers.ModelSerializer):
    class Meta:
        model = Teacher
        fields = ['designation', 'qualification', 'department', 'experience', 'position', 'image']

class PlacementOfficerSerializer(serializers.ModelSerializer):
    class Meta:
        model = PlacementOfficer
        fields = ['designation', 'office_role', 'experience', 'college', 'image']

class UserRegistrationSerializer(serializers.ModelSerializer):
    phone = serializers.CharField(
        required=True,
        validators=[UniqueValidator(queryset=User.objects.all(), message="A user with this phone number already exists.")]
    )
    email = serializers.EmailField(
        required=True,
        validators=[UniqueValidator(queryset=User.objects.all(), message="A user with this email already exists.")]
    )
    full_name = serializers.CharField(required=True)
    password = serializers.CharField(write_only=True)
    
    # Role specific fields
    student = StudentSerializer(required=False)
    teacher = TeacherSerializer(required=False)
    placement = PlacementOfficerSerializer(required=False)
    dept_code = serializers.CharField(write_only=True, required=False)

    class Meta:
        model = User
        fields = ['phone', 'email', 'full_name', 'role', 'password', 'student', 'teacher', 'placement', 'dept_code']

    def validate_phone(self, value):
        value = value.strip()
        if not value:
            raise serializers.ValidationError("Phone number cannot be empty.")
        if not value.isdigit() or len(value) != 10:
            raise serializers.ValidationError("Phone number must be exactly 10 digits.")
        return value

    def validate_email(self, value):
        if not value.lower().endswith("@gmail.com"):
            raise serializers.ValidationError("Only Gmail addresses (@gmail.com) are allowed.")
        return value

    def validate_password(self, value):
        if len(value) < 8:
            raise serializers.ValidationError("Password must be at least 8 characters long.")
        if not any(char.isupper() for char in value):
            raise serializers.ValidationError("Password must contain at least one uppercase letter (A-Z).")
        if not any(char.islower() for char in value):
            raise serializers.ValidationError("Password must contain at least one lowercase letter (a-z).")
        if not any(char in "@!#$%^&*()_+-=[]{}|;:,.<>?/~`" for char in value):
            raise serializers.ValidationError("Password must contain at least one special character (e.g., @!#$%).")
        return value

    def validate_full_name(self, value):
        if not value.strip():
            raise serializers.ValidationError("Full name cannot be empty or just whitespace.")
        return value.strip()

    def validate(self, data):
        role = data.get('role')
        if role == 'student' and not data.get('student'):
            raise serializers.ValidationError({"student": "Student profile data is required for student role."})
        elif role == 'teacher':
            teacher_data = data.get('teacher')
            if not teacher_data:
                raise serializers.ValidationError({"teacher": "Teacher profile data is required for teacher role."})
            
            # Department Code Validation for Teachers
            dept_code = data.get('dept_code')
            department = teacher_data.get('department', '').upper()
            
            DEPARTMENT_CODES = {
                'CT': 'CTPLACE26',
                'CM': 'CMPLACE26',
                'EL': 'ELPLACE26',
                'EEE': 'EEEPLACE26',
                'BME': 'BMEPLACE26',
                'RPA': 'RPAPLACE26',
            }
            
            if department not in DEPARTMENT_CODES:
                raise serializers.ValidationError({"teacher": {"department": f"Invalid department: {department}"}})
            
            if not dept_code:
                raise serializers.ValidationError({"dept_code": "Department authentication code is required for teacher registration."})
            
            if dept_code != DEPARTMENT_CODES[department]:
                raise serializers.ValidationError({"dept_code": "Invalid department authentication code."})

        elif role == 'placement' and not data.get('placement'):
            raise serializers.ValidationError({"placement": "Placement profile data is required for placement officer role."})
        return data

    def create(self, validated_data):
        role = validated_data.get('role')
        password = validated_data.pop('password')
        
        # Extract profile data
        student_data = validated_data.pop('student', None)
        teacher_data = validated_data.pop('teacher', None)
        placement_data = validated_data.pop('placement', None)
        validated_data.pop('dept_code', None) # Remove dept_code after validation

        with transaction.atomic():
            user = User.objects.create_user(password=password, **validated_data)

            if role == 'student' and student_data:
                Student.objects.create(user=user, **student_data)
            elif role == 'teacher' and teacher_data:
                Teacher.objects.create(user=user, **teacher_data)
            elif role == 'placement' and placement_data:
                PlacementOfficer.objects.create(user=user, **placement_data)
        
        return user
