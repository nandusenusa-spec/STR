-- Expulsiones de la comunidad: identificadores para evitar reingreso (mismo email, misma cuenta Google, etc.)
-- Ejecutar en Supabase → SQL Editor.

CREATE TABLE IF NOT EXISTS public.community_bans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  email_norm TEXT NOT NULL,
  google_sub TEXT,
  phone_norm TEXT,
  reason TEXT,
  metadata JSONB NOT NULL DEFAULT '{}',
  banned_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  banned_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  active BOOLEAN NOT NULL DEFAULT true,
  expires_at TIMESTAMPTZ,
  CONSTRAINT community_bans_email_lower CHECK (email_norm = lower(trim(email_norm)))
);

CREATE INDEX IF NOT EXISTS idx_community_bans_user_active
  ON public.community_bans (user_id) WHERE active = true;
CREATE INDEX IF NOT EXISTS idx_community_bans_email_active
  ON public.community_bans (email_norm) WHERE active = true;
CREATE UNIQUE INDEX IF NOT EXISTS idx_community_bans_google_sub_active
  ON public.community_bans (google_sub) WHERE active = true AND google_sub IS NOT NULL;

ALTER TABLE public.community_bans ENABLE ROW LEVEL SECURITY;

-- Solo admins (vía app) o service role insertan; usuarios no leen la tabla directamente
CREATE POLICY "Service role full access community_bans" ON public.community_bans
  FOR ALL TO service_role USING (true) WITH CHECK (true);

CREATE POLICY "Admins manage community_bans" ON public.community_bans
  FOR ALL USING (
    auth.uid() IN (SELECT id FROM public.admin_profiles)
  )
  WITH CHECK (
    auth.uid() IN (SELECT id FROM public.admin_profiles)
  );

-- ¿Está bloqueado el usuario actual? (middleware)
CREATE OR REPLACE FUNCTION public.auth_is_user_banned()
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
STABLE
AS $$
DECLARE
  uid uuid;
  em text;
BEGIN
  uid := auth.uid();
  IF uid IS NULL THEN
    RETURN false;
  END IF;

  SELECT lower(trim(email)) INTO em FROM auth.users WHERE id = uid;

  RETURN EXISTS (
    SELECT 1
    FROM public.community_bans b
    WHERE b.active
      AND (b.expires_at IS NULL OR b.expires_at > now())
      AND (
        b.user_id = uid
        OR (em IS NOT NULL AND b.email_norm = em)
        OR (
          b.google_sub IS NOT NULL
          AND EXISTS (
            SELECT 1
            FROM auth.identities i
            WHERE i.user_id = uid
              AND i.provider = 'google'
              AND i.provider_id = b.google_sub
          )
        )
      )
  );
END;
$$;

REVOKE ALL ON FUNCTION public.auth_is_user_banned() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.auth_is_user_banned() TO authenticated;

-- Misma cuenta Google (otro email): solo servidor / service role
CREATE OR REPLACE FUNCTION public.auth_is_google_sub_banned(p_sub text)
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.community_bans b
    WHERE b.active
      AND (b.expires_at IS NULL OR b.expires_at > now())
      AND p_sub IS NOT NULL
      AND b.google_sub = p_sub
  );
$$;

REVOKE ALL ON FUNCTION public.auth_is_google_sub_banned(text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.auth_is_google_sub_banned(text) TO service_role;

-- Teléfono normalizado (opcional, si lo guardás al expulsar)
CREATE OR REPLACE FUNCTION public.auth_is_phone_banned(p_phone text)
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.community_bans b
    WHERE b.active
      AND (b.expires_at IS NULL OR b.expires_at > now())
      AND p_phone IS NOT NULL
      AND b.phone_norm IS NOT NULL
      AND b.phone_norm = p_phone
  );
$$;

REVOKE ALL ON FUNCTION public.auth_is_phone_banned(text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.auth_is_phone_banned(text) TO service_role;
