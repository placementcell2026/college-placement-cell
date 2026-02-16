from django.db import models
from django.contrib.auth.models import AbstractBaseUser, PermissionsMixin
from django.utils import timezone
from .manager import UserManager


# ============================
# MAIN USER MODEL
# ============================
class User(AbstractBaseUser, PermissionsMixin):

    ROLE_CHOICES = (
        ('student', 'Student'),
        ('teacher', 'Teacher'),
        ('placement', 'Placement Cell Officer'),
    )

    phone = models.CharField(max_length=15, unique=True)
    email = models.EmailField(unique=True)
    full_name = models.CharField(max_length=150)
    role = models.CharField(max_length=20, choices=ROLE_CHOICES)

    is_active = models.BooleanField(default=True)
    is_staff = models.BooleanField(default=False)
    date_joined = models.DateTimeField(default=timezone.now)

    USERNAME_FIELD = 'phone'
    REQUIRED_FIELDS = ['email', 'full_name']

    objects = UserManager()

    def __str__(self):
        return f"{self.full_name} - {self.role}"


# ============================
# STUDENT PROFILE
# ============================
class Student(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name="student")

    dob = models.DateField()
    gender = models.CharField(max_length=10)
    college = models.CharField(max_length=200)
    department = models.CharField(max_length=100)
    course = models.CharField(max_length=50)
    semester = models.CharField(max_length=20)
    roll_no = models.CharField(max_length=50)

    image = models.ImageField(upload_to='students/', null=True, blank=True)

    def __str__(self):
        return f"Student - {self.user.full_name}"


# ============================
# TEACHER PROFILE
# ============================
class Teacher(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name="teacher")

    designation = models.CharField(max_length=100)
    qualification = models.CharField(max_length=100)
    department = models.CharField(max_length=100)
    experience = models.CharField(max_length=50)
    position = models.CharField(max_length=50)

    image = models.ImageField(upload_to='teachers/', null=True, blank=True)

    def __str__(self):
        return f"Teacher - {self.user.full_name}"


# ============================
# PLACEMENT CELL OFFICER PROFILE
# ============================
class PlacementOfficer(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name="placement")

    designation = models.CharField(max_length=100)
    office_role = models.CharField(max_length=100)
    experience = models.CharField(max_length=50)
    college = models.CharField(max_length=200)

    image = models.ImageField(upload_to='placement/', null=True, blank=True)

    def __str__(self):
        return f"Placement Officer - {self.user.full_name}"
