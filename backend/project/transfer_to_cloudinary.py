import os
import django

# Set up Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'project.settings')
django.setup()

from users.models import ApplicantDocument
from django.core.files import File
from django.conf import settings

def transfer_images():
    docs = ApplicantDocument.objects.all()
    count = 0
    
    print(f"Found {docs.count()} applicant documents in the database.")
    print("Starting transfer to Cloudinary...")
    
    for doc in docs:
        if doc.file:
            # Skip if it's already a Cloudinary URL or if there's no local file
            if str(doc.file).startswith('http') or 'cloudinary' in str(doc.file):
                continue
                
            local_path = os.path.join(settings.MEDIA_ROOT, str(doc.file))
            if os.path.exists(local_path):
                print(f"Uploading {local_path}...")
                try:
                    with open(local_path, 'rb') as f:
                        # Extract the base filename (e.g. WIN_20260126_09_27_15_Pro.jpg)
                        base_name = os.path.basename(str(doc.file))
                        # Save it back to the field. This triggers CloudinaryStorage!
                        doc.file.save(base_name, File(f))
                    count += 1
                    print(f"  -> Success: {doc.file.name}")
                except Exception as e:
                    print(f"  -> Error: {e}")
            else:
                print(f"Local file not found: {local_path}")
                
    print(f"Transfer complete! Successfully uploaded {count} files to Cloudinary.")

if __name__ == "__main__":
    transfer_images()
