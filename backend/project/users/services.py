import re
from django.db import transaction
from django.utils import timezone
from .models import Application, AuditLog, ApplicantDocument

def parse_height_cm(height_str):
    if not height_str:
        return 0
    # Try to find a numeric value (e.g. "165", "165cm", "1.65m")
    match = re.search(r'(\d+(?:\.\d+)?)', str(height_str))
    if match:
        val = float(match.group(1))
        # If it looks like meters, convert to cm
        if val < 3.0:
            val *= 100
        return val
    return 0

def has_baccalaureate(program_str):
    if not program_str:
        return False
    program_str = program_str.lower()
    keywords = ['bachelor', 'bs', 'ba', 'ab', 'degree', 'b.s.', 'b.a.', 'baccalaureate']
    # Check if any keyword matches as a whole word or prefix
    # Just a simple inclusion check for robustness
    return any(kw in program_str.split() for kw in keywords) or 'bachelor' in program_str

def evaluate_initial_application_status(application, payload_data, performer_user=None):
    """
    Evaluates the application based on:
    - Age (21-30)
    - Education (Baccalaureate)
    - Height (>=157cm Male, >=152cm Female)
    - Payload flags (citizenship, weight, physical, character)
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
        failures.append(f"Height does not meet the general qualification.")
    elif gender == 'female' and height_cm < 152:
        failures.append(f"Height does not meet the general qualification.")
    elif gender not in ['male', 'female']:
        if height_cm < 152:
             failures.append(f"Height does not meet the general qualification.")

    # 4. Payload flags
    if str(payload_data.get('citizenship_is_filipino', '')).lower() not in ['true', '1', 't', 'y', 'yes'] and not payload_data.get('citizenship_is_filipino') is True:
        failures.append("Citizenship is not Natural born Filipino.")
    if str(payload_data.get('physical_fitness_flag', '')).lower() not in ['true', '1', 't', 'y', 'yes'] and not payload_data.get('physical_fitness_flag') is True:
        failures.append("Physical fitness flag is false.")
    if str(payload_data.get('no_criminal_record', '')).lower() not in ['true', '1', 't', 'y', 'yes'] and not payload_data.get('no_criminal_record') is True:
        failures.append("Applicant has criminal record.")
    if str(payload_data.get('no_pending_cases', '')).lower() not in ['true', '1', 't', 'y', 'yes'] and not payload_data.get('no_pending_cases') is True:
        failures.append("Applicant has pending cases.")
    if str(payload_data.get('good_moral_verified', '')).lower() not in ['true', '1', 't', 'y', 'yes'] and not payload_data.get('good_moral_verified') is True:
        failures.append("Good moral character not verified.")
    if str(payload_data.get('no_illegal_affiliation', '')).lower() not in ['true', '1', 't', 'y', 'yes'] and not payload_data.get('no_illegal_affiliation') is True:
        failures.append("Applicant has affiliation with illegal organizations.")

    is_approved = len(failures) == 0
    remarks = "Initial screening passed." if is_approved else "Initial screening failed: " + "; ".join(failures)
    
    previous_status = application.status
    new_status = 'Document Review' if is_approved else 'Rejected'

    with transaction.atomic():
        application.status = new_status
        if not is_approved:
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
        "application_id": application.id,
        "updated_status": new_status,
        "screening_remarks": remarks,
        "updated_at": application.updated_at
    }
