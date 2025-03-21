from django.shortcuts import render
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import generics, permissions, status
from rest_framework.parsers import MultiPartParser, FormParser
from django.core.exceptions import ValidationError
from django.http import JsonResponse, HttpResponse, FileResponse
from django.views.decorators.csrf import csrf_exempt
from django.conf import settings
import json
import os
from pathlib import Path
import logging

from .serializers import (
    LecturerSerializer, CategorySerializer, CourseSerializer, 
    AssignemtSerializer, StudentSerializer, StudentCourseEnrollmentSerializer
)
from . import models
from .models import St_Assignment
from .utils import calculate_similarity, extract_text_from_file
from .web_similarity_crew import analyze_assignment_web_similarity

# Set up logging
logger = logging.getLogger(__name__)

#we use generics method to get post and delete functions.when we useprevious method using API view then we have to mension all input Fields

class LecturerList(generics.ListCreateAPIView):
    queryset = models.Lecturer.objects.all()
    serializer_class = LecturerSerializer
    #permission_classes = [permissions.IsAuthenticated]

class LecturerDetail(generics.RetrieveUpdateDestroyAPIView):
    queryset = models.Lecturer.objects.all()
    serializer_class = LecturerSerializer
    #permission_classes = [permissions.IsAuthenticated]
 
@csrf_exempt  
def  lecturer_login(request):
    if request.method == 'POST':
        email = request.POST['email']
        password = request.POST['password']
        try:
            lecturerData = models.Lecturer.objects.get(email=email, password=password)
            return JsonResponse({
                'bool': True,
                'lecturer_id': lecturerData.id
            })
        except models.Lecturer.DoesNotExist:
            return JsonResponse({'bool': False})
    return JsonResponse({'bool': False})


class CategoryList(generics.ListCreateAPIView):
    queryset = models.CourseCategory.objects.all()
    serializer_class = CategorySerializer
    #permission_classes = [permissions.IsAuthenticated]

class CourseList(generics.ListCreateAPIView):
    queryset = models.Course.objects.all()
    serializer_class = CourseSerializer
    #permission_classes = [permissions.IsAuthenticated]

class CourseDetails(generics.RetrieveUpdateDestroyAPIView):
    queryset = models.Course.objects.all()
    serializer_class = CourseSerializer
    #permission_classes = [permissions.IsAuthenticated]

#Course Assignment
class CourseAssignmentList(generics.ListAPIView):
    serializer_class = AssignemtSerializer

    def get_queryset(self):
        course_id = self.kwargs['course_id']
        return models.Assignment.objects.filter(course_id=course_id).order_by('-uploaded_at')

#Lecturer Assignment
class AssignmentList(generics.ListCreateAPIView):
    
    queryset = models.Assignment.objects.all()
    serializer_class = AssignemtSerializer
    parser_classes = (MultiPartParser, FormParser)

    def create(self, request, *args, **kwargs):
        try:
            # Validate file size
            if request.FILES.get('file').size > 10 * 1024 * 1024:  # 10MB limit
                return Response(
                    {'message': 'File size should not exceed 10MB'},
                    status=status.HTTP_400_BAD_REQUEST
                )

            serializer = self.get_serializer(data=request.data)
            serializer.is_valid(raise_exception=True)
            self.perform_create(serializer)
            headers = self.get_success_headers(serializer.data)
            return Response(
                serializer.data,
                status=status.HTTP_201_CREATED,
                headers=headers
            )
        except Exception as e:
            return Response(
                {'message': str(e)},
                status=status.HTTP_400_BAD_REQUEST
            )



# specific Lecturer course
class LecturerCourseList(generics.ListAPIView):
    serializer_class = CourseSerializer
    #permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        lecturer_id=self.kwargs['lecturer_id']
        lecturer=models.Lecturer.objects.get(pk=lecturer_id)
        return models.Course.objects.filter(lecturer=lecturer)
    
#Similarity checker Assignments
@csrf_exempt
def upload_assignment(request):
    if request.method == 'POST':
        try:
            title = request.POST.get('title')
            file = request.FILES.get('file')
            
            if not title or not file:
                return JsonResponse({
                    'status': 'error',
                    'message': 'Both title and file are required'
                }, status=400)
            
            # Validate file extension
            allowed_extensions = ['txt', 'doc', 'docx', 'pdf']
            file_extension = file.name.split('.')[-1].lower()
            if file_extension not in allowed_extensions:
                return JsonResponse({
                    'status': 'error',
                    'message': f'Invalid file type. Allowed types: {", ".join(allowed_extensions)}'
                }, status=400)
            
            # Validate file size (10MB limit)
            if file.size > 10 * 1024 * 1024:
                return JsonResponse({
                    'status': 'error',
                    'message': 'File size should not exceed 10MB'
                }, status=400)
            
            assignment = St_Assignment.objects.create(title=title, file=file)
            
            return JsonResponse({
                'status': 'success',
                'assignment_id': assignment.id,
                'title': assignment.title,
                'file_url': assignment.file.url if assignment.file else None,
                'uploaded_at': assignment.uploaded_At.isoformat() if hasattr(assignment, 'uploaded_At') else None
            })
            
        except ValidationError as e:
            return JsonResponse({
                'status': 'error',
                'message': str(e)
            }, status=400)
        except Exception as e:
            return JsonResponse({
                'status': 'error',
                'message': f'An unexpected error occurred: {str(e)}'
            }, status=500)
            
    return JsonResponse({'status': 'error', 'message': 'Method not allowed'}, status=405)

