# Generated by Django 4.2.16 on 2025-03-21 17:23

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('main', '0020_assignment_title'),
    ]

    operations = [
        migrations.AddField(
            model_name='course',
            name='requires_enrollment_key',
            field=models.BooleanField(default=True),
        ),
        migrations.AlterField(
            model_name='course',
            name='enrollment_key',
            field=models.CharField(blank=True, default='', max_length=20),
        ),
    ]
