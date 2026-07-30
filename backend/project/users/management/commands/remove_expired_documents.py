from django.core.management.base import BaseCommand
from django.utils import timezone
from users.models import ApplicantDocument

class Command(BaseCommand):
    help = 'Removes applicant documents that have passed their 6-month expiration date.'

    def handle(self, *args, **options):
        now = timezone.now()
        expired_docs = ApplicantDocument.objects.filter(expiration_date__lte=now)
        count = expired_docs.count()

        if count == 0:
            self.stdout.write(self.style.SUCCESS('No expired documents found.'))
            return

        for doc in expired_docs:
            try:
                # Delete from Cloudinary if necessary. CloudinaryStorage usually handles deletion when the model is deleted if configured,
                # but we can explicitly remove it or let Django's FieldFile delete it.
                if doc.file:
                    doc.file.delete(save=False)
                
                doc.delete()
                self.stdout.write(f"Deleted document ID {doc.id} for Applicant {doc.applicant.last_name}")
            except Exception as e:
                self.stdout.write(self.style.ERROR(f"Error deleting document ID {doc.id}: {str(e)}"))

        self.stdout.write(self.style.SUCCESS(f'Successfully removed {count} expired document(s).'))
