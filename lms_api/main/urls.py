from django.urls import path
from rest_framework.urlpatterns import format_suffix_patterns
from . import views
from django.conf import settings
from django.conf.urls.static import static
from django.conf import settings
from django.conf.urls.static import static
from django.urls import re_path
from django.views.static import serve

urlpatterns = [
    # Lecturer 
    path('lecturer/', views.LecturerList.as_view()),
    path('lecturer/<int:pk>/', views.LecturerDetail.as_view()),
    path('lecturer-login', views.lecturer_login),
    path('update-profile-image/', views.update_profile_image, name='update_profile_image'),
    path('remove-profile-image/', views.remove_profile_image, name='remove_profile_image'),
   
    # Category
    path('category/', views.CategoryList.as_view()),
    # Course
    path('course/', views.CourseList.as_view()),
    path('course/<int:pk>/', views.CourseDetail.as_view()),
    path('lecturer-courses/<int:lecturer_id>/', views.LecturerCourseList.as_view()),  
    
   # path('chapter/', views.ChapterList.as_view()),
    path('student-enroll-course/', views.StudentCourseEnrollmentList.as_view()),
    path('fetch-enrolled-courses/<int:student_id>', views.EnrolledStudentList.as_view()),
    path('course/<int:course_id>/enrollment-count/', views.CourseEnrollmentCount.as_view()),
    path('course/<int:course_id>/enrolled-students/', views.CourseEnrolledStudentList.as_view()),
    
   

   
    # Lecturer courses
    path('lecturer-course/<int:lecturer_id>', views.LecturerCourseList.as_view()),
    #Adding Assignment from lecturer
    path('add_assignment/',views.AssignmentList.as_view()),
    # Add this to your urlpatterns list
    path('course/<int:course_id>/assignments/', views.CourseAssignmentList.as_view()),
    path('course/<int:course_id>/assignment/<int:assignment_id>/', views.AssignmentList.as_view(), name='assignment-detail'),
    
    
    
    #Similarity Checker
    path('upload/', views.upload_assignment, name='upload_assignment'),
    path('compare/', views.compare_assignments, name='compare_assignments'),
    path('list/', views.get_assignments, name='get_assignments'),

    # Similarity reports
    path('reports/', views.list_reports, name='list_reports'),
    path('reports/<str:filename>', views.serve_report, name='serve_report'),
    path('download-report/<str:filename>', views.download_report, name='download_report'),
    path('delete-report/<str:filename>', views.delete_report, name='delete_report'),
    
    # Web Similarity
    path('web-similarity/', views.check_web_similarity, name='check_web_similarity'),
    path('web-reports/', views.list_web_reports, name='list_web_reports'),
    path('web-reports/<str:filename>', views.serve_web_report, name='serve_web_report'),
    path('download-web-report/<str:filename>', views.download_web_report, name='download_web_report'),
    path('delete-web-report/<str:filename>', views.delete_web_report, name='delete_web_report'),
    
    #Student
    path('student/', views.StudentList.as_view()),
    path('student/<int:pk>/', views.StudentDetail.as_view()),
    path('user-login', views.user_login),
    
    path('verify-enrollment/', views.VerifyEnrollmentKey.as_view(), name='verify-enrollment'),
]



# Add static file handling
urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)

# Add format suffix patterns
urlpatterns = format_suffix_patterns(urlpatterns)

