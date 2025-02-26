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
    address = models.CharField(max_length=255, blank=True)
    legal_description = models.TextField(blank=True)
    deed_book = models.CharField(max_length=50, blank=True)
    deed_page = models.CharField(max_length=50, blank=True)
    map_book = models.CharField(max_length=50, blank=True)
    map_page = models.CharField(max_length=50, blank=True)
    subdivision = models.CharField(max_length=255, blank=True)
    lot_number = models.CharField(max_length=50, blank=True)
    section = models.CharField(max_length=50, blank=True)
    township = models.CharField(max_length=50, blank=True)
    range = models.CharField(max_length=50, blank=True)
    acreage = models.FloatField(null=True, blank=True)