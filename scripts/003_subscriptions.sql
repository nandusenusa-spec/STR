-- Create subscriptions table for newsletter/class notifications
CREATE TABLE IF NOT EXISTS public.subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT NOT NULL,
  phone TEXT,
  subscription_type TEXT NOT NULL DEFAULT 'newsletter', -- 'newsletter', 'trip_nicaragua', 'trip_peru'
  created_at TIMESTAMPTZ DEFAULT NOW(),
  is_active BOOLEAN DEFAULT true,
  UNIQUE(email, subscription_type)
);

ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;

-- Allow anyone to insert subscriptions
CREATE POLICY "Anyone can subscribe" ON public.subscriptions 
  FOR INSERT WITH CHECK (true);

-- Only admins can view subscriptions
CREATE POLICY "Admins can view subscriptions" ON public.subscriptions 
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM admin_profiles WHERE id = auth.uid()
    )
  );

-- Create Google Reviews table
CREATE TABLE IF NOT EXISTS public.google_reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  author_name TEXT NOT NULL,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  review_text TEXT,
  profile_photo_url TEXT,
  relative_time TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  is_featured BOOLEAN DEFAULT false
);

ALTER TABLE public.google_reviews ENABLE ROW LEVEL SECURITY;

-- Anyone can view reviews
CREATE POLICY "Anyone can view reviews" ON public.google_reviews 
  FOR SELECT USING (true);

-- Insert sample Google Reviews
INSERT INTO public.google_reviews (author_name, rating, review_text, relative_time, is_featured) VALUES
  ('Martín Rodríguez', 5, 'Increíble comunidad. Los entrenamientos me ayudaron a mejorar muchísimo mi surf. Los profes son geniales y el ambiente es muy bueno.', 'hace 2 semanas', true),
  ('Lucía Fernández', 5, 'Los viajes son espectaculares! Fui a Nicaragua y fue la mejor experiencia. Todo súper organizado, las olas increíbles y el grupo un lujo.', 'hace 1 mes', true),
  ('Santiago Pérez', 5, 'Empecé sin saber nada de skate y ahora ya ando bastante bien. Las clases son muy didácticas y los coaches tienen mucha paciencia.', 'hace 3 semanas', true),
  ('Valentina López', 4, 'Muy buena onda, recomiendo las clases de SUP. El único detalle es que a veces se llena mucho, pero vale la pena.', 'hace 1 mes', false),
  ('Nicolás García', 5, 'STR cambió mi forma de entrenar. Los movimientos en tierra realmente te preparan para el agua. 100% recomendado!', 'hace 2 meses', true),
  ('Camila Martínez', 5, 'El trip a Perú fue inolvidable. Chicama, Huanchaco... lugares increíbles y la comunidad es como una familia.', 'hace 1 mes', true)
ON CONFLICT DO NOTHING;

-- Insert Nicaragua trips
INSERT INTO public.trips (title, destination, start_date, end_date, price, max_participants, description, active)
VALUES 
  ('Nicaragua - Mayo 2026', 'Nicaragua', '2026-05-14', '2026-05-24', 1500, 12, 
   'Surf trip épico a las mejores olas de Nicaragua. Traslados, alojamiento y comidas incluidas. No te lo pierdas!', true),
  ('Nicaragua - Junio/Julio 2026', 'Nicaragua', '2026-06-25', '2026-07-05', 1500, 12, 
   'Segunda fecha! Olas perfectas en temporada alta. Traslados, alojamiento y comidas incluidas.', true),
  ('Perú - Octubre 2026', 'Perú', '2026-10-08', '2026-10-18', 1800, 10, 
   'Los mejores spots de Perú: Chicama, Huanchaco y más. Traslados, alojamiento, comida, todo incluido en este trip épico.', true)
ON CONFLICT DO NOTHING;

-- Delete old sample trips
DELETE FROM public.trips WHERE destination NOT IN ('Nicaragua', 'Perú');
