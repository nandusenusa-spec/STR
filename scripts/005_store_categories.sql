-- Store categories and improved products

-- Create store_categories table
CREATE TABLE IF NOT EXISTS public.store_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  slug TEXT NOT NULL UNIQUE,
  description TEXT,
  image_url TEXT,
  display_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.store_categories ENABLE ROW LEVEL SECURITY;

-- Anyone can view active categories
CREATE POLICY "Anyone can view active categories" ON public.store_categories
  FOR SELECT USING (is_active = true);

-- Admins can manage categories
CREATE POLICY "Admins can manage categories" ON public.store_categories
  FOR ALL USING (
    EXISTS (SELECT 1 FROM public.admin_profiles WHERE id = auth.uid())
  );

-- Add condition column to products (new/used)
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS condition TEXT DEFAULT 'new' CHECK (condition IN ('new', 'used'));

-- Add category_id to reference categories
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS category_id UUID REFERENCES public.store_categories(id);

-- Insert predefined categories
INSERT INTO public.store_categories (name, slug, description, image_url, display_order) VALUES
  ('Surfboards', 'surfboards', 'Tablas de surf nuevas y usadas', '/images/cat-surfboards.jpg', 1),
  ('Skateboards', 'skateboards', 'Skates, longboards y surfskates', '/images/cat-skateboards.jpg', 2),
  ('SUP', 'sup', 'Stand Up Paddle boards', '/images/cat-sup.jpg', 3),
  ('Hombres', 'hombres', 'Ropa y accesorios para hombres', '/images/cat-hombres.jpg', 4),
  ('Mujeres', 'mujeres', 'Ropa y accesorios para mujeres', '/images/cat-mujeres.jpg', 5),
  ('Gorras', 'gorras', 'Gorras y sombreros', '/images/cat-gorras.jpg', 6),
  ('Accesorios', 'accesorios', 'Quillas, leashes, wax y más', '/images/cat-accesorios.jpg', 7)
ON CONFLICT (slug) DO NOTHING;

-- Update existing products to use category_id based on category text
UPDATE public.products p
SET category_id = (
  SELECT id FROM public.store_categories 
  WHERE slug = LOWER(p.category) OR name ILIKE '%' || p.category || '%'
  LIMIT 1
)
WHERE p.category_id IS NULL AND p.category IS NOT NULL;
