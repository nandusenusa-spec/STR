import subprocess
import os

os.chdir('/vercel/share/v0-project')

# Configure git
subprocess.run(['git', 'config', 'user.email', 'v0@vercel.com'], check=True)
subprocess.run(['git', 'config', 'user.name', 'v0'], check=True)

# Add all changes
result = subprocess.run(['git', 'add', '.'], capture_output=True, text=True)
print("[v0] git add:", result.stdout or result.stderr)

# Commit
result = subprocess.run([
    'git', 'commit', '-m',
    'feat: UI/UX updates - stats 50 Raiders, features links to socios, entrenadores German+Diego, panel admin panel, viajes carrusel vertical'
], capture_output=True, text=True)
print("[v0] git commit:", result.stdout or result.stderr)

# Push to main
result = subprocess.run(['git', 'push', 'origin', 'main'], capture_output=True, text=True)
print("[v0] git push:", result.stdout or result.stderr)

if result.returncode == 0:
    print("[v0] Push successful!")
else:
    print("[v0] Push error:", result.stderr)
