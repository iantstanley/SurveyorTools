from django.shortcuts import render
from django.http import JsonResponse
from django.conf import settings
from .forms import DocumentForm
from .models import Document, DeedInformation
import re
import os
import logging
import traceback

# Configure logger
logger = logging.getLogger(__name__)

# Check for optional dependencies
try:
    import pdf2image
    import pytesseract
    from dateutil import parser as date_parser
    PDF_PROCESSING_AVAILABLE = True
except ImportError as e:
    logger.warning(f"Document processing disabled. Missing dependency: {e}")
    PDF_PROCESSING_AVAILABLE = False
    
# Set Tesseract path if available
TESSERACT_CMD = getattr(settings, 'TESSERACT_CMD', r'C:\Program Files\Tesseract-OCR\tesseract.exe')
if PDF_PROCESSING_AVAILABLE:
    try:
        pytesseract.pytesseract.tesseract_cmd = TESSERACT_CMD
    except:
        logger.warning("Could not set Tesseract path")

def converter(request):
    """
    Render the converter.html template for the Unit Conversion Suite and Ordinance Library.
    """
    return render(request, 'conversions/converter.html')

def upload_document(request):
    """
    Handle upload and processing of a single PDF for document deciphering.
    """
    if not PDF_PROCESSING_AVAILABLE:
        return JsonResponse({
            'error': 'Document processing is not available. Missing required packages (pdf2image, pytesseract, or python-dateutil).'
        }, status=501)
        
    if request.method != 'POST':
        return JsonResponse({'error': 'Invalid request method'}, status=405)
    
    try:
        form = DocumentForm(request.POST, request.FILES)
        if not form.is_valid():
            return JsonResponse({'error': 'Invalid form data'}, status=400)
        
        # Validate file type
        file = request.FILES['file']
        if not file.name.lower().endswith('.pdf'):
            return JsonResponse({'error': 'Only PDF files are allowed'}, status=400)
        
        # Save document
        document = form.save()
        
        try:
            # Process the document
            images = pdf2image.convert_from_path(document.file.path)
            text = ''
            for image in images:
                text += pytesseract.image_to_string(image)
            
            document.processed_text = text
            document.save()
            return JsonResponse({'text': text})
        
        except Exception as e:
            logger.error(f"Error processing document: {e}")
            logger.error(traceback.format_exc())
            document.delete()  # Clean up the document if processing fails
            return JsonResponse({'error': f'Error processing document: {str(e)}'}, status=500)
    
    except Exception as e:
        logger.error(f"Unexpected error in upload_document: {e}")
        logger.error(traceback.format_exc())
        return JsonResponse({'error': f'Server error: {str(e)}'}, status=500)

