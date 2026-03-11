from rest_framework import viewsets, status
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.decorators import action
from django.http import HttpResponse
from accounts.models import Job, JobApplication, Student, PlacementOfficer, Teacher, Interview, DrivePoster
from accounts.serializers import JobSerializer, JobApplicationSerializer, InterviewSerializer, DrivePosterSerializer

class DrivePosterViewSet(viewsets.ModelViewSet):
    queryset = DrivePoster.objects.all().order_by('-posted_on')
    serializer_class = DrivePosterSerializer

    def perform_create(self, serializer):
        phone = self.request.data.get('phone')
        if phone:
            from accounts.models import User
            user = User.objects.filter(phone=phone).first()
            if user:
                serializer.save(posted_by=user)
            else:
                serializer.save()
        else:
            serializer.save()

import io

# Try to import reportlab, if not available, we will handle it
try:
    from reportlab.pdfgen import canvas
    from reportlab.lib.pagesizes import letter
    from reportlab.lib import colors
    from reportlab.platypus import SimpleDocTemplate, Table, TableStyle, Paragraph, Spacer
    from reportlab.lib.styles import getSampleStyleSheet
    REPORTLAB_AVAILABLE = True
except ImportError:
    REPORTLAB_AVAILABLE = False

class PlacementDashboardView(APIView):
    def get(self, request):
        data = {
            "message": "Welcome to the Placement Officer Dashboard",
            "stats": [
                {"label": "Active Drives", "value": str(Job.objects.count())},
                {"label": "Total Applications", "value": str(JobApplication.objects.count())},
                {"label": "Students Registered", "value": str(Student.objects.count())},
                {"label": "Teachers Registered", "value": str(Teacher.objects.count())},
                {"label": "Departments", "value": str(Teacher.objects.values('department').distinct().count() or Student.objects.values('department').distinct().count())},
            ]
        }
        return Response(data)

class JobViewSet(viewsets.ModelViewSet):
    queryset = Job.objects.all().order_by('-posted_on')
    serializer_class = JobSerializer
    
    def get_serializer_class(self):
        return JobSerializer

    @action(detail=True, methods=['get'])
    def applicants(self, request, pk=None):
        job = self.get_object()
        applicants = JobApplication.objects.filter(job=job)
        serializer = JobApplicationSerializer(applicants, many=True)
        return Response(serializer.data)

    @action(detail=True, methods=['get'])
    def export_pdf(self, request, pk=None):
        if not REPORTLAB_AVAILABLE:
            return Response({"error": "PDF generation library (reportlab) is not installed on the server."}, 
                            status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        
        job = self.get_object()
        applications = JobApplication.objects.filter(job=job)
        
        buffer = io.BytesIO()
        doc = SimpleDocTemplate(buffer, pagesize=letter)
        elements = []
        styles = getSampleStyleSheet()
        
        # Title
        elements.append(Paragraph(f"Applicants List for {job.role} at {job.company}", styles['Title']))
        elements.append(Spacer(1, 12))
        
        # Table Data
        data = [["Name", "Email", "Phone", "CGPA", "Backlogs", "Status"]]
        for app in applications:
            student = app.student
            data.append([
                student.user.full_name,
                student.user.email,
                student.user.phone,
                f"{student.overall_cgpa:.2f}",
                str(student.total_backlogs),
                app.status
            ])
        
        # Table Styling
        table = Table(data)
        table.setStyle(TableStyle([
            ('BACKGROUND', (0, 0), (-1, 0), colors.grey),
            ('TEXTCOLOR', (0, 0), (-1, 0), colors.whitesmoke),
            ('ALIGN', (0, 0), (-1, -1), 'CENTER'),
            ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
            ('BOTTOMPADDING', (0, 0), (-1, 0), 12),
            ('BACKGROUND', (0, 1), (-1, -1), colors.beige),
            ('GRID', (0, 0), (-1, -1), 1, colors.black)
        ]))
        
        elements.append(table)
        doc.build(elements)
        
        buffer.seek(0)
        response = HttpResponse(buffer, content_type='application/pdf')
        response['Content-Disposition'] = f'attachment; filename="applicants_{job.id}.pdf"'
        return response

class InterviewViewSet(viewsets.ModelViewSet):
    queryset = Interview.objects.all().order_by('-date_time')
    serializer_class = InterviewSerializer

    def get_queryset(self):
        # Allow checking interviews by department if needed
        dept = self.request.query_params.get('department')
        if dept:
            return Interview.objects.filter(department=dept).order_by('-date_time')
        return super().get_queryset()

class PlacementOfficerProfileView(APIView):
    # ... (existing profile view code)
    def get(self, request):
        phone = request.query_params.get('phone')
        try:
            officer = PlacementOfficer.objects.get(user__phone=phone)
            data = {
                "full_name": officer.user.full_name,
                "email": officer.user.email,
                "phone": officer.user.phone,
                "designation": officer.designation,
                "office_role": officer.office_role,
                "experience": officer.experience,
                "college": officer.college,
                "image": officer.image.url if officer.image else None,
            }
            return Response(data)
        except PlacementOfficer.DoesNotExist:
            return Response({"error": "Placement Officer not found"}, status=status.HTTP_404_NOT_FOUND)

    def patch(self, request):
        phone = request.data.get('phone', '').strip()
        try:
            if phone:
                pcf = PlacementOfficer.objects.get(user__phone=phone)
            elif request.user.is_authenticated:
                pcf = PlacementOfficer.objects.get(user=request.user)
            else:
                return Response({"error": "Phone number required"}, status=status.HTTP_400_BAD_REQUEST)
            fields = ['designation', 'office_role', 'experience', 'college']
            for field in fields:
                if field in request.data:
                    setattr(pcf, field, request.data.get(field))
            
            if 'image' in request.FILES:
                pcf.image = request.FILES['image']
                
            pcf.save()
            return Response({
                "message": "Profile updated successfully",
                "full_name": pcf.user.full_name,
                "email": pcf.user.email,
                "phone": pcf.user.phone,
                "designation": pcf.designation,
                "office_role": pcf.office_role,
                "experience": pcf.experience,
                "college": pcf.college,
                "image": pcf.image.url if pcf.image else None,
            })
        except PlacementOfficer.DoesNotExist:
            return Response({"error": "Placement Officer not found"}, status=status.HTTP_404_NOT_FOUND)
        except Exception as e:
            import traceback
            traceback.print_exc()
            return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)

