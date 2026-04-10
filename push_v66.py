#!/usr/bin/env python3
import subprocess
import os

os.chdir('.')

try:
    # Git status
    result = subprocess.run(['git', 'status', '--porcelain'], capture_output=True, text=True)
    if result.stdout.strip():
        print(f"[v0] Changes detected:\n{result.stdout}")
    
    # Add all changes
    subprocess.run(['git', 'add', '.'], check=True)
    print("[v0] All changes staged")
    
    # Commit
    subprocess.run([
        'git', 'commit', '-m',
        'feat: Restore v55 - hero video, stats Raiders 50, entrenadores, viajes, panel admin'
    ], check=True)
    print("[v0] Changes committed")
    
    # Push to main
    subprocess.run(['git', 'push', 'origin', 'main'], check=True)
    print("[v0] Push to main completed successfully!")
    print("[v0] Vercel redeploy starting... Check comunidadstr.com in 3-5 minutes")
    
except subprocess.CalledProcessError as e:
    print(f"[v0] Error: {e}")
except Exception as e:
    print(f"[v0] Unexpected error: {e}")
