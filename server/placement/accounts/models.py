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
    
    # Academic Summary
    overall_cgpa = models.DecimalField(max_digits=4, decimal_places=2, default=0.00)
    total_backlogs = models.IntegerField(default=0)
    profile_completion = models.IntegerField(default=0)
    
    # Additional Info
    skills = models.TextField(blank=True)
    resume = models.FileField(upload_to='resumes/', null=True, blank=True)

    def calculate_cgpa(self):
        results = self.results.all()
        if not results:
            self.overall_cgpa = 0.00
            self.total_backlogs = 0
            self.update_profile_completion(save=False) # Update completion too
            self.save()
            return

        total_points = sum(r.gpa * r.credits for r in results)
        total_credits = sum(r.credits for r in results)
        self.overall_cgpa = total_points / total_credits if total_credits > 0 else 0.00
        self.total_backlogs = sum(r.backlogs for r in results)
        self.update_profile_completion(save=False) # Update completion too
        self.save()

    def update_profile_completion(self, save=True):
        """
        Calculates the percentage of profile completion based on filled fields.
        """
        required_fields = [
            self.dob, self.gender, self.college, self.department, 
            self.course, self.semester, self.roll_no, self.image, 
            self.skills, self.resume
        ]
        
        # Count filled fields
        filled_count = 0
        for field in required_fields:
            if field: # Works for strings, dates, and file fields
                filled_count += 1
                
        # Also check if student has academic results
        if self.pk and self.results.exists():
            filled_count += 1
            
        total_fields = len(required_fields) + 1
        self.profile_completion = int((filled_count / total_fields) * 100)
        
        if save:
            self.save()

    def save(self, *args, **kwargs):
        # Calculate completion before saving to persist it
        self.update_profile_completion(save=False)
        super().save(*args, **kwargs)

    def __str__(self):
        return f"Student - {self.user.full_name}"


# ============================
# SEMESTER RESULT
# ============================
class SemesterResult(models.Model):
    student = models.ForeignKey(Student, on_delete=models.CASCADE, related_name="results")
    semester = models.CharField(max_length=20)
    gpa = models.DecimalField(max_digits=4, decimal_places=2)
    credits = models.IntegerField()
    backlogs = models.IntegerField(default=0)

    def save(self, *args, **kwargs):
        super().save(*args, **kwargs)
        self.student.calculate_cgpa()

    def __str__(self):
        return f"{self.student.user.full_name} - Sem {self.semester}"


# ============================
# JOB MODEL
# ============================
class Job(models.Model):
    JOB_TYPE_CHOICES = (
        ('Full Time', 'Full Time'),
        ('Internship', 'Internship'),
        ('Part Time', 'Part Time'),
    )

    company = models.CharField(max_length=200)
    role = models.CharField(max_length=200)
    location = models.CharField(max_length=100)
    job_type = models.CharField(max_length=50, choices=JOB_TYPE_CHOICES)
    salary = models.CharField(max_length=50)
    description = models.TextField()
    skills_required = models.TextField()
    
    # Eligibility Criteria
    min_cgpa = models.DecimalField(max_digits=4, decimal_places=2, default=0.00)
    max_backlogs = models.IntegerField(default=0)
    allowed_departments = models.TextField(help_text="Comma separated departments")
    
    posted_on = models.DateTimeField(auto_now_add=True)
    deadline = models.DateTimeField()

    def __str__(self):
        return f"{self.role} at {self.company}"


# ============================
# JOB APPLICATION
# ============================
class JobApplication(models.Model):
    STATUS_CHOICES = (
        ('Applied', 'Applied'),
        ('Under Review', 'Under Review'),
        ('Shortlisted', 'Shortlisted'),
        ('Selected', 'Selected'),
        ('Rejected', 'Rejected'),
    )

    student = models.ForeignKey(Student, on_delete=models.CASCADE, related_name="applications")
    job = models.ForeignKey(Job, on_delete=models.CASCADE, related_name="applicants")
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='Applied')
    applied_on = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ('student', 'job')

    def __str__(self):
        return f"{self.student.user.full_name} - {self.job.role}"


# ============================
# NOTIFICATION
# ============================
class Notification(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name="notifications")
    title = models.CharField(max_length=200)
    message = models.TextField()
    is_read = models.BooleanField(default=False)
    extra_data = models.JSONField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"Notification for {self.user.full_name}: {self.title}"


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


# ============================
# REGISTRATION REQUESTS
# ============================
class RegistrationRequest(models.Model):
    STATUS_CHOICES = (
        ('Pending', 'Pending'),
        ('Approved', 'Approved'),
        ('Rejected', 'Rejected'),
    )

    # Core User Data
    full_name = models.CharField(max_length=150)
    email = models.EmailField()
    phone = models.CharField(max_length=15)
    password = models.CharField(max_length=128) # Hashed password
    role = models.CharField(max_length=20, default='student')

    # Student Profile Data
    dob = models.DateField()
    gender = models.CharField(max_length=10)
    college = models.CharField(max_length=200)
    department = models.CharField(max_length=100)
    course = models.CharField(max_length=50)
    semester = models.CharField(max_length=20)
    roll_no = models.CharField(max_length=50)
    image = models.ImageField(upload_to='registration_requests/', null=True, blank=True)

    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='Pending')
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Request: {self.full_name} ({self.department})"
