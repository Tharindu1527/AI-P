from rest_framework import serializers #transform data to JSON
from . import models

class LecturerSerializer(serializers.ModelSerializer):
    class Meta:
        model = models.Lecturer
        fields = ["id","full_name","email","password","qualification","department","mobile_no","address"]
        
        
class CategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = models.CourseCategory
        fields = ["id","title","description"]

class CourseSerializer(serializers.ModelSerializer):
    class Meta:
        model = models.Course
        fields = ["id","category","lecturer","title","description","featured_img","techs"]

class AssignemtSerializer(serializers.ModelSerializer):
    class Meta:
        model = models.Assignment
        fields = ["id","course","file","uploaded_at"]
        
    
class StudentSerializer(serializers.ModelSerializer):
    class Meta:
        model = models.Student
        fields = ["id","full_name","email","username","password","department","interested_categories"]
        

#class ChapterSerializer(serializers.ModelSerializer):
 #   class Meta:
  #      model = models.Chapter
   #     fields = ["id","course","title","description","video"]

class StudentCourseEnrollmentSerializer(serializers.ModelSerializer):
    class Meta:
        model = models.StudentCourseEnrollment
        fields = ['id', 'student', 'course', 'enrolled_time']
        
        

