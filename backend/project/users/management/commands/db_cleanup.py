from django.core.management.base import BaseCommand
from django.utils import timezone
from users.models import AuditLog, ApiKey
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
        
        # 2. Prune unused API keys (older than 1 year and inactive)
        inactive_keys = ApiKey.objects.filter(is_active=False, created_at__lt=cutoff_date)
        key_count = inactive_keys.count()
        inactive_keys.delete()
        self.stdout.write(self.style.SUCCESS(f'Successfully deleted {key_count} inactive and old API keys.'))
