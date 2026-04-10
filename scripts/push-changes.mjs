import { execSync } from 'child_process';

try {
  console.log('[v0] Starting push to nextjs-uiux branch...');
  
  // Add all changes
  execSync('git add .', { stdio: 'inherit' });
  console.log('[v0] Files staged for commit');
  
  // Commit changes
  execSync('git commit -m "feat: UI/UX updates - landing video, stats, header, clases, viajes carousel, entrenadores, panel admin"', { stdio: 'inherit' });
  console.log('[v0] Changes committed');
  
  // Push to nextjs-uiux branch
  execSync('git push origin nextjs-uiux', { stdio: 'inherit' });
  console.log('[v0] Successfully pushed to nextjs-uiux branch');
  
} catch (error) {
  console.error('[v0] Error during push:', error.message);
  process.exit(1);
}
