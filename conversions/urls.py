"""
URL configuration for the conversions app.

Maps the root URL to the converter view, providing access to the Unit Conversion Suite
and Ordinance Library.
"""

from django.urls import path
from . import views

app_name = 'conversions'

urlpatterns = [
    path('', views.converter, name='converter'),
    path('upload-document/', views.upload_document, name='upload_document'),
    path('extract-deed-info/', views.extract_deed_info, name='extract_deed_info'),
]