@csrf_exempt
def compare_assignments(request):
    if request.method == 'POST':
        try:
            data = json.loads(request.body)
            assignment_ids = data.get('assignment_ids', [])
            
            if len(assignment_ids) < 2:
                return JsonResponse({
                    'status': 'error',
                    'message': 'Please select at least 2 assignments to compare'
                }, status=400)
            
            assignments = St_Assignment.objects.filter(id__in=assignment_ids)
            
            # Verify all assignments were found
            if len(assignments) != len(assignment_ids):
                return JsonResponse({
                    'status': 'error',
                    'message': 'One or more selected assignments not found'
                }, status=404)
            
            results = []
            
            # Compare each pair of assignments
            for i in range(len(assignments)):
                for j in range(i + 1, len(assignments)):
                    try:
                        similarity_result = calculate_similarity(
                            assignments[i].file.path,
                            assignments[j].file.path
                        )
                        
                        # Build result object with improved information
                        result = {
                            'assignment1_id': assignments[i].id,
                            'assignment1_title': assignments[i].title,
                            'assignment2_id': assignments[j].id,
                            'assignment2_title': assignments[j].title,
                            'similarity_score': similarity_result.get('similarity_score', 0),
                        }
                        
                        # Add report path if available
                        if similarity_result.get('report_path'):
                            report_filename = os.path.basename(similarity_result['report_path'])
                            result.update({
                                'report_url': f'/api/reports/{report_filename}',
                                'download_url': f'/api/download-report/{report_filename}',
                                'report_filename': report_filename
                            })
                        
                        # Add error if present
                        if 'error' in similarity_result:
                            result['error'] = similarity_result['error']
                            
                        results.append(result)
                    except Exception as e:
                        results.append({
                            'assignment1_id': assignments[i].id,
                            'assignment1_title': assignments[i].title,
                            'assignment2_id': assignments[j].id,
                            'assignment2_title': assignments[j].title,
                            'error': f'Failed to compare: {str(e)}',
                            'similarity_score': None
                        })
            
            return JsonResponse({
                'status': 'success',
                'results': results
            })
            
        except json.JSONDecodeError:
            return JsonResponse({
                'status': 'error',
                'message': 'Invalid JSON data'
            }, status=400)
        except Exception as e:
            return JsonResponse({
                'status': 'error',
                'message': f'Server error: {str(e)}'
            }, status=500)
            
    return JsonResponse({'status': 'error', 'message': 'Method not allowed'}, status=405)

def get_assignments(request):
    if request.method == 'GET':
        try:
            assignments = St_Assignment.objects.all().order_by('-uploaded_At')
            
            # Sort by date from newest to oldest
            assignments_data = []
            for assignment in assignments:
                assignment_data = {
                    'id': assignment.id,
                    'title': assignment.title,
                    'file_url': assignment.file.url if assignment.file else None,
                }
                
                # Add uploaded_at if available
                if hasattr(assignment, 'uploaded_At'):
                    assignment_data['uploaded_at'] = assignment.uploaded_At.isoformat()
                
                assignments_data.append(assignment_data)
            
            return JsonResponse({
                'status': 'success',
                'assignments': assignments_data
            })
        except Exception as e:
            return JsonResponse({
                'status': 'error',
                'message': f'Error retrieving assignments: {str(e)}'
            }, status=500)
            
    return JsonResponse({'status': 'error', 'message': 'Method not allowed'}, status=405)

def serve_report(request, filename):
    """Serve a similarity report PDF with improved error handling."""
    try:
        file_path = os.path.join(settings.SIMILARITY_REPORTS_DIR, filename)
        if os.path.exists(file_path) and os.path.isfile(file_path):
            return FileResponse(open(file_path, 'rb'), content_type='application/pdf')
        else:
            return HttpResponse('Report file not found', status=404)
    except Exception as e:
        return HttpResponse(f'Error serving report: {str(e)}', status=500)

