-- Fase 2: espacios por entrenador + membresías (multi-tenant ligero)
-- Ejecutar en Supabase → SQL Editor (una vez por proyecto).

-- ===== TABLES =====
CREATE TABLE IF NOT EXISTS public.spaces (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  owner_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  is_public BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT spaces_slug_format CHECK (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
  CONSTRAINT spaces_slug_unique UNIQUE (slug)
);

CREATE TABLE IF NOT EXISTS public.space_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  space_id UUID NOT NULL REFERENCES public.spaces(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT NOT NULL DEFAULT 'student' CHECK (role IN ('owner', 'instructor', 'student')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT space_members_space_user UNIQUE (space_id, user_id)
);

CREATE INDEX IF NOT EXISTS idx_spaces_slug ON public.spaces(slug);
CREATE INDEX IF NOT EXISTS idx_spaces_owner ON public.spaces(owner_id);
CREATE INDEX IF NOT EXISTS idx_space_members_space ON public.space_members(space_id);
CREATE INDEX IF NOT EXISTS idx_space_members_user ON public.space_members(user_id);

-- Mantener updated_at
CREATE OR REPLACE FUNCTION public.set_spaces_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS tr_spaces_updated_at ON public.spaces;
CREATE TRIGGER tr_spaces_updated_at
  BEFORE UPDATE ON public.spaces
  FOR EACH ROW
  EXECUTE FUNCTION public.set_spaces_updated_at();

-- Dueño agregado automáticamente como miembro (bypass RLS vía SECURITY DEFINER)
CREATE OR REPLACE FUNCTION public.handle_new_space_owner()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.space_members (space_id, user_id, role)
  VALUES (NEW.id, NEW.owner_id, 'owner');
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_space_created_add_owner ON public.spaces;
CREATE TRIGGER on_space_created_add_owner
  AFTER INSERT ON public.spaces
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_space_owner();

-- ===== RLS =====
ALTER TABLE public.spaces ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.space_members ENABLE ROW LEVEL SECURITY;

-- Espacios públicos: cualquiera puede leer (landing /e/[slug] sin login)
DROP POLICY IF EXISTS "spaces_public_read" ON public.spaces;
CREATE POLICY "spaces_public_read" ON public.spaces
  FOR SELECT USING (is_public = true);

-- Espacios privados: solo miembros (is_public = false)
DROP POLICY IF EXISTS "spaces_private_members_read" ON public.spaces;
CREATE POLICY "spaces_private_members_read" ON public.spaces
  FOR SELECT USING (
    is_public = false
    AND auth.uid() IS NOT NULL
    AND EXISTS (
      SELECT 1 FROM public.space_members m
      WHERE m.space_id = spaces.id AND m.user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "spaces_insert" ON public.spaces;
CREATE POLICY "spaces_insert" ON public.spaces
  FOR INSERT WITH CHECK (auth.uid() = owner_id);

DROP POLICY IF EXISTS "spaces_update" ON public.spaces;
CREATE POLICY "spaces_update" ON public.spaces
  FOR UPDATE USING (auth.uid() = owner_id);

DROP POLICY IF EXISTS "spaces_delete" ON public.spaces;
CREATE POLICY "spaces_delete" ON public.spaces
  FOR DELETE USING (auth.uid() = owner_id);

-- space_members: ver filas del mismo espacio si sos miembro
DROP POLICY IF EXISTS "space_members_select" ON public.space_members;
CREATE POLICY "space_members_select" ON public.space_members
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.space_members m
      WHERE m.space_id = space_members.space_id AND m.user_id = auth.uid()
    )
  );

-- Dueño/instructor: agregar miembros (por UI o futuras invitaciones)
DROP POLICY IF EXISTS "space_members_owner_insert" ON public.space_members;
CREATE POLICY "space_members_owner_insert" ON public.space_members
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.spaces s
      WHERE s.id = space_id AND s.owner_id = auth.uid()
    )
    OR EXISTS (
      SELECT 1 FROM public.space_members m
      WHERE m.space_id = space_members.space_id
        AND m.user_id = auth.uid()
        AND m.role IN ('owner', 'instructor')
    )
  );

-- Auto-unirse como alumno a espacio público (Fase 2)
DROP POLICY IF EXISTS "space_members_self_join_public" ON public.space_members;
CREATE POLICY "space_members_self_join_public" ON public.space_members
  FOR INSERT WITH CHECK (
    auth.uid() = user_id
    AND role = 'student'
    AND EXISTS (
      SELECT 1 FROM public.spaces s
      WHERE s.id = space_id AND s.is_public = true
    )
    AND NOT EXISTS (
      SELECT 1 FROM public.space_members m
      WHERE m.space_id = space_members.space_id AND m.user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "space_members_delete" ON public.space_members;
CREATE POLICY "space_members_delete" ON public.space_members
  FOR DELETE USING (
    user_id = auth.uid()
    OR EXISTS (SELECT 1 FROM public.spaces s WHERE s.id = space_id AND s.owner_id = auth.uid())
    OR EXISTS (
      SELECT 1 FROM public.space_members m
      WHERE m.space_id = space_members.space_id
        AND m.user_id = auth.uid()
        AND m.role IN ('owner', 'instructor')
    )
  );

DROP POLICY IF EXISTS "space_members_update" ON public.space_members;
CREATE POLICY "space_members_update" ON public.space_members
  FOR UPDATE USING (
    EXISTS (SELECT 1 FROM public.spaces s WHERE s.id = space_id AND s.owner_id = auth.uid())
    OR EXISTS (
      SELECT 1 FROM public.space_members m
      WHERE m.space_id = space_members.space_id
        AND m.user_id = auth.uid()
        AND m.role IN ('owner', 'instructor')
    )
  );

GRANT SELECT ON public.spaces TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.spaces TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.space_members TO authenticated;
GRANT ALL ON public.spaces TO service_role;
GRANT ALL ON public.space_members TO service_role;