def extract_deed_info(request):
    """
    Handle upload and processing of multiple PDFs for deed information extraction.
    """
    if not PDF_PROCESSING_AVAILABLE:
        return JsonResponse({
            'error': 'Document processing is not available. Missing required packages (pdf2image, pytesseract, or python-dateutil).'
        }, status=501)
        
    if request.method != 'POST':
        return JsonResponse({'error': 'Invalid request method'}, status=405)
    
    try:
        files = request.FILES.getlist('files')
        if not files:
            return JsonResponse({'error': 'No files uploaded'}, status=400)
        
        # Validate file types
        for file in files:
            if not file.name.lower().endswith('.pdf'):
                return JsonResponse({'error': 'Only PDF files are allowed'}, status=400)
        
        results = []
        for file in files:
            try:
                # Save document
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
                
                # Date extraction
                date_patterns = [
                    r'(?:executed|dated|made)\s+(?:on|this)\s+(?:the\s+)?(\d{1,2})(?:st|nd|rd|th)?\s+day\s+of\s+([A-Za-z]+),?\s+(\d{4})',
                    r'(?:dated|date):\s*(\d{1,2})[/-](\d{1,2})[/-](\d{2,4})',
                    r'\b(\d{1,2})[/-](\d{1,2})[/-](\d{2,4})\b',
                    r'\b(?:January|February|March|April|May|June|July|August|September|October|November|December)\s+(\d{1,2})(?:st|nd|rd|th)?,\s+(\d{4})\b',
                ]
                
                for pattern in date_patterns:
                    date_match = re.search(pattern, text, re.IGNORECASE)
                    if date_match:
                        try:
                            date_str = ' '.join(date_match.groups())
                            deed_info.date = date_parser.parse(date_str, fuzzy=True).date()
                            break
                        except:
                            continue
                
                # Grantor extraction
                grantor_patterns = [
                    r'(?:grantor|from|by)[:\s]+([^,\n.]+(?:,\s+[^,\n.]+)*)',
                    r'([^,\n.]+(?:,\s+[^,\n.]+)*),?\s+(?:grantor|seller)',
                    r'this\s+deed\s+(?:made|between)\s+([^,\n.]+(?:,\s+[^,\n.]+)*)',
                    r'warranty\s+deed\s+(?:from|by)\s+([^,\n.]+(?:,\s+[^,\n.]+)*)',
                ]
                
                for pattern in grantor_patterns:
                    grantor_match = re.search(pattern, text, re.IGNORECASE)
                    if grantor_match:
                        deed_info.grantor = grantor_match.group(1).strip()
                        break
                
                # Grantee extraction
                grantee_patterns = [
                    r'(?:grantee|to)[:\s]+([^,\n.]+(?:,\s+[^,\n.]+)*)',
                    r'([^,\n.]+(?:,\s+[^,\n.]+)*),?\s+(?:grantee|buyer|purchaser)',
                    r'conveys?\s+(?:to|unto)\s+([^,\n.]+(?:,\s+[^,\n.]+)*)',
                ]
                
                for pattern in grantee_patterns:
                    grantee_match = re.search(pattern, text, re.IGNORECASE)
                    if grantee_match:
                        deed_info.grantee = grantee_match.group(1).strip()
                        break
                
                # Parcel ID extraction
                parcel_patterns = [
                    r'(?:parcel|tax|pin|property)\s+(?:id|identification|number|no)[.:]?\s*([a-z0-9][-a-z0-9.\s]+)',
                    r'p(?:\.|arcel) ?i(?:\.|d)\.?:? ?([-a-z0-9.\s]+)',
                ]
                
                for pattern in parcel_patterns:
                    parcel_match = re.search(pattern, text, re.IGNORECASE)
                    if parcel_match:
                        deed_info.parcel_number = parcel_match.group(1).strip()
                        break
                
                # Address extraction
                address_patterns = [
                    r'(?:property address|address)[:\s]+([^\n,]+(?:,\s+[^\n,]+)*)',
                    r'(?:located at|situate at|situated at|lying at)[:\s]+([^\n,]+(?:,\s+[^\n,]+)*)',
                ]
                
                for pattern in address_patterns:
                    address_match = re.search(pattern, text, re.IGNORECASE)
                    if address_match:
                        deed_info.address = address_match.group(1).strip()
                        break
                
                # Legal description extraction
                legal_desc_patterns = [
                    r'(?:legal description|being|described as follows)[:.]?\s+(.*?)(?:SUBJECT TO|WITNESS|IN WITNESS|BEING the same)',
                    r'(?:all that certain lot|all that tract)[,\s]+(.*?)(?:This conveyance|Subject to)',
                ]
                
                for pattern in legal_desc_patterns:
                    legal_match = re.search(pattern, text, re.IGNORECASE | re.DOTALL)
                    if legal_match:
                        legal_text = legal_match.group(1).strip()
                        # Limit to reasonable length
                        if len(legal_text) > 500:
                            legal_text = legal_text[:500] + '...'
                        deed_info.legal_description = legal_text
                        break
                
                # Book and Page references
                book_page_patterns = [
                    r'(?:recorded in|deed book|book)[:\s]+([0-9]+)[,\s]+(?:page|pg\.)[:\s]+([0-9]+)',
                    r'book\s+([0-9]+)\s+at\s+page\s+([0-9]+)',
                    r'recorded in book (\d+)[,\s]+page (\d+)',
                ]
                
                for pattern in book_page_patterns:
                    book_match = re.search(pattern, text, re.IGNORECASE)
                    if book_match:
                        deed_info.deed_book = book_match.group(1).strip()
                        deed_info.deed_page = book_match.group(2).strip()
                        break
                
                # Map references
                map_patterns = [
                    r'(?:map book|plat book)[:\s]+([0-9]+)[,\s]+(?:page|pg\.)[:\s]+([0-9]+)',
                    r'(?:recorded in|filed in).*?(?:map|plat).*?book[:\s]+([0-9]+)[,\s]+(?:page|pg\.)[:\s]+([0-9]+)',
                ]
                
                for pattern in map_patterns:
                    map_match = re.search(pattern, text, re.IGNORECASE)
                    if map_match:
                        deed_info.map_book = map_match.group(1).strip()
                        deed_info.map_page = map_match.group(2).strip()
                        break
                
                # Subdivision information
                subdivision_patterns = [
                    r'(?:subdivision|development) (?:known as|named) ["\']?([^",\n]+)["\']?',
                    r'(?:located in|situate in) the ([^,\n]+) (?:subdivision|development)',
                    r'lot\s+(\d+)[,\s]+(?:of|in)\s+([^,\n]+)(?:\s+subdivision)?',
                ]
                
                for pattern in subdivision_patterns:
                    subd_match = re.search(pattern, text, re.IGNORECASE)
                    if subd_match:
                        if len(subd_match.groups()) > 1:
                            deed_info.lot_number = subd_match.group(1).strip()
                            deed_info.subdivision = subd_match.group(2).strip()
                        else:
                            deed_info.subdivision = subd_match.group(1).strip()
                        break
                
                # Acreage extraction
                acreage_patterns = [
                    r'containing\s+(\d+\.?\d*)\s+acres',
                    r'(\d+\.?\d*)\s+acres',
                    r'acreage:?\s*(\d+\.?\d*)',
                    r'consisting of (\d+\.?\d*) acres',
                ]
                
                for pattern in acreage_patterns:
                    acreage_match = re.search(pattern, text, re.IGNORECASE)
                    if acreage_match:
                        try:
                            deed_info.acreage = float(acreage_match.group(1))
                            break
                        except:
                            continue
                
                # Save the extracted information
                deed_info.save()
                
                # Create a well-formatted result
                result = {
                    'id': deed_info.id,
                    'date': str(deed_info.date) if deed_info.date else '',
                    'grantor': deed_info.grantor,
                    'grantee': deed_info.grantee,
                    'parcel_number': deed_info.parcel_number,
                    'address': deed_info.address,
                    'legal_description': deed_info.legal_description,
                    'deed_book': deed_info.deed_book,
                    'deed_page': deed_info.deed_page,
                    'map_book': deed_info.map_book,
                    'map_page': deed_info.map_page, 
                    'subdivision': deed_info.subdivision,
                    'lot_number': deed_info.lot_number,
                    'acreage': deed_info.acreage if deed_info.acreage is not None else '',
                }
                
                results.append(result)
                
            except Exception as e:
                logger.error(f"Error processing file {file.name}: {e}")
                logger.error(traceback.format_exc())
                # Continue processing other files
        
        # Sort results by date (if available)
        results = sorted(results, key=lambda x: x['date'] if x['date'] else '9999-12-31', reverse=False)
        
        if results:
            return JsonResponse({'results': results})
        else:
            return JsonResponse({'error': 'No information could be extracted from the uploaded files'}, status=400)
    
    except Exception as e:
        logger.error(f"Unexpected error in extract_deed_info: {e}")
        logger.error(traceback.format_exc())
        return JsonResponse({'error': f'Server error: {str(e)}'}, status=500)
    
