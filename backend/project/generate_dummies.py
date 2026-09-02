import random
import string
import datetime
from users.models import Applicant, Application

def generate_random_string(length=10):
    return ''.join(random.choices(string.ascii_letters, k=length))

def generate_random_number(length=11):
    return ''.join(random.choices(string.digits, k=length))

def create_dummy_applicants(count=500):
    genders = ['Male', 'Female']
    programs = ['BS Criminology', 'BS Information Technology', 'BS Nursing', 'BS Education']
    
    applicants_created = 0
    
    for i in range(count):
        first_name = f"Dummy{i}"
        last_name = f"User{i}"
        email = f"dummyuser{i}_{generate_random_string(5)}@example.com"
        
        # Ensure uniqueness
        contact_number = f"09{generate_random_number(9)}"
        while Applicant.objects.filter(contact_number=contact_number).exists():
            contact_number = f"09{generate_random_number(9)}"
            
        pag_ibig = generate_random_number(12)
        while Applicant.objects.filter(pag_ibig_number=pag_ibig).exists():
            pag_ibig = generate_random_number(12)
            
        philhealth = generate_random_number(12)
        while Applicant.objects.filter(phil_health_id_num=philhealth).exists():
            philhealth = generate_random_number(12)

        try:
            applicant = Applicant.objects.create(
                first_name=first_name,
                last_name=last_name,
                email=email,
                contact_number=contact_number,
                gender=random.choice(genders),
                birthdate=datetime.date(2000, 1, 1) + datetime.timedelta(days=random.randint(0, 3650)),
                program=random.choice(programs),
                date_graduated=datetime.date(2022, 5, 1) + datetime.timedelta(days=random.randint(0, 365)),
                name_of_school="Dummy University",
                pag_ibig_number=pag_ibig,
                phil_health_id_num=philhealth,
                height=f"{random.randint(150, 190)} cm",
                barangay="Dummy Barangay",
                city_municipality="Dummy City",
                province="Dummy Province",
                zip_code="1234"
            )
            
            # Create an initial application
            Application.objects.create(
                applicant=applicant,
                status='New Applicant'
            )
            
            applicants_created += 1
            if applicants_created % 50 == 0:
                print(f"Created {applicants_created} applicants...", flush=True)
                
        except Exception as e:
            print(f"Error creating applicant {i}: {e}")

    print(f"Successfully created {applicants_created} dummy applicants!")

create_dummy_applicants(500)
