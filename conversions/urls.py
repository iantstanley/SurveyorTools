from django.urls import path
from . import views

app_name = 'conversions'

urlpatterns = [
    path('', views.converter, name='converter'),
    path('upload-document/', views.upload_document, name='upload_document'),
    path('extract-deed-info/', views.extract_deed_info, name='extract_deed_info'),
    path('classify-building-model/', views.classify_building_model, name='classify_building_model'),
]