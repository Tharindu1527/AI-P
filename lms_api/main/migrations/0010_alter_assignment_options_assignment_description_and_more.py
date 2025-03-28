# Generated by Django 4.2.16 on 2025-01-06 02:27

import django.core.validators
from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        ('main', '0009_studentcourseenrollment_delete_chapter'),
    ]

    operations = [
        migrations.AlterModelOptions(
            name='assignment',
            options={'ordering': ['-uploaded_at'], 'verbose_name_plural': '4. Assignments'},
        ),
        migrations.AddField(
            model_name='assignment',
            name='description',
            field=models.TextField(blank=True, null=True),
        ),
        migrations.AddField(
            model_name='assignment',
            name='title',
            field=models.CharField(default='Untitled Assignment', max_length=150),
        ),
        migrations.AlterField(
            model_name='assignment',
            name='course',
            field=models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='assignments', to='main.course'),
        ),
        migrations.AlterField(
            model_name='assignment',
            name='file',
            field=models.FileField(upload_to='course_assignments/', validators=[django.core.validators.FileExtensionValidator(allowed_extensions=['pdf', 'doc', 'docx', 'txt'])]),
        ),
        migrations.AlterField(
            model_name='course',
            name='title',
            field=models.CharField(max_length=255),
        ),
    ]