def download_report(request, filename):
    """Download a similarity report PDF with improved handling."""
    try:
        file_path = os.path.join(settings.SIMILARITY_REPORTS_DIR, filename)
        if os.path.exists(file_path) and os.path.isfile(file_path):
            response = FileResponse(open(file_path, 'rb'), content_type='application/pdf')
            response['Content-Disposition'] = f'attachment; filename="{filename}"'
            return response
        else:
            return HttpResponse('Report file not found', status=404)
    except Exception as e:
        return HttpResponse(f'Error downloading report: {str(e)}', status=500)

# Add this new endpoint to list all available reports
def list_reports(request):
    """List all available similarity reports."""
    try:
        reports_dir = settings.SIMILARITY_REPORTS_DIR
        if not os.path.exists(reports_dir):
            return JsonResponse({
                'status': 'success',
                'reports': []
            })
            
        # Get all PDF files in the reports directory
        report_files = [f for f in os.listdir(reports_dir) if f.endswith('.pdf')]
        
        # Get file details
        reports = []
        for filename in report_files:
            file_path = os.path.join(reports_dir, filename)
            file_stats = os.stat(file_path)
            
            reports.append({
                'filename': filename,
                'size': file_stats.st_size,
                'created': file_stats.st_ctime,
                'view_url': f'/api/reports/{filename}',
                'download_url': f'/api/download-report/{filename}'
            })
            
        # Sort by creation time (newest first)
        reports.sort(key=lambda x: x['created'], reverse=True)
        
        return JsonResponse({
            'status': 'success',
            'reports': reports
        })
    except Exception as e:
        return JsonResponse({
            'status': 'error',
            'message': f'Error listing reports: {str(e)}'
        }, status=500)

# Add this new endpoint to delete a report
@csrf_exempt
def delete_report(request, filename):
    """Delete a specific similarity report."""
    if request.method != 'DELETE':
        return JsonResponse({
            'status': 'error',
            'message': 'Method not allowed'
        }, status=405)
        
    try:
        file_path = os.path.join(settings.SIMILARITY_REPORTS_DIR, filename)
        if not os.path.exists(file_path):
            return JsonResponse({
                'status': 'error',
                'message': 'Report not found'
            }, status=404)
            
        # Delete the file
        os.remove(file_path)
        
        return JsonResponse({
            'status': 'success',
            'message': f'Report {filename} deleted successfully'
        })
    except Exception as e:
        return JsonResponse({
            'status': 'error',
            'message': f'Error deleting report: {str(e)}'
        }, status=500)
    
@csrf_exempt
def check_web_similarity(request):
    """
    Check an assignment against web content for similarity using CrewAI agents.
    
    POST parameters:
    - assignment_id: ID of the assignment to check
    
    Returns:
    - JSON response with analysis results and report path
    """
    if request.method != 'POST':
        return JsonResponse({
            'status': 'error',
            'message': 'Only POST method is allowed'
        }, status=405)
    
    try:
        data = json.loads(request.body)
        assignment_id = data.get('assignment_id')
        
        if not assignment_id:
            return JsonResponse({
                'status': 'error',
                'message': 'Assignment ID is required'
            }, status=400)
        
        # Get the assignment
        try:
            assignment = St_Assignment.objects.get(id=assignment_id)
        except St_Assignment.DoesNotExist:
            return JsonResponse({
                'status': 'error',
                'message': f'Assignment with ID {assignment_id} not found'
            }, status=404)
        
        # Get assignment file path
        assignment_path = assignment.file.path
        
        # Define output directory for reports
        web_reports_dir = os.path.join(settings.SIMILARITY_REPORTS_DIR, 'web_reports')
        os.makedirs(web_reports_dir, exist_ok=True)
        
        logger.info(f"Starting web similarity analysis for assignment {assignment_id}")
        
        # Analyze web similarity using CrewAI
        result = analyze_assignment_web_similarity(assignment_path, web_reports_dir)
        
        if 'error' in result:
            logger.error(f"Web similarity analysis failed: {result['error']}")
            return JsonResponse({
                'status': 'error',
                'message': result['error']
            }, status=500)
        
        # Return success response
        report_filename = os.path.basename(result['report_path'])
        
        logger.info(f"Web similarity analysis completed for assignment {assignment_id}")
        
        return JsonResponse({
            'status': 'success',
            'assignment_id': assignment_id,
            'assignment_title': assignment.title,
            'web_similarity_score': result['web_similarity_score'],
            'analysis_summary': result['analysis_summary'],
            'report_url': f'/api/web-reports/{report_filename}',
            'download_url': f'/api/download-web-report/{report_filename}'
        })
        
    except Exception as e:
        logger.exception(f"Unexpected error in web similarity check: {str(e)}")
        return JsonResponse({
            'status': 'error',
            'message': f'An unexpected error occurred: {str(e)}'
        }, status=500)

