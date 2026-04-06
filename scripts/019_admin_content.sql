-- =============================================================================
-- 019_admin_content.sql
-- Admin CMS-like tables for links/promos/contact/live/offline classes.
-- =============================================================================

CREATE TABLE IF NOT EXISTS public.admin_live_classes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  activo BOOLEAN DEFAULT false,
  titulo TEXT NOT NULL,
  descripcion TEXT,
  url TEXT,
  instructor TEXT,
  capacidad INTEGER DEFAULT 0,
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.admin_offline_classes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  titulo TEXT NOT NULL,
  descripcion TEXT,
  tipo TEXT NOT NULL,
  lugar TEXT,
  dia TEXT,
  hora TEXT,
  duracion TEXT,
  capacidad INTEGER DEFAULT 0,
  precio NUMERIC(10,2) DEFAULT 0,
  activo BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.admin_links (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  url TEXT NOT NULL,
  icon TEXT DEFAULT 'link',
  display_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.admin_promotions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  titulo TEXT NOT NULL,
  mensaje TEXT NOT NULL,
  tipo TEXT NOT NULL,
  activo BOOLEAN DEFAULT false,
  fecha_inicio DATE,
  fecha_fin DATE,
  color TEXT DEFAULT 'cyan',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.admin_contact_info (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  whatsapp TEXT,
  whatsapp_message TEXT,
  email TEXT,
  instagram TEXT,
  direccion TEXT,
  horario_atencion TEXT,
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.admin_videos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  url TEXT NOT NULL,
  category TEXT DEFAULT 'Surf',
  visible BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.admin_live_classes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_offline_classes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_links ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_promotions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_contact_info ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_videos ENABLE ROW LEVEL SECURITY;

-- Public read where needed for frontend rendering
DROP POLICY IF EXISTS "Public read links" ON public.admin_links;
CREATE POLICY "Public read links" ON public.admin_links
  FOR SELECT USING (is_active = true);

DROP POLICY IF EXISTS "Public read promotions" ON public.admin_promotions;
CREATE POLICY "Public read promotions" ON public.admin_promotions
  FOR SELECT USING (activo = true);

DROP POLICY IF EXISTS "Public read live classes" ON public.admin_live_classes;
CREATE POLICY "Public read live classes" ON public.admin_live_classes
  FOR SELECT USING (activo = true);

DROP POLICY IF EXISTS "Public read offline classes" ON public.admin_offline_classes;
CREATE POLICY "Public read offline classes" ON public.admin_offline_classes
  FOR SELECT USING (activo = true);

DROP POLICY IF EXISTS "Public read contact info" ON public.admin_contact_info;
CREATE POLICY "Public read contact info" ON public.admin_contact_info
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "Public read videos" ON public.admin_videos;
CREATE POLICY "Public read videos" ON public.admin_videos
  FOR SELECT USING (visible = true);

-- Admin full access
DROP POLICY IF EXISTS "Admins manage live classes" ON public.admin_live_classes;
CREATE POLICY "Admins manage live classes" ON public.admin_live_classes
  FOR ALL USING (auth.uid() IN (SELECT id FROM public.admin_profiles))
  WITH CHECK (auth.uid() IN (SELECT id FROM public.admin_profiles));

DROP POLICY IF EXISTS "Admins manage offline classes" ON public.admin_offline_classes;
CREATE POLICY "Admins manage offline classes" ON public.admin_offline_classes
  FOR ALL USING (auth.uid() IN (SELECT id FROM public.admin_profiles))
  WITH CHECK (auth.uid() IN (SELECT id FROM public.admin_profiles));

DROP POLICY IF EXISTS "Admins manage links" ON public.admin_links;
CREATE POLICY "Admins manage links" ON public.admin_links
  FOR ALL USING (auth.uid() IN (SELECT id FROM public.admin_profiles))
  WITH CHECK (auth.uid() IN (SELECT id FROM public.admin_profiles));

DROP POLICY IF EXISTS "Admins manage promotions" ON public.admin_promotions;
CREATE POLICY "Admins manage promotions" ON public.admin_promotions
  FOR ALL USING (auth.uid() IN (SELECT id FROM public.admin_profiles))
  WITH CHECK (auth.uid() IN (SELECT id FROM public.admin_profiles));

DROP POLICY IF EXISTS "Admins manage contact info" ON public.admin_contact_info;
CREATE POLICY "Admins manage contact info" ON public.admin_contact_info
  FOR ALL USING (auth.uid() IN (SELECT id FROM public.admin_profiles))
  WITH CHECK (auth.uid() IN (SELECT id FROM public.admin_profiles));

DROP POLICY IF EXISTS "Admins manage videos" ON public.admin_videos;
CREATE POLICY "Admins manage videos" ON public.admin_videos
  FOR ALL USING (auth.uid() IN (SELECT id FROM public.admin_profiles))
  WITH CHECK (auth.uid() IN (SELECT id FROM public.admin_profiles));

-- Seed defaults if empty
INSERT INTO public.admin_live_classes (activo, titulo, descripcion, url, instructor, capacidad)
SELECT true, 'Clase de Surf Principiantes', 'Clase introductoria en vivo', 'https://meet.google.com/abc-defg-hij', 'Juan Martinez', 30
WHERE NOT EXISTS (SELECT 1 FROM public.admin_live_classes);

INSERT INTO public.admin_contact_info (whatsapp, whatsapp_message, email, instagram, direccion, horario_atencion)
SELECT '+598 99 123 456', 'Hola! Me gustaria obtener informacion sobre las clases de surf/skate.', 'info@comunidadstr.com', '@comunidadstr', 'Montevideo, Uruguay', 'Lunes a Viernes 9:00 - 18:00'
WHERE NOT EXISTS (SELECT 1 FROM public.admin_contact_info);
