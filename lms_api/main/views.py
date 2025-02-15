from django.shortcuts import render
from rest_framework.views import APIView
from .serializers import LecturerSerializer,CategorySerializer,CourseSerializer,AssignemtSerializer,StudentSerializer,StudentCourseEnrollmentSerializer #ChapterSerializer
from rest_framework.response import Response
from rest_framework import generics
from rest_framework import permissions #if want to access to data must want cedentials
from . import models
from .models import St_Assignment
from django.core.exceptions import ValidationError
from .utils import calculate_similarity, extract_text_from_file
import json
from django.http import JsonResponse,HttpResponse,FileResponse
from django.views.decorators.csrf import csrf_exempt
from .serializers import LecturerSerializer
from rest_framework.parsers import MultiPartParser, FormParser
from rest_framework import status
from django.conf import settings
import os
from pathlib import Path


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
                'file_url': assignment.file.url if assignment.file else None
            })
            
        except ValidationError as e:
            return JsonResponse({
                'status': 'error',
                'message': str(e)
            }, status=400)
        except Exception as e:
            return JsonResponse({
                'status': 'error',
                'message': 'An unexpected error occurred'
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
                    'error': 'Please select at least 2 assignments'
                }, status=400)
            
            assignments = St_Assignment.objects.filter(id__in=assignment_ids)
            
            # Verify all assignments were found
            if len(assignments) != len(assignment_ids):
                return JsonResponse({
                    'status': 'error',
                    'message': 'One or more assignments not found'
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
                        
                        results.append({
                            'assignment1_id': assignments[i].id,
                            'assignment1_title': assignments[i].title,
                            'assignment2_id': assignments[j].id,
                            'assignment2_title': assignments[j].title,
                            'similarity_score': similarity_result['similarity_score'],
                            'report_url' : similarity_result['report_path']
                        })
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
                'message': str(e)
            }, status=500)
            
    return JsonResponse({'status': 'error', 'message': 'Method not allowed'}, status=405)

def get_assignments(request):
    if request.method == 'GET':
        try:
            assignments = St_Assignment.objects.all().order_by('-uploaded_at')
            return JsonResponse({
                'status': 'success',
                'assignments': [{
                    'id': assignment.id,
                    'title': assignment.title,
                    'file_url': assignment.file.url if assignment.file else None,
                    'uploaded_at': assignment.uploaded_at.isoformat()
                } for assignment in assignments]
            })
        except Exception as e:
            return JsonResponse({
                'status': 'error',
                'message': str(e)
            }, status=500)
            
    return JsonResponse({'status': 'error', 'message': 'Method not allowed'}, status=405)

def serve_report(request, filename):
    """Serve a similarity report PDF."""
    file_path = os.path.join(settings.SIMILARITY_REPORTS_DIR, filename)
    if os.path.exists(file_path):
        return FileResponse(open(file_path, 'rb'), content_type='application/pdf')
    return HttpResponse('Report not found', status=404)

def download_report(request, filename):
    """Download a similarity report PDF."""
    file_path = os.path.join(settings.SIMILARITY_REPORTS_DIR, filename)
    if os.path.exists(file_path):
        response = FileResponse(open(file_path, 'rb'), content_type='application/pdf')
        response['Content-Disposition'] = f'attachment; filename="{filename}"'
        return response
    return HttpResponse('Report not found', status=404)

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