def serve_web_report(request, filename):
    """Serve a web similarity report PDF."""
    web_reports_dir = os.path.join(settings.SIMILARITY_REPORTS_DIR, 'web_reports')
    file_path = os.path.join(web_reports_dir, filename)
    
    if os.path.exists(file_path) and os.path.isfile(file_path):
        return FileResponse(open(file_path, 'rb'), content_type='application/pdf')
    else:
        return HttpResponse('Report file not found', status=404)

def download_web_report(request, filename):
    """Download a web similarity report PDF."""
    web_reports_dir = os.path.join(settings.SIMILARITY_REPORTS_DIR, 'web_reports')
    file_path = os.path.join(web_reports_dir, filename)
    
    if os.path.exists(file_path) and os.path.isfile(file_path):
        response = FileResponse(open(file_path, 'rb'), content_type='application/pdf')
        response['Content-Disposition'] = f'attachment; filename="{filename}"'
        return response
    else:
        return HttpResponse('Report file not found', status=404)

def list_web_reports(request):
    """List all available web similarity reports."""
    try:
        web_reports_dir = os.path.join(settings.SIMILARITY_REPORTS_DIR, 'web_reports')
        os.makedirs(web_reports_dir, exist_ok=True)
        
        # Get all PDF files in the reports directory
        report_files = [f for f in os.listdir(web_reports_dir) if f.endswith('.pdf')]
        
        # Get file details
        reports = []
        for filename in report_files:
            file_path = os.path.join(web_reports_dir, filename)
            file_stats = os.stat(file_path)
            
            reports.append({
                'filename': filename,
                'size': file_stats.st_size,
                'created': file_stats.st_ctime,
                'view_url': f'/api/web-reports/{filename}',
                'download_url': f'/api/download-web-report/{filename}'
            })
            
        # Sort by creation time (newest first)
        reports.sort(key=lambda x: x['created'], reverse=True)
        
        return JsonResponse({
            'status': 'success',
            'reports': reports
        })
    except Exception as e:
        logger.exception(f"Error listing web reports: {str(e)}")
        return JsonResponse({
            'status': 'error',
            'message': f'Error listing web reports: {str(e)}'
        }, status=500)

@csrf_exempt
def delete_web_report(request, filename):
    """Delete a specific web similarity report."""
    if request.method != 'DELETE':
        return JsonResponse({
            'status': 'error',
            'message': 'Method not allowed'
        }, status=405)
        
    try:
        web_reports_dir = os.path.join(settings.SIMILARITY_REPORTS_DIR, 'web_reports')
        file_path = os.path.join(web_reports_dir, filename)
        
        if not os.path.exists(file_path):
            return JsonResponse({
                'status': 'error',
                'message': 'Report not found'
            }, status=404)
            
        # Delete the file
        os.remove(file_path)
        logger.info(f"Deleted web similarity report: {filename}")
        
        return JsonResponse({
            'status': 'success',
            'message': f'Report {filename} deleted successfully'
        })
    except Exception as e:
        logger.exception(f"Error deleting report: {str(e)}")
        return JsonResponse({
            'status': 'error',
            'message': f'Error deleting report: {str(e)}'
        }, status=500)

# Student class

class StudentList(generics.ListCreateAPIView):
    queryset = models.Student.objects.all()
    serializer_class = StudentSerializer
    

class StudentDetail(generics.RetrieveUpdateDestroyAPIView):
    queryset = models.Student.objects.all()
    serializer_class = StudentSerializer
    #permission_classes = [permissions.IsAuthenticated]
 

@csrf_exempt  
def  user_login(request):
    if request.method == 'POST':
        username = request.POST['username']
        password = request.POST['password']
        try:
            studentData = models.Student.objects.get(username=username, password=password)
            return JsonResponse({
                'bool': True,
                'student_id': studentData.id
            })
        except models.Student.DoesNotExist:
            return JsonResponse({'bool': False})
    return JsonResponse({'bool': False})

##class ChapterList(generics.ListCreateAPIView):
   # queryset = models.Chapter.objects.all()
    #serializer_class = ChapterSerializer
    #permission_classes = [permissions.IsAuthenticated]


class StudentCourseEnrollmentList(generics.ListCreateAPIView):
    queryset = models.StudentCourseEnrollment.objects.all()
    serializer_class = StudentCourseEnrollmentSerializer


class EnrolledStudentList(generics.ListAPIView):
    serializer_class = CourseSerializer
    
    def get_queryset(self):
        student_id = self.kwargs['student_id']
        student = models.Student.objects.get(pk=student_id)
        return models.Course.objects.filter(
            studentcourseenrollment__student=student
        ).distinct()       