import subprocess
import os

os.chdir('/vercel/share/v0-project')

# Configure git
subprocess.run(['git', 'config', 'user.name', 'v0[bot]'], check=True)
subprocess.run(['git', 'config', 'user.email', 'v0[bot]@users.noreply.github.com'], check=True)

# Add all changes
subprocess.run(['git', 'add', '-A'], check=True)

# Commit
subprocess.run(['git', 'commit', '-m', 'feat: UI/UX updates - landing video, stats, header, clases, viajes carousel, entrenadores, panel admin'], check=True)

# Push to nextjs-uiux
result = subprocess.run(['git', 'push', 'origin', 'nextjs-uiux'], capture_output=True, text=True)

print("[v0] Push output:")
print(result.stdout)
if result.stderr:
    print("[v0] Error/Info:")
    print(result.stderr)

if result.returncode == 0:
    print("[v0] ✓ Push successful to nextjs-uiux branch!")
else:
    print(f"[v0] ✗ Push failed with code {result.returncode}")