class RegisteredStudentsView(APIView):
    def get(self, request):
        students = Student.objects.all().select_related('user')
        data = [{
            "id": s.id,
            "full_name": s.user.full_name,
            "email": s.user.email,
            "phone": s.user.phone,
            "department": s.department,
            "course": s.course,
            "overall_cgpa": s.overall_cgpa,
            "is_blacklisted": s.is_blacklisted
        } for s in students]
        return Response(data)

class TotalApplicationsView(APIView):
    def get(self, request):
        applications = JobApplication.objects.all().select_related('student__user', 'job')
        data = [{
            "id": app.id,
            "student_name": app.student.user.full_name,
            "company": app.job.company,
            "role": app.job.role,
            "status": app.status,
            "applied_on": app.applied_on.strftime("%Y-%m-%d")
        } for app in applications]
        return Response(data)

class ExportStudentsPDFView(APIView):
    def get(self, request):
        if not REPORTLAB_AVAILABLE:
            return Response({"error": "PDF library not available"}, status=500)
            
        students = Student.objects.all().select_related('user')
        buffer = io.BytesIO()
        doc = SimpleDocTemplate(buffer, pagesize=letter)
        elements = []
        styles = getSampleStyleSheet()
        
        elements.append(Paragraph("Registered Students Report", styles['Title']))
        elements.append(Spacer(1, 12))
        
        data = [["Name", "Email", "Department", "CGPA"]]
        for s in students:
            data.append([s.user.full_name, s.user.email, s.department, f"{s.overall_cgpa:.2f}"])
            
        table = Table(data)
        table.setStyle(TableStyle([
            ('BACKGROUND', (0, 0), (-1, 0), colors.grey),
            ('TEXTCOLOR', (0, 0), (-1, 0), colors.whitesmoke),
            ('ALIGN', (0, 0), (-1, -1), 'CENTER'),
            ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
            ('GRID', (0, 0), (-1, -1), 1, colors.black)
        ]))
        
        elements.append(table)
        doc.build(elements)
        buffer.seek(0)
        response = HttpResponse(buffer, content_type='application/pdf')
        response['Content-Disposition'] = 'attachment; filename="registered_students.pdf"'
        return response

