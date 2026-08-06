from django.core.management.base import BaseCommand
from django.utils import timezone
from users.models import AuditLog
from datetime import timedelta

class Command(BaseCommand):
    help = 'Cleans up old audit logs and inactive API keys for system maintenance'

    def add_arguments(self, parser):
        parser.add_argument(
            '--days',
            type=int,
            default=365,
            help='Number of days to keep audit logs (default: 365)',
        )
        
    def handle(self, *args, **options):
        days = options['days']
        cutoff_date = timezone.now() - timedelta(days=days)
        
        # 1. Prune old audit logs
        old_logs = AuditLog.objects.filter(timestamp__lt=cutoff_date)
        log_count = old_logs.count()
        old_logs.delete()
        self.stdout.write(self.style.SUCCESS(f'Successfully deleted {log_count} old audit logs (older than {days} days).'))

