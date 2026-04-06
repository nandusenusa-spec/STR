-- Surfer Profile Tables
-- Biometrics, Quiver, Spots, Maneuvers, Timeline

-- Biometrics (datos corporales del surfer)
CREATE TABLE IF NOT EXISTS surfer_biometrics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  height_cm DECIMAL(5,2),
  weight_kg DECIMAL(5,2),
  stance VARCHAR(20) DEFAULT 'regular', -- regular, goofy
  foot_size DECIMAL(4,1),
  arm_span_cm DECIMAL(5,2),
  age INTEGER,
  fitness_level VARCHAR(20) DEFAULT 'intermediate', -- beginner, intermediate, advanced, pro
  injuries_notes TEXT,
  strava_connected BOOLEAN DEFAULT FALSE,
  strava_athlete_id VARCHAR(100),
  apple_health_connected BOOLEAN DEFAULT FALSE,
  google_fit_connected BOOLEAN DEFAULT FALSE,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id)
);

-- Quiver (tablas del surfer)
CREATE TABLE IF NOT EXISTS surfer_quiver (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  board_name VARCHAR(100) NOT NULL,
  board_type VARCHAR(50) NOT NULL, -- shortboard, longboard, fish, funboard, gun, sup
  length_feet DECIMAL(3,1),
  length_inches DECIMAL(3,1),
  width_inches DECIMAL(4,2),
  thickness_inches DECIMAL(3,2),
  volume_liters DECIMAL(4,1),
  shaper VARCHAR(100),
  model VARCHAR(100),
  year INTEGER,
  fins_setup VARCHAR(50), -- thruster, quad, twin, single, 2+1
  is_favorite BOOLEAN DEFAULT FALSE,
  image_url TEXT,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Spots favoritos
CREATE TABLE IF NOT EXISTS surfer_spots (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  spot_name VARCHAR(100) NOT NULL,
  location VARCHAR(200),
  country VARCHAR(100),
  latitude DECIMAL(10,8),
  longitude DECIMAL(11,8),
  wave_type VARCHAR(50), -- beach break, point break, reef break
  best_conditions TEXT,
  is_home_spot BOOLEAN DEFAULT FALSE,
  sessions_count INTEGER DEFAULT 0,
  image_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Catálogo de maniobras de surf (administrado)
CREATE TABLE IF NOT EXISTS surf_maneuvers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(100) NOT NULL,
  name_es VARCHAR(100),
  category VARCHAR(50) NOT NULL, -- basic, intermediate, advanced, pro, aerial
  level_required INTEGER DEFAULT 1, -- 1-10
  description TEXT,
  description_es TEXT,
  tips TEXT,
  video_example_url TEXT,
  image_url TEXT,
  points INTEGER DEFAULT 10,
  order_index INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Progreso del usuario en maniobras
CREATE TABLE IF NOT EXISTS user_maneuver_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  maneuver_id UUID REFERENCES surf_maneuvers(id) ON DELETE CASCADE,
  status VARCHAR(20) DEFAULT 'locked', -- locked, in_progress, pending_review, approved, rejected
  video_url TEXT,
  video_uploaded_at TIMESTAMP WITH TIME ZONE,
  instructor_id UUID REFERENCES auth.users(id),
  instructor_feedback TEXT,
  instructor_reviewed_at TIMESTAMP WITH TIME ZONE,
  attempts INTEGER DEFAULT 0,
  approved_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, maneuver_id)
);

