from django.contrib import admin
from . import models

#register all models inside the admin pannel

admin.site.register(models.Lecturer)
admin.site.register(models.CourseCategory)
admin.site.register(models.Course)
#admin.site.register(models.Chapter)
admin.site.register(models.Student)
admin.site.register(models.Assignment)
admin.site.register(models.St_Assignment)
#admin.site.register(models.AssignmentSubmission)

