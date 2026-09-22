import os
import json
from google import genai
from google.genai import types
from django.conf import settings

# Initialize Gemini API if key is available
GEMINI_API_KEY = getattr(settings, 'GEMINI_API_KEY', os.getenv('OCR_API_KEY'))
if GEMINI_API_KEY:
    client = genai.Client(api_key=GEMINI_API_KEY)
else:
    client = None

def verify_document(image_bytes, mime_type, expected_document_type, applicant_name=""):
    """
    Uses Gemini AI to verify a document based on expected type and applicant's name.
    """
    if not client:
        return {
            "is_valid": True,
            "extracted_text": "AI Verification Bypassed (No API Key). Document marked as valid.",
            "rejection_reason": ""
        }

    try:
        prompt = f"""
        You are an AI document verification assistant. 
        The user has uploaded a document that is supposed to be a '{expected_document_type}'.
        The applicant's registered name is '{applicant_name}'.
        
        Analyze the document image and verify two things:
        1. Is it a valid {expected_document_type}?
        2. Does the name on the document reasonably match '{applicant_name}'? (Allow for minor spelling variations, missing middle initials, or formatting differences).
        
        Respond with a JSON object containing the following exact keys:
        - "is_valid": boolean (true ONLY if it appears to be a valid {expected_document_type} AND the name matches. false otherwise)
        - "extracted_text": string (a brief summary of the key information found in the document, including the detected name)
        - "rejection_reason": string (if is_valid is false, explain why. If the name didn't match, explicitly state "AI Flagged: Name mismatch". If true, leave empty)
        
        Return ONLY valid JSON without markdown formatting.
        """
        
        response = client.models.generate_content(
            model='gemini-1.5-flash',
            contents=[
                prompt,
                types.Part.from_bytes(data=image_bytes, mime_type=mime_type)
            ]
        )
        text = response.text
        
        # Clean up possible markdown code blocks from response
        text = text.strip()
        if text.startswith('```json'):
            text = text[7:]
        elif text.startswith('```'):
            text = text[3:]
        if text.endswith('```'):
            text = text[:-3]
            
        result = json.loads(text.strip())
        return {
            "is_valid": result.get("is_valid", False),
            "extracted_text": result.get("extracted_text", ""),
            "rejection_reason": result.get("rejection_reason", "")
        }
        
    except Exception as e:
        print(f"OCR Error: {e}")
        return {
            "is_valid": False,
            "extracted_text": "",
            "rejection_reason": f"AI OCR Failed: {str(e)}"
        }