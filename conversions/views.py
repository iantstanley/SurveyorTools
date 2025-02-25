from django.shortcuts import render
from django.http import JsonResponse
from .forms import DocumentForm
from .models import Document, DeedInformation
import pdf2image
import pytesseract
from dateutil import parser as date_parser
import re

pytesseract.pytesseract.tesseract_cmd = r'C:\Program Files\Tesseract-OCR\tesseract.exe'

def converter(request):
    """
    Render the converter.html template for the Unit Conversion Suite and Ordinance Library.

    This view serves as the main entry point for the conversions app, displaying tools for
    unit conversions and an ordinance library within a tabbed interface. All calculations
    and interactions are handled client-side via JavaScript.

    Args:
        request: The HTTP request object.

    Returns:
        HttpResponse: The rendered 'conversions/converter.html' template.
    """
    return render(request, 'conversions/converter.html')

def upload_document(request):
    """
    Handle upload and processing of a single PDF for document deciphering.

    If the request is POST, process the uploaded PDF using OCR and return the extracted text.
    """
    if request.method == 'POST':
        form = DocumentForm(request.POST, request.FILES)
        if form.is_valid():
            document = form.save()
            # Process the document
            images = pdf2image.convert_from_path(document.file.path)
            text = ''
            for image in images:
                text += pytesseract.image_to_string(image)
            document.processed_text = text
            document.save()
            return JsonResponse({'text': text})
        else:
            return JsonResponse({'error': 'Invalid form'}, status=400)
    else:
        return JsonResponse({'error': 'Invalid request method'}, status=405)

def extract_deed_info(request):
    """
    Handle upload and processing of multiple PDFs for deed information extraction.

    If the request is POST, process each uploaded PDF, extract deed information, and return results.
    """
    if request.method == 'POST':
        files = request.FILES.getlist('files')
        results = []
        for file in files:
            document = Document(file=file)
            document.save()
            # Process the document
            images = pdf2image.convert_from_path(document.file.path)
            text = ''
            for image in images:
                text += pytesseract.image_to_string(image)
            document.processed_text = text
            document.save()
            # Extract information
            deed_info = DeedInformation(document=document)
            # Simple extraction examples
            # Date: find first date in text (format: MM/DD/YYYY)
            dates = re.findall(r'\b\d{1,2}/\d{1,2}/\d{4}\b', text)
            if dates:
                deed_info.date = date_parser.parse(dates[0]).date()
            # Grantor: look for "from [name] to"
            grantor_match = re.search(r'from (.+?) to', text, re.IGNORECASE)
            if grantor_match:
                deed_info.grantor = grantor_match.group(1)
            # Grantee: look for "to [name]"
            grantee_match = re.search(r'to (.+?)(?=\.|,|\n|$)', text, re.IGNORECASE)
            if grantee_match:
                deed_info.grantee = grantee_match.group(1)
            # Parcel number: look for "Parcel ID:" or similar
            parcel_match = re.search(r'Parcel ID:?\s*(\S+)', text, re.IGNORECASE)
            if parcel_match:
                deed_info.parcel_number = parcel_match.group(1)
            # Save the extracted information
            deed_info.save()
            results.append({
                'id': deed_info.id,
                'date': str(deed_info.date) if deed_info.date else '',
                'grantor': deed_info.grantor,
                'grantee': deed_info.grantee,
                'parcel_number': deed_info.parcel_number,
                # Add other fields as needed
            })
        return JsonResponse({'results': results})
    else:
        return JsonResponse({'error': 'Invalid request method'}, status=405)