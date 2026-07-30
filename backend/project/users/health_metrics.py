import os
import psutil
import time
from django.db import connection
import platform

start_time = time.time()

def get_system_health():
    """
    Returns a dictionary containing critical system health metrics.
    """
    health_data = {
        'status': 'healthy',
        'metrics': {}
    }
    
    # 1. Server Uptime
    uptime_seconds = int(time.time() - start_time)
    health_data['metrics']['uptime_seconds'] = uptime_seconds
    
    # 2. Database Latency
    db_start = time.time()
    try:
        with connection.cursor() as cursor:
            cursor.execute("SELECT 1")
            cursor.fetchone()
        db_end = time.time()
        db_latency_ms = round((db_end - db_start) * 1000, 2)
        health_data['metrics']['db_latency_ms'] = db_latency_ms
        
        # Get Database Storage Size
        db_size_mb = 0
        if connection.vendor == 'postgresql':
            with connection.cursor() as cursor:
                cursor.execute("SELECT pg_database_size(current_database())")
                size_bytes = cursor.fetchone()[0]
                db_size_mb = size_bytes / (1024 * 1024)
        elif connection.vendor == 'sqlite':
            db_path = connection.settings_dict.get('NAME')
            if db_path and os.path.exists(db_path):
                db_size_mb = os.path.getsize(db_path) / (1024 * 1024)
                
        health_data['metrics']['db_size_mb'] = round(db_size_mb, 2)

        if db_latency_ms > 2000:
            health_data['status'] = 'degraded'
    except Exception as e:
        health_data['metrics']['db_latency_ms'] = -1
        health_data['status'] = 'critical'
        health_data['error'] = str(e)
        
    # 3. CPU and Memory Usage
    try:
        health_data['metrics']['cpu_percent'] = psutil.cpu_percent(interval=0.1)
        
        process = psutil.Process(os.getpid())
        used_mb = process.memory_info().rss // (1024 * 1024)
        total_mb = 512 # Hardcoded to Render's 512MB RAM limit for accurate capacity planning
        mem_percent = (used_mb / total_mb) * 100
        
        health_data['metrics']['memory_percent'] = round(mem_percent, 1)
        health_data['metrics']['memory_used_mb'] = used_mb
        health_data['metrics']['memory_total_mb'] = total_mb
        
        if mem_percent > 95 or health_data['metrics']['cpu_percent'] > 95:
            health_data['status'] = 'degraded'
    except Exception:
        pass
        
    # 4. Disk Usage
    try:
        disk = psutil.disk_usage(os.getcwd())
        health_data['metrics']['disk_percent'] = disk.percent
        if disk.percent > 98:
            health_data['status'] = 'degraded'
    except Exception:
        pass
        
    # 5. OS Info
    health_data['metrics']['os'] = platform.system()
    
    return health_data
