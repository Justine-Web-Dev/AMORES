import re
import os
import requests
import tempfile
import pytesseract
from PIL import Image
from django.db import transaction
from django.utils import timezone
from .models import Application, AuditLog, ApplicantDocument

# Set tesseract path for Windows
pytesseract.pytesseract.tesseract_cmd = r'C:\Program Files\Tesseract-OCR\tesseract.exe'

def parse_height_cm(height_str):
    if not height_str:
        return 0
    match = re.search(r'(\d+(?:\.\d+)?)', str(height_str))
    if match:
        val = float(match.group(1))
        if val < 3.0:
            val *= 100
        return val
    return 0

def has_baccalaureate(program_str):
    if not program_str:
        return False
    program_str = program_str.lower()
    keywords = ['bachelor', 'bs', 'ba', 'ab', 'degree', 'b.s.', 'b.a.', 'baccalaureate']
    return any(kw in program_str.split() for kw in keywords) or 'bachelor' in program_str

def process_document_with_ocr(document_id):
    """
    Downloads document file, extracts text via Tesseract, updates ocr_text,
    sets ai_verified=True if extracted text length > 10, and sets ai_remarks.
    Includes defensive error handling for UnboundLocalError and missing documents.
    """
    document = None
    try:
        document = ApplicantDocument.objects.filter(id=document_id).first()
        if not document or not document.file:
            return False

        file_url = document.file.url
        if not file_url.startswith('http'):
            # Fallback for local
            pass
            
        if not file_url.endswith(('.jpg', '.jpeg', '.png')):
            if not file_url.endswith('/'):
                file_url += '.jpg'
            
        response = requests.get(file_url)
        response.raise_for_status()
            
        fd, temp_path = tempfile.mkstemp(suffix=".jpg")
        with os.fdopen(fd, 'wb') as f:
            f.write(response.content)
            
        try:
            img = Image.open(temp_path)
            extracted_text = pytesseract.image_to_string(img)
            
            document.ocr_text = extracted_text.strip()
            if len(document.ocr_text) > 10:
                document.ai_verified = True
                document.ai_remarks = "OCR verification successful."
            else:
                document.ai_verified = False
                document.ai_remarks = "OCR returned insufficient text for verification."
                
            document.save()
            return True
            
        finally:
            if os.path.exists(temp_path):
                os.remove(temp_path)
                
    except Exception as e:
        print(f"Failed to process OCR for document {document_id}: {e}")
        if document:
            document.ai_verified = False
            document.ai_remarks = f"OCR Error: {str(e)}"
            document.save()
        return False

def evaluate_initial_application_status(application, payload_data, performer_user=None):
    """
    Evaluates the application based on:
    - Age (21-30)
    - Education (Baccalaureate)
    - Height (>=157cm Male, >=152cm Female)
    - Payload flags (citizenship, physical, character)
    """
    applicant = application.applicant
    failures = []

    # 1. Age
    age = applicant.age
    if age is None or not (21 <= age <= 30):
        failures.append(f"Age {age} does not meet 21-30 requirement.")

    # 2. Education
    if not has_baccalaureate(applicant.program):
        failures.append(f"Program '{applicant.program}' does not meet Baccalaureate requirement.")

    # 3. Height
    height_cm = parse_height_cm(applicant.height)
    gender = applicant.gender.lower() if applicant.gender else ''
    if gender == 'male' and height_cm < 157:
        failures.append("Height does not meet the general qualification.")
    elif gender == 'female' and height_cm < 152:
        failures.append("Height does not meet the general qualification.")
    elif gender not in ['male', 'female']:
        if height_cm < 152:
             failures.append("Height does not meet the general qualification.")

    # 4. Payload flags
    citizenship = str(payload_data.get('citizenship_status', '')).lower()
    if citizenship not in ['natural_born', 'true', '1', 't', 'y', 'yes']:
        failures.append("Citizenship is not Natural born Filipino.")

    is_approved = len(failures) == 0
    remarks = "Initial screening passed." if is_approved else "Initial screening failed: " + "; ".join(failures)
    
    previous_status = application.status
    new_status = 'New Applicant'

    with transaction.atomic():
        application.status = new_status
        if not is_approved:
            application.evaluation_remarks = remarks
            application.rejection_reason = remarks
        else:
            application.evaluation_remarks = remarks
        application.save()

        # Audit Log
        AuditLog.objects.create(
            performer=performer_user,
            performer_name=performer_user.name if performer_user else "System",
            action=f"Initial Screening -> {new_status}",
            details=f"Status changed from {previous_status} to {new_status}. Remarks: {remarks}"
        )

    return {
        "is_approved": is_approved,
        "updated_status": new_status,
        "screening_remarks": remarks,
        "application_id": application.id
    }