-- Timeline de evolución
CREATE TABLE IF NOT EXISTS evolution_timeline (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  entry_type VARCHAR(50) NOT NULL, -- video, photo, session, milestone, maneuver_unlocked, level_up
  title VARCHAR(200),
  description TEXT,
  media_url TEXT,
  thumbnail_url TEXT,
  spot_id UUID REFERENCES surfer_spots(id),
  maneuver_id UUID REFERENCES surf_maneuvers(id),
  session_duration_minutes INTEGER,
  wave_count INTEGER,
  conditions TEXT,
  is_public BOOLEAN DEFAULT TRUE,
  likes_count INTEGER DEFAULT 0,
  comments_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Seed de maniobras básicas
INSERT INTO surf_maneuvers (name, name_es, category, level_required, description, description_es, points, order_index) VALUES
-- Básicas (Nivel 1-2)
('Paddle Out', 'Remar hacia afuera', 'basic', 1, 'Paddle through the whitewash to reach the lineup', 'Remar pasando la espuma para llegar al pico', 10, 1),
('Pop Up', 'Pop Up', 'basic', 1, 'Stand up on the board in one fluid motion', 'Pararse en la tabla en un movimiento fluido', 15, 2),
('Trim', 'Trim', 'basic', 1, 'Maintain speed and balance while riding straight', 'Mantener velocidad y equilibrio surfeando recto', 10, 3),
('Turtle Roll', 'Turtle Roll', 'basic', 1, 'Flip board upside down to pass under waves', 'Dar vuelta la tabla para pasar bajo las olas', 10, 4),
('Duck Dive', 'Duck Dive', 'basic', 2, 'Push board underwater to pass under breaking waves', 'Hundir la tabla para pasar bajo olas rompiendo', 20, 5),

-- Intermedias (Nivel 3-5)
('Bottom Turn', 'Bottom Turn', 'intermediate', 3, 'Turn at the bottom of the wave to generate speed', 'Giro en la base de la ola para generar velocidad', 25, 6),
('Top Turn', 'Top Turn', 'intermediate', 3, 'Turn at the top of the wave', 'Giro en la cresta de la ola', 25, 7),
('Cutback', 'Cutback', 'intermediate', 4, 'Turn back towards the breaking part of the wave', 'Girar hacia la parte rompiente de la ola', 30, 8),
('Floater', 'Floater', 'intermediate', 4, 'Ride over the breaking lip of the wave', 'Surfear sobre el labio de la ola', 30, 9),
('Re-entry', 'Re-entry', 'intermediate', 5, 'Hit the lip and redirect back down', 'Golpear el labio y redirigir hacia abajo', 35, 10),

-- Avanzadas (Nivel 6-8)
('Snap', 'Snap', 'advanced', 6, 'Quick, sharp turn in the pocket', 'Giro rápido y cerrado en el pocket', 40, 11),
('Roundhouse Cutback', 'Roundhouse Cutback', 'advanced', 6, 'Full 180-degree cutback with rebound', 'Cutback completo de 180 grados con rebote', 45, 12),
('Tube Ride', 'Tubo', 'advanced', 7, 'Ride inside the barrel of the wave', 'Surfear dentro del tubo de la ola', 60, 13),
('Carving 360', 'Carving 360', 'advanced', 8, 'Full rotation on the face of the wave', 'Rotación completa en la cara de la ola', 50, 14),

-- Pro (Nivel 9-10)
('Air', 'Aéreo', 'pro', 9, 'Launch above the lip of the wave', 'Despegar sobre el labio de la ola', 70, 15),
('Alley Oop', 'Alley Oop', 'pro', 9, 'Aerial with reverse rotation', 'Aéreo con rotación inversa', 80, 16),
('Air Reverse', 'Air Reverse', 'pro', 10, 'Full rotation aerial', 'Aéreo con rotación completa', 90, 17),
('Full Rotor', 'Full Rotor', 'pro', 10, 'Horizontal spinning air', 'Aéreo con giro horizontal', 100, 18)
ON CONFLICT DO NOTHING;

-- Índices
CREATE INDEX IF NOT EXISTS idx_surfer_biometrics_user ON surfer_biometrics(user_id);
CREATE INDEX IF NOT EXISTS idx_surfer_quiver_user ON surfer_quiver(user_id);
CREATE INDEX IF NOT EXISTS idx_surfer_spots_user ON surfer_spots(user_id);
CREATE INDEX IF NOT EXISTS idx_user_maneuver_progress_user ON user_maneuver_progress(user_id);
CREATE INDEX IF NOT EXISTS idx_user_maneuver_progress_status ON user_maneuver_progress(status);
CREATE INDEX IF NOT EXISTS idx_evolution_timeline_user ON evolution_timeline(user_id);
CREATE INDEX IF NOT EXISTS idx_evolution_timeline_created ON evolution_timeline(created_at DESC);
