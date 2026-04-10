import subprocess
import os

try:
    # Git status
    result = subprocess.run(['git', 'status'], capture_output=True, text=True)
    print("[v0] Git Status:", result.stdout)
    
    # Add all changes
    subprocess.run(['git', 'add', '.'], check=True)
    print("[v0] Git add . completed")
    
    # Commit
    subprocess.run(['git', 'commit', '-m', 'feat: UI/UX updates - landing video, stats, entrenadores, viajes carousel, panel admin'], check=True)
    print("[v0] Commit completed")
    
    # Push to nextjs-uiux
    subprocess.run(['git', 'push', 'origin', 'nextjs-uiux'], check=True)
    print("[v0] Push to nextjs-uiux completed successfully!")
    
except Exception as e:
    print(f"[v0] Error: {e}")
