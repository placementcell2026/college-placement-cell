import os
import django
import sys
from datetime import datetime, timedelta

# Setup django environment
sys.path.append('/Users/binileb/Athul/college-placement-cell/server/placement')
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'placement.settings')
django.setup()

from accounts.models import User, Student, Job, SemesterResult

def seed():
    # 1. Create a sample student if doesn't exist
    user, created = User.objects.get_or_create(
        phone='9876543210',
        defaults={
            'email': 'john@example.com',
            'full_name': 'John Doe',
            'role': 'student'
        }
    )
    if created:
        user.set_password('password123')
        user.save()

    student, created = Student.objects.get_or_create(
        user=user,
        defaults={
            'dob': '2002-01-01',
            'gender': 'Male',
            'college': 'Example Engineering College',
            'department': 'Computer Science',
            'course': 'B.Tech',
            'semester': '6',
            'roll_no': 'CS101',
            'profile_completion': 80
        }
    )

    # 2. Add Semester Results
    SemesterResult.objects.get_or_create(
        student=student, semester='1', defaults={'gpa': 8.5, 'credits': 20, 'backlogs': 0}
    )
    SemesterResult.objects.get_or_create(
        student=student, semester='2', defaults={'gpa': 7.8, 'credits': 22, 'backlogs': 0}
    )
    
    # Trigger CGPA calculation
    student.calculate_cgpa()
    print(f"Student CGPA: {student.overall_cgpa}")

    # 3. Create Sample Jobs
    Job.objects.get_or_create(
        company='Google',
        role='Software Engineer',
        defaults={
            'location': 'Bangalore',
            'job_type': 'Full Time',
            'salary': '25 LPA',
            'description': 'Work on large scale systems.',
            'skills_required': 'Python, Java, Distributed Systems',
            'min_cgpa': 8.0,
            'max_backlogs': 0,
            'allowed_departments': 'Computer Science, Information Technology',
            'deadline': datetime.now() + timedelta(days=10)
        }
    )
    
    Job.objects.get_or_create(
        company='TCS',
        role='System Engineer',
        defaults={
            'location': 'Mumbai',
            'job_type': 'Full Time',
            'salary': '4 LPA',
            'description': 'Software maintenance and support.',
            'skills_required': 'C++, SQL',
            'min_cgpa': 6.0,
            'max_backlogs': 2,
            'allowed_departments': 'All Departments',
            'deadline': datetime.now() + timedelta(days=5)
        }
    )

    print("Seed data created successfully.")

if __name__ == "__main__":
    seed()