class ExportApplicationsPDFView(APIView):
    def get(self, request):
        if not REPORTLAB_AVAILABLE:
            return Response({"error": "PDF library not available"}, status=500)
            
        applications = JobApplication.objects.all().select_related('student__user', 'job')
        buffer = io.BytesIO()
        doc = SimpleDocTemplate(buffer, pagesize=letter)
        elements = []
        styles = getSampleStyleSheet()
        
        elements.append(Paragraph("Total Job Applications Report", styles['Title']))
        elements.append(Spacer(1, 12))
        
        data = [["Student", "Company", "Role", "Status", "Date"]]
        for app in applications:
            data.append([
                app.student.user.full_name, 
                app.job.company, 
                app.job.role, 
                app.status,
                app.applied_on.strftime("%Y-%m-%d")
            ])
            
        table = Table(data)
        table.setStyle(TableStyle([
            ('BACKGROUND', (0, 0), (-1, 0), colors.grey),
            ('TEXTCOLOR', (0, 0), (-1, 0), colors.whitesmoke),
            ('ALIGN', (0, 0), (-1, -1), 'CENTER'),
            ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
            ('GRID', (0, 0), (-1, -1), 1, colors.black)
        ]))
        
        elements.append(table)
        doc.build(elements)
        buffer.seek(0)
        response = HttpResponse(buffer, content_type='application/pdf')
        response['Content-Disposition'] = 'attachment; filename="total_applications.pdf"'
        return response

class RegisteredTeachersView(APIView):
    def get(self, request):
        teachers = Teacher.objects.all().select_related('user')
        data = [{
            "id": t.id,
            "full_name": t.user.full_name,
            "email": t.user.email,
            "phone": t.user.phone,
            "department": t.department,
            "designation": t.designation,
            "position": t.position
        } for t in teachers]
        return Response(data)

class ExportTeachersPDFView(APIView):
    def get(self, request):
        if not REPORTLAB_AVAILABLE:
            return Response({"error": "PDF library not available"}, status=500)
            
        teachers = Teacher.objects.all().select_related('user')
        buffer = io.BytesIO()
        doc = SimpleDocTemplate(buffer, pagesize=letter)
        elements = []
        styles = getSampleStyleSheet()
        
        elements.append(Paragraph("Registered Teachers Report", styles['Title']))
        elements.append(Spacer(1, 12))
        
        data = [["Name", "Department", "Designation", "Email"]]
        for t in teachers:
            data.append([t.user.full_name, t.department, t.designation, t.user.email])
            
        table = Table(data)
        table.setStyle(TableStyle([
            ('BACKGROUND', (0, 0), (-1, 0), colors.grey),
            ('TEXTCOLOR', (0, 0), (-1, 0), colors.whitesmoke),
            ('ALIGN', (0, 0), (-1, -1), 'CENTER'),
            ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
            ('GRID', (0, 0), (-1, -1), 1, colors.black)
        ]))
        
        elements.append(table)
        doc.build(elements)
        buffer.seek(0)
        response = HttpResponse(buffer, content_type='application/pdf')
        response['Content-Disposition'] = 'attachment; filename="registered_teachers.pdf"'
        return response

class DepartmentListView(APIView):
    def get(self, request):
        # Get all departments from both Student and Teacher models
        teacher_depts = Teacher.objects.values_list('department', flat=True).distinct()
        student_depts = Student.objects.values_list('department', flat=True).distinct()
        all_depts = sorted(list(set(list(teacher_depts) + list(student_depts))))
        
        data = []
        for dept in all_depts:
            teachers = Teacher.objects.filter(department=dept).select_related('user')
            students_count = Student.objects.filter(department=dept).count()
            placed_count = Student.objects.filter(department=dept, applications__status='Selected').distinct().count()
            
            teacher_list = [{
                "id": t.id,
                "full_name": t.user.full_name,
                "designation": t.designation,
                "email": t.user.email,
                "phone": t.user.phone
            } for t in teachers]
            
            data.append({
                "name": dept,
                "teachers_count": teachers.count(),
                "students_count": students_count,
                "placed_count": placed_count,
                "teachers": teacher_list
            })
        return Response(data)
