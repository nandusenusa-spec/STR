#!/usr/bin/env python3
import subprocess
import os

try:
    os.chdir(os.getcwd())
    
    # Git add
    subprocess.run(['git', 'add', '.'], check=True)
    print("[v0] Files staged")
    
    # Git commit
    subprocess.run(['git', 'commit', '-m', 'fix: add missing instructor property in events admin - ready for production'], check=True)
    print("[v0] Changes committed")
    
    # Push to main
    subprocess.run(['git', 'push', 'origin', 'main'], check=True)
    print("[v0] Push to main completed successfully!")
    print("[v0] Vercel will redeploy automatically in 3-5 minutes")
    
except Exception as e:
    print(f"[v0] Error: {e}")
