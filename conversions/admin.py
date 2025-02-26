from django.contrib import admin
from .models import Document, DeedInformation

@admin.register(Document)
class DocumentAdmin(admin.ModelAdmin):
    list_display = ('id', 'file', 'upload_date')
    search_fields = ('processed_text',)
    readonly_fields = ('processed_text',)

@admin.register(DeedInformation)
class DeedInformationAdmin(admin.ModelAdmin):
    list_display = ('document', 'date', 'grantor', 'grantee', 'parcel_number')
    search_fields = ('grantor', 'grantee', 'parcel_number', 'description')
    list_filter = ('date',)