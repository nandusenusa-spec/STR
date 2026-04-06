-- User profiles for students/members
CREATE TABLE IF NOT EXISTS public.user_profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL,
  nickname TEXT,
  avatar_url TEXT,
  phone TEXT,
  instagram_handle TEXT,
  total_points INTEGER DEFAULT 0,
  total_sessions INTEGER DEFAULT 0,
  level TEXT DEFAULT 'Principiante',
  favorite_discipline TEXT,
  joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  is_active BOOLEAN DEFAULT true
);

-- Training attendance/check-ins
CREATE TABLE IF NOT EXISTS public.training_checkins (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.user_profiles(id) ON DELETE CASCADE,
  schedule_id UUID REFERENCES public.training_schedule(id),
  discipline TEXT NOT NULL,
  points_earned INTEGER DEFAULT 10,
  checked_in_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- User achievements/badges
CREATE TABLE IF NOT EXISTS public.user_achievements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.user_profiles(id) ON DELETE CASCADE,
  achievement_type TEXT NOT NULL,
  achievement_name TEXT NOT NULL,
  description TEXT,
  icon TEXT,
  earned_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Instagram posts cache for preview
CREATE TABLE IF NOT EXISTS public.instagram_posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_url TEXT NOT NULL,
  image_url TEXT NOT NULL,
  caption TEXT,
  likes_count INTEGER DEFAULT 0,
  posted_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.training_checkins ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.instagram_posts ENABLE ROW LEVEL SECURITY;

-- User profiles policies
CREATE POLICY "Users can view all profiles" ON public.user_profiles FOR SELECT USING (true);
CREATE POLICY "Users can update own profile" ON public.user_profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Users can insert own profile" ON public.user_profiles FOR INSERT WITH CHECK (auth.uid() = id);

-- Checkins policies
CREATE POLICY "Users can view all checkins" ON public.training_checkins FOR SELECT USING (true);
CREATE POLICY "Users can insert own checkins" ON public.training_checkins FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Achievements policies
CREATE POLICY "Users can view all achievements" ON public.user_achievements FOR SELECT USING (true);

-- Instagram posts public read
CREATE POLICY "Anyone can view instagram posts" ON public.instagram_posts FOR SELECT USING (true);
CREATE POLICY "Admins can manage instagram posts" ON public.instagram_posts FOR ALL USING (
  EXISTS (SELECT 1 FROM public.admin_profiles WHERE id = auth.uid())
);

-- Insert sample Instagram posts
INSERT INTO public.instagram_posts (post_url, image_url, caption, likes_count, posted_at) VALUES
('https://instagram.com/p/1', '/images/hero-surf.jpg', 'Sesión épica en Playa Brava 🌊 #STRCommunity #SurfMontevideo', 234, NOW() - INTERVAL '2 days'),
('https://instagram.com/p/2', '/images/discipline-skate.jpg', 'Nuevo trick desbloqueado 🛹 #SkateLife #STR', 189, NOW() - INTERVAL '5 days'),
('https://instagram.com/p/3', '/images/discipline-sup.jpg', 'SUP sunset session en Buceo 🌅 #PaddleBoard #Montevideo', 312, NOW() - INTERVAL '7 days'),
('https://instagram.com/p/4', '/images/training.jpg', 'Entrenamiento funcional para surfistas 💪 #SurfTraining', 156, NOW() - INTERVAL '10 days');

-- Demo ranking table (separate from real users for demo purposes)
CREATE TABLE IF NOT EXISTS public.demo_rankings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  full_name TEXT NOT NULL,
  nickname TEXT,
  avatar_url TEXT,
  total_points INTEGER DEFAULT 0,
  total_sessions INTEGER DEFAULT 0,
  level TEXT DEFAULT 'Principiante',
  favorite_discipline TEXT
);

ALTER TABLE public.demo_rankings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view demo rankings" ON public.demo_rankings FOR SELECT USING (true);

-- Insert sample rankings for demo
INSERT INTO public.demo_rankings (full_name, nickname, total_points, total_sessions, level, favorite_discipline) VALUES
  ('Martín Rodríguez', 'Tino', 2450, 48, 'Avanzado', 'Surf'),
  ('Lucía Fernández', 'Lu', 2180, 42, 'Avanzado', 'Skate'),
  ('Santiago Pérez', 'Santi', 1890, 35, 'Intermedio', 'SUP'),
  ('Valentina López', 'Vale', 1650, 30, 'Intermedio', 'Surf'),
  ('Nicolás García', 'Nico', 1420, 28, 'Intermedio', 'Skate'),
  ('Camila Martínez', 'Cami', 1200, 24, 'Principiante', 'Surf'),
  ('Federico Silva', 'Fede', 980, 19, 'Principiante', 'SUP'),
  ('Agustina Díaz', 'Agus', 750, 15, 'Principiante', 'Skate')
ON CONFLICT DO NOTHING;

-- Update location to Montevideo
UPDATE public.training_schedule 
SET location = 'Playa de los Pocitos, Montevideo'
WHERE location LIKE '%Palermo%';

UPDATE public.training_schedule 
SET location = 'Skatepark de Punta Carretas, Montevideo'
WHERE discipline = 'Skate';

UPDATE public.training_schedule 
SET location = 'Playa Buceo, Montevideo'
WHERE discipline = 'SUP';
