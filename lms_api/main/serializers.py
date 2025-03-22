from rest_framework import serializers #transform data to JSON
from . import models
import os

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
        fields = ["id", "category", "lecturer", "title", "description", "featured_img", "techs", "enrollment_key"]

class CourseDetailSerializer(serializers.ModelSerializer):
    is_enrolled = serializers.SerializerMethodField()
    
    class Meta:
        model = models.Course
        fields = ["id", "category", "lecturer", "title", "description", "featured_img", "techs","enrollment_key" ,"is_enrolled"]
    
    def get_is_enrolled(self, obj):
        student_id = self.context.get('student_id')
        if student_id:
            return models.StudentCourseEnrollment.objects.filter(
                student_id=student_id,
                course=obj
            ).exists()
        return False
    # In your Django view or serializer

class EnrollmentVerificationSerializer(serializers.Serializer):
    course_id = serializers.IntegerField()
    student_id = serializers.IntegerField()
    enrollment_key = serializers.CharField()

class StudentCourseEnrollmentSerializer(serializers.ModelSerializer):
    class Meta:
        model = models.StudentCourseEnrollment
        fields = ['id', 'student', 'course', 'enrolled_time']

    def validate(self, data):
        # Check if enrollment already exists
        if models.StudentCourseEnrollment.objects.filter(
            student=data['student'],
            course=data['course']
        ).exists():
            raise serializers.ValidationError("Student is already enrolled in this course")
        return data

class AssignemtSerializer(serializers.ModelSerializer):
    class Meta:
        model = models.Assignment
        fields = ["id","course","title","file","uploaded_at"]
    
    def get_file(self, obj):
        
        return obj.file.url if obj.file else None

    
class StudentSerializer(serializers.ModelSerializer):
    class Meta:
        model = models.Student
        fields = ["id","full_name","email","username","password","department","interested_categories"]
        

#class ChapterSerializer(serializers.ModelSerializer):
 #   class Meta:
  #      model = models.Chapter
   #     fields = ["id","course","title","description","video"]


        