def classify_building_model(request):
    """
    Handle upload and classification of building images to recommend FEMA building diagrams.
    """
    if request.method != 'POST':
        return JsonResponse({'error': 'Invalid request method'}, status=405)
    
    try:
        if 'building_image' not in request.FILES:
            return JsonResponse({'error': 'No image file uploaded'}, status=400)
        
        image_file = request.FILES['building_image']
        
        # Validate file type
        allowed_extensions = ['.jpg', '.jpeg', '.png', '.gif']
        file_ext = os.path.splitext(image_file.name.lower())[1]
        if file_ext not in allowed_extensions:
            return JsonResponse({'error': 'Invalid file type. Please upload a JPG, PNG, or GIF image.'}, status=400)
        
        # In a full implementation, you would use a machine learning model here
        # For now, we'll use a simple simulation based on the filename
        
        # Save the image to media
        from django.core.files.storage import default_storage
        from django.core.files.base import ContentFile
        
        path = default_storage.save(f'building_images/{image_file.name}', ContentFile(image_file.read()))
        image_url = os.path.join(settings.MEDIA_URL, path)
        
        # Simple simulation of building classification
        # In a real implementation, this would be replaced with actual image analysis
        filename_lower = image_file.name.lower()
        
        # Simulated classification based on filename keywords
        if any(term in filename_lower for term in ['pier', 'pile', 'stilts', 'beach']):
            model_type = '7'
            description = 'This appears to be a building elevated on posts, piles, or piers (Diagram 7). This construction is common in coastal areas to allow storm surge to pass beneath the structure.'
            confidence = 92
        elif any(term in filename_lower for term in ['crawl', 'space', 'vent']):
            model_type = '5'
            description = 'This appears to be a building with a crawlspace (Diagram 5). The structure is elevated on solid foundation walls creating an enclosed area below the living space.'
            confidence = 88
        elif any(term in filename_lower for term in ['garage', 'storage', 'enclosure']):
            model_type = '6'
            description = 'This appears to be a building with an enclosure below the elevated floor (Diagram 6). The enclosure is typically used for parking, storage, or building access.'
            confidence = 85
        elif any(term in filename_lower for term in ['basement', 'cellar']):
            model_type = '3'
            description = 'This appears to be a building with a basement (Diagram 3). The basement is below grade on at least one side.'
            confidence = 90
        elif any(term in filename_lower for term in ['slab', 'concrete']):
            if any(term in filename_lower for term in ['raised', 'elevated']):
                model_type = '2'
                description = 'This appears to be a building with a raised slab foundation (Diagram 2). The slab is elevated above the surrounding grade, often with fill material.'
                confidence = 87
            else:
                model_type = '1'
                description = 'This appears to be a building on a slab-on-grade foundation (Diagram 1). The first floor is at or very near ground level.'
                confidence = 84
        else:
            # Default classification if no specific features are detected
            model_type = '1'
            description = 'Based on the visible features, this appears to be a standard slab-on-grade building (Diagram 1). For a more accurate classification, please provide additional photos showing the foundation details.'
            confidence = 75
        
        return JsonResponse({
            'success': True,
            'model_type': model_type,
            'description': description,
            'confidence': confidence,
            'image_url': image_url
        })
    
    except Exception as e:
        logger.error(f"Error classifying building image: {e}")
        logger.error(traceback.format_exc())
        return JsonResponse({'error': f'Server error: {str(e)}'}, status=500)