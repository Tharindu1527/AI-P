# Generated by Django 4.2.16 on 2025-01-06 02:50

import django.core.validators
from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        ('main', '0010_alter_assignment_options_assignment_description_and_more'),
    ]

    operations = [
        migrations.AlterModelOptions(
            name='assignment',
            options={'verbose_name_plural': '4 . Assignments'},
        ),
        migrations.AlterModelOptions(
            name='studentcourseenrollment',
            options={'verbose_name_plural': '9. Enrolled Courses'},
        ),
        migrations.RemoveField(
            model_name='assignment',
            name='description',
        ),
        migrations.RemoveField(
            model_name='assignment',
            name='title',
        ),
        migrations.AlterField(
            model_name='assignment',
            name='course',
            field=models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='assignment', to='main.course'),
        ),
        migrations.AlterField(
            model_name='assignment',
            name='file',
            field=models.FileField(upload_to='course_assignment/', validators=[django.core.validators.FileExtensionValidator(allowed_extensions=['txt', 'doc', 'docx', 'pdf'])]),
        ),
        migrations.AlterField(
            model_name='course',
            name='title',
            field=models.CharField(max_length=150),
        ),
    ]