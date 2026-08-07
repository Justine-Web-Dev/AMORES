import os
import requests
import tempfile
import pytesseract
from PIL import Image
from .models import ApplicantDocument

import sys

# Set tesseract path based on Operating System
if sys.platform.startswith('win'):
    pytesseract.pytesseract.tesseract_cmd = r'C:\Program Files\Tesseract-OCR\tesseract.exe'
    os.environ["PATH"] += os.pathsep + r'C:\Program Files\Tesseract-OCR'
else:
    # For Linux (like Render Docker container)
    pytesseract.pytesseract.tesseract_cmd = '/usr/bin/tesseract'

def process_document_ocr(document_id):
    try:
        document = ApplicantDocument.objects.get(id=document_id)
        
        # Determine the file URL to download
        file_url = document.file.url
        if not file_url.startswith('http'):
            # Fallback for local
            pass
            
        # Cloudinary often returns URLs without extensions or as PDFs. 
        # Appending .jpg forces Cloudinary to return a valid image format that Tesseract can read!
        if not file_url.endswith(('.jpg', '.jpeg', '.png')):
            if not file_url.endswith('/'):
                file_url += '.jpg'
            
        # Download the file temporarily
        response = requests.get(file_url)
        if response.status_code != 200:
            print(f"Failed to download image for OCR: {file_url}")
            return
            
        # Write to temp file to read with Pillow
        fd, temp_path = tempfile.mkstemp(suffix=".jpg")
        with os.fdopen(fd, 'wb') as f:
            f.write(response.content)
            
        # Run OCR
        try:
            import subprocess
            cmd_path = pytesseract.pytesseract.tesseract_cmd
            path_exists = os.path.exists(cmd_path)
            try:
                test_output = subprocess.check_output([cmd_path, '--version'], stderr=subprocess.STDOUT)
            except Exception as test_ex:
                test_output = str(test_ex)
                
            img = Image.open(temp_path)
            
            # CRITICAL FIX for Render Free Tier:
            # High-resolution images cause Tesseract to consume >500MB RAM, causing OOM kills.
            # We resize the image down to max 1200px before running OCR to save memory.
            img.thumbnail((1200, 1200), Image.Resampling.LANCZOS)
            
            extracted_text = pytesseract.image_to_string(img)
            extracted_text_lower = extracted_text.lower()
            
            document.ocr_text = extracted_text
            
            # Simple Verification Logic
            doc_type = document.document_type
            verified = False
            remarks = "No matching keywords found."
            
            # 1. Check for Document Type Keywords
            has_keywords = False
            if doc_type == 'DIPLOMA':
                has_keywords = any(kw in extracted_text_lower for kw in ['bachelor', 'degree', 'bs', 'diploma', 'university', 'college'])
            elif doc_type == 'BIRTH_CERT':
                has_keywords = any(kw in extracted_text_lower for kw in ['republic', 'philippines', 'registry', 'birth', 'certificate'])
            elif doc_type in ['NBI_CLEARANCE', 'POLICE_CLEARANCE']:
                character_keywords = [
                    'clearance', 'no derogatory', 'no criminal', 'record',
                    'no pending', 'case', 'good moral', 'illegal'
                ]
                has_keywords = any(kw in extracted_text_lower for kw in character_keywords)
            else:
                has_keywords = len(extracted_text.strip()) > 10

            # 2. Check for Applicant Name Match
            applicant = document.applicant
            first_name = applicant.first_name.lower().strip()
            last_name = applicant.last_name.lower().strip()
            middle_name = applicant.middle_name.lower().strip() if hasattr(applicant, 'middle_name') and applicant.middle_name else ""
            
            # Normalize spaces and remove commas to ensure accurate sequence matching
            text_normalized = " ".join(extracted_text_lower.replace(",", " ").split())
            
            # Format variations
            fmt_fl = f"{first_name} {last_name}"
            fmt_lf = f"{last_name} {first_name}"
            
            fmt_fml, fmt_lfm, fmt_fmil, fmt_lfmil = "", "", "", ""
            if middle_name:
                fmt_fml = f"{first_name} {middle_name} {last_name}"
                fmt_lfm = f"{last_name} {first_name} {middle_name}"
                
                middle_initial = middle_name[0]
                fmt_fmil = f"{first_name} {middle_initial} {last_name}"
                fmt_lfmil = f"{last_name} {first_name} {middle_initial}"

            # Verify if any sequence matches
            name_match = (
                fmt_fl in text_normalized or 
                fmt_lf in text_normalized or 
                (middle_name and (
                    fmt_fml in text_normalized or 
                    fmt_lfm in text_normalized or 
                    fmt_fmil in text_normalized or 
                    fmt_lfmil in text_normalized
                ))
            )
            
            # Fallback: check if both first and last name exist independently
            if not name_match:
                name_match = first_name in text_normalized and last_name in text_normalized

            # Advanced flexible fallback for abbreviations (e.g. Juan C.) and spelling/spacing differences (e.g. Delacruz)
            if not name_match:
                f_words = [w for w in first_name.split() if len(w) > 1]
                l_words = [w for w in last_name.split() if len(w) > 1]
                first_ok = any(w in text_normalized for w in f_words)
                last_ok = any(w in text_normalized for w in l_words)
                last_flat = "".join(l_words)
                if last_flat in text_normalized:
                    last_ok = True
                if first_ok and last_ok:
                    name_match = True
            
            # 3. Check for Birthdate Match
            birthdate_match = False
            bd_str = ""
            if hasattr(applicant, 'birthdate') and applicant.birthdate:
                bd = applicant.birthdate
                bd_str = bd.strftime('%Y-%m-%d')
                formats = [
                    bd.strftime('%Y-%m-%d'),
                    bd.strftime('%m/%d/%Y'),
                    bd.strftime('%d/%m/%Y'),
                    bd.strftime('%B %d, %Y').lower(),
                    bd.strftime('%b %d, %Y').lower(),
                    bd.strftime('%d %B %Y').lower(),
                    bd.strftime('%B %d, %Y').lower().replace(' 0', ' '),
                    bd.strftime('%b %d, %Y').lower().replace(' 0', ' '),
                ]
                birthdate_match = any(fmt in extracted_text_lower for fmt in formats)
            
            # 4. Check for Program/Course Match (for DIPLOMA)
            program_match = False
            if doc_type == 'DIPLOMA' and applicant.program:
                prog_clean = applicant.program.lower()
                for word in ['bachelor of science in', 'bachelor of arts in', 'bachelor of', 'bs', 'ba', 'in', 'and']:
                    prog_clean = prog_clean.replace(word, '')
                prog_keywords = [w.strip() for w in prog_clean.split() if len(w.strip()) > 2]
                if prog_keywords:
                    program_match = any(kw in extracted_text_lower for kw in prog_keywords)
                else:
                    program_match = applicant.program.lower() in extracted_text_lower

            # 5. Check for School Match (for DIPLOMA)
            school_match = False
            if doc_type == 'DIPLOMA' and applicant.name_of_school:
                school_clean = applicant.name_of_school.lower()
                for word in ['university of the', 'university of', 'college of', 'school of', 'state university', 'state college']:
                    school_clean = school_clean.replace(word, '')
                school_keywords = [w.strip() for w in school_clean.split() if len(w.strip()) > 2]
                if school_keywords:
                    school_match = any(kw in extracted_text_lower for kw in school_keywords)
                else:
                    school_match = applicant.name_of_school.lower() in extracted_text_lower

            # 6. Check for Gender Match (for BIRTH_CERT)
            gender_match = False
            if doc_type in ['BIRTH_CERT', 'PSA'] and applicant.gender:
                gender_match = applicant.gender.lower() in extracted_text_lower

            # 7. Check for Graduation Date Match (for Scholastic Records: DIPLOMA and OTR)
            grad_date_match = False
            gd_str = ""
            doc_has_date = False
            if doc_type in ['DIPLOMA', 'OTR'] and hasattr(applicant, 'date_graduated') and applicant.date_graduated:
                gd = applicant.date_graduated
                gd_str = gd.strftime('%Y-%m-%d')
                month_full = gd.strftime('%B')
                month_abbr = gd.strftime('%b')
                day = gd.strftime('%d')
                day_stripped = str(gd.day)
                year = gd.strftime('%Y')
                
                # Check if the document specifically contains graduation keywords alongside a date/year
                import re
                grad_keywords = ['graduate', 'confer', 'award', 'date of issue', 'degree date', 'completion']
                has_grad_keyword = any(kw in extracted_text_lower for kw in grad_keywords)
                
                months_list = [
                    'january', 'february', 'march', 'april', 'may', 'june', 
                    'july', 'august', 'september', 'october', 'november', 'december',
                    'jan', 'feb', 'mar', 'apr', 'jun', 'jul', 'aug', 'sep', 'oct', 'nov', 'dec'
                ]
                has_month = any(m in extracted_text_lower for m in months_list)
                has_year = bool(re.search(r'\b(19|20)\d{2}\b', extracted_text_lower))
                
                # Only assume the document lists a graduation date if it has graduation keywords AND a date/year
                if has_grad_keyword and (has_month or has_year):
                    doc_has_date = True
                
                formats = [
                    f"{month_full.lower()}{day},{year}",
                    f"{month_full.lower()}{day_stripped},{year}",
                    f"{month_abbr.lower()}{day},{year}",
                    f"{month_abbr.lower()}{day_stripped},{year}",
                    f"{month_full.lower()} {day}, {year}",
                    f"{month_full.lower()} {day_stripped}, {year}",
                    f"{month_abbr.lower()} {day}, {year}",
                    f"{month_abbr.lower()} {day_stripped}, {year}",
                    gd.strftime('%Y-%m-%d'),
                    gd.strftime('%m/%d/%Y'),
                    gd.strftime('%d/%m/%Y'),
                    f"{month_full.lower()} {year}",
                    f"{month_abbr.lower()} {year}"
                ]
                grad_date_match = any(fmt in extracted_text_lower for fmt in formats)

            # Verification Logic by Document Type
            if doc_type in ['DIPLOMA', 'OTR']:
                if doc_type == 'DIPLOMA':
                    is_valid = has_keywords and name_match and (program_match or school_match)
                else: # OTR
                    is_valid = has_keywords and name_match

                if is_valid:
                    verified = True
                    remarks = f"AI verified {doc_type}: matched name '{applicant.last_name}'"
                    if doc_type == 'DIPLOMA':
                        if program_match: remarks += " & program"
                        if school_match: remarks += " & school"
                    if grad_date_match: 
                        remarks += f" & graduation date '{gd.strftime('%B %d, %Y')}'"
                else:
                    reasons = []
                    if not has_keywords: reasons.append("insufficient keywords")
                    if not name_match: reasons.append("name mismatch")
                    if doc_type == 'DIPLOMA' and not (program_match or school_match): reasons.append("program/school mismatch")
                    verified = False
                    remarks = "AI verification failed: " + ", ".join(reasons)

            elif doc_type in ['BIRTH_CERT', 'PSA']:
                if has_keywords and name_match and birthdate_match:
                    verified = True
                    remarks = f"AI verified PSA/Birth Certificate: matched name '{applicant.last_name}' and birthdate '{bd_str}'"
                    if gender_match: remarks += ", and gender"
                else:
                    reasons = []
                    if not has_keywords: reasons.append("insufficient keywords")
                    if not name_match: reasons.append("name mismatch")
                    if not birthdate_match: reasons.append(f"birthdate mismatch (expected {bd_str})")
                    verified = False
                    remarks = "AI verification failed: " + ", ".join(reasons)
                    
            else:
                if has_keywords and name_match:
                    verified = True
                    remarks = f"AI verified document: matched name '{applicant.last_name}'"
                else:
                    reasons = []
                    if not has_keywords: reasons.append("insufficient keywords")
                    if not name_match: reasons.append("name mismatch")
                    verified = False
                    remarks = "AI verification failed: " + ", ".join(reasons)
            
            document.ai_verified = verified
            document.ai_remarks = remarks
            document.save()
            print(f"OCR completed for doc {document.id}. Verified: {verified}")
            
            # Auto-update Application status by checking ALL of the applicant's documents
            application = applicant.applications.exclude(status='Failed').first()
            if application and application.status == 'New Applicant':
                
                # Fetch all documents for this applicant to see if any have failed AI verification
                all_docs = ApplicantDocument.objects.filter(applicant=applicant)
                failed_docs = all_docs.filter(ai_verified=False)
                
                if failed_docs.exists():
                    # If any document failed, set overall status to Failed and list the reasons
                    reasons = [f"{doc.document_type}: {doc.ai_remarks}" for doc in failed_docs]
                    summary_remarks = "Automated Screening Failed: " + "; ".join(reasons)
                    application.evaluation_remarks = summary_remarks
                    application.rejection_reason = summary_remarks
                else:
                    # If all currently uploaded documents passed
                    application.evaluation_remarks = f"Automated Screening (AI Passed): {remarks}"
                    application.rejection_reason = ""
                
                application.save()
            
        except Exception as e:
            debug_info = ""
            if 'path_exists' in locals():
                debug_info = f" | path_exists: {path_exists} | cmd_path: {cmd_path} | test_output: {test_output}"
                
            document.ai_verified = False
            document.ai_remarks = f"OCR Error: {str(e)}{debug_info}"
            document.save()
            print(f"OCR Error for doc {document.id}: {e}{debug_info}")
        finally:
            # Clean up temp file
            os.remove(temp_path)
            
    except Exception as e:
        print(f"Failed to process document {document_id} for OCR: {e}")
