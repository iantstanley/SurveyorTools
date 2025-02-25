from django.db import models

class Document(models.Model):
    file = models.FileField(upload_to='documents/')
    processed_text = models.TextField(blank=True)
    upload_date = models.DateTimeField(auto_now_add=True)

class DeedInformation(models.Model):
    document = models.ForeignKey(Document, on_delete=models.CASCADE)
    date = models.DateField(null=True, blank=True)
    grantor = models.CharField(max_length=255, blank=True)
    grantee = models.CharField(max_length=255, blank=True)
    parcel_number = models.CharField(max_length=100, blank=True)
    acreage = models.FloatField(null=True, blank=True)
    address = models.CharField(max_length=255, blank=True)
    description = models.TextField(blank=True)
    easements = models.TextField(blank=True)
    references = models.TextField(blank=True)