# Generated by Django 3.0.2 on 2020-01-12 07:45

from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ('depreciable_assets', '0001_initial'),
    ]

    operations = [
        migrations.DeleteModel(
            name='DevaluedRate',
        ),
    ]