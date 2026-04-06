-- Agregar campo de video tutorial a las maniobras
ALTER TABLE surf_maneuvers ADD COLUMN IF NOT EXISTS video_url VARCHAR(500);
ALTER TABLE surf_maneuvers ADD COLUMN IF NOT EXISTS video_thumbnail VARCHAR(500);
ALTER TABLE surf_maneuvers ADD COLUMN IF NOT EXISTS tips TEXT;

-- Actualizar maniobras de ejemplo con videos
UPDATE surf_maneuvers SET 
  video_url = 'https://www.youtube.com/watch?v=QVPe4MD7vM4',
  tips = 'Mantén los ojos en el horizonte, flexiona las rodillas y usa los brazos para equilibrio'
WHERE name = 'Pop-up';

UPDATE surf_maneuvers SET 
  video_url = 'https://www.youtube.com/watch?v=z5k9M8YWZN0',
  tips = 'Mira hacia donde quieres ir, el cuerpo sigue a la cabeza'
WHERE name = 'Bottom Turn';

UPDATE surf_maneuvers SET 
  video_url = 'https://www.youtube.com/watch?v=xYG1fFljSQU',
  tips = 'Gira los hombros primero, luego las caderas y finalmente las piernas'
WHERE name = 'Cutback';

UPDATE surf_maneuvers SET 
  video_url = 'https://www.youtube.com/watch?v=2H2D7c1v8eY',
  tips = 'Comprime antes de la sección, extiende al subir'
WHERE name = 'Top Turn';
