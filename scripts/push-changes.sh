#!/bin/bash

# Push changes to nextjs-uiux branch
echo "[v0] Starting push to nextjs-uiux..."

# Add all changes
git add .

# Commit with message
git commit -m "feat: UI/UX updates - landing video, stats, clases/viajes/entrenadores cards, panel admin"

# Push to nextjs-uiux
git push origin nextjs-uiux

echo "[v0] Push complete! Changes are now on nextjs-uiux branch."
echo "[v0] Next: Create PR from nextjs-uiux → main on GitHub"
