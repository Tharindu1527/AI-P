from django.db import models #this is create database structure
from django.core.validators import FileExtensionValidator

# Lecturer Model
class Lecturer(models.Model):
    full_name = models.CharField(max_length=100) #if don't use max_length we can't access charfields
    email = models.CharField(max_length=100)
    password = models.CharField(max_length=100)
    qualification = models.CharField(max_length=200)
    department = models.CharField(max_length=100)
    mobile_no = models.CharField(max_length=20)
    address = models.TextField()

    class Meta :  #this use for change our models names (Sort using Alphebatic order)
        verbose_name_plural = "1 . Lecturer"

#Course Category Model
class CourseCategory(models.Model):
    title = models.CharField(max_length=150) #if don't use max_length we can't access charfields
    description = models.TextField()

    class Meta :
        verbose_name_plural = "2 . Course Categories"
    
    def __str__(self):
        return self.title

#Course Model
class Course(models.Model):
    category = models.ForeignKey(CourseCategory, on_delete = models.CASCADE) #when delete course category then autonimously delete course
    lecturer = models.ForeignKey(Lecturer, on_delete=models.CASCADE)
    title = models.CharField(max_length=150) #if don't use max_length we can't access charfields
    description = models.TextField()
    featured_img=models.ImageField(upload_to="course_imgs/",null=True)
    techs = models.TextField(null=True)
    

    class Meta :
        verbose_name_plural = "3 . Course"
#Lecturer Assignment
class Assignment(models.Model):
    course = models.ForeignKey(Course, on_delete=models.CASCADE,related_name = 'assignment')#create relasionship with courses
    file = models.FileField(upload_to='course_assignment/',
                            validators = [FileExtensionValidator(allowed_extensions=['txt', 'doc', 'docx', 'pdf'])])
    uploaded_at = models.DateTimeField(auto_now_add=True) 

    class Meta :
        verbose_name_plural = "4 . Assignments"
    
    def __str__(self):
        return f"Assignment for {self.course.title}"

#Similarity Checker Assignment
class St_Assignment(models.Model):
    title = models.CharField(max_length=200)
    file = models.FileField(upload_to = 'student_assignment/',
                            validators = [FileExtensionValidator(allowed_extensions=['txt', 'doc', 'docx', 'pdf'])])
    uploaded_At = models.DateTimeField(auto_now_add=True)#only can add auto_now_add to datetime fields

    class Meta :
        verbose_name_plural = "5 .Similarity Checker Assignments"

    def __str__(self):
        return self.title


# Student Model
class Student(models.Model):
    full_name = models.CharField(max_length=100) #if don't use max_length we can't access charfields
    email = models.CharField(max_length=100)
    username= models.CharField(max_length=100,default='default_username')
    password = models.CharField(max_length=100)
    department = models.CharField(max_length=100)
    interested_categories = models.TextField()

    class Meta :
        verbose_name_plural = "6 . Student"

#class Chapter(models.Model):
     #  course = models.ForeignKey(Course, on_delete = models.CASCADE) #when delete course category then autonimously delete course
    #title = models.CharField(max_length=150) #if don't use max_length we can't access charfields
    #description = models.TextField()
    ##video=models.FileField(upload_to="chapter_videos/",null=True)
    
    

    #class Meta :
     #   verbose_name_plural = "7 . Chapter"
    
class StudentCourseEnrollment(models.Model):
    student = models.ForeignKey(Student, on_delete=models.CASCADE)
    course = models.ForeignKey(Course, on_delete=models.CASCADE)
    enrolled_time = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        verbose_name_plural = "8. Enrolled Courses"
        unique_together = ('student', 'course')  
        
        

