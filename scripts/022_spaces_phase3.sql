-- Fase 3: invitaciones por código + contenido por espacio (feed, foros, chat)
-- Requiere 020_spaces_and_members.sql aplicado. Ejecutar en Supabase → SQL Editor.

-- ===== 1) Espacios: invitación =====
ALTER TABLE public.spaces
  ADD COLUMN IF NOT EXISTS invite_code TEXT,
  ADD COLUMN IF NOT EXISTS invite_enabled BOOLEAN NOT NULL DEFAULT false;

CREATE UNIQUE INDEX IF NOT EXISTS idx_spaces_invite_code_unique
  ON public.spaces (invite_code)
  WHERE invite_code IS NOT NULL;

-- Vista previa de espacios privados con invitación activa (landing /e/slug)
DROP POLICY IF EXISTS "spaces_private_invite_preview" ON public.spaces;
CREATE POLICY "spaces_private_invite_preview" ON public.spaces
  FOR SELECT USING (
    is_public = false
    AND invite_enabled = true
    AND invite_code IS NOT NULL
  );

-- ===== 2) Feed social por espacio =====
ALTER TABLE public.social_posts
  ADD COLUMN IF NOT EXISTS space_id UUID REFERENCES public.spaces(id) ON DELETE CASCADE;

CREATE INDEX IF NOT EXISTS idx_social_posts_space ON public.social_posts(space_id)
  WHERE space_id IS NOT NULL;

-- ===== 3) Foros: categoría pertenece a un espacio (NULL = global /app) =====
ALTER TABLE public.forum_categories
  ADD COLUMN IF NOT EXISTS space_id UUID REFERENCES public.spaces(id) ON DELETE CASCADE;

CREATE UNIQUE INDEX IF NOT EXISTS idx_forum_categories_space_slug
  ON public.forum_categories(space_id, slug)
  WHERE space_id IS NOT NULL;

-- ===== 4) Chat: canal ligado a un espacio (un canal principal por espacio) =====
ALTER TABLE public.chat_channels
  ADD COLUMN IF NOT EXISTS space_id UUID REFERENCES public.spaces(id) ON DELETE CASCADE;

CREATE UNIQUE INDEX IF NOT EXISTS idx_chat_channels_one_per_space
  ON public.chat_channels(space_id)
  WHERE space_id IS NOT NULL;

-- ===== 5) Trigger: al crear espacio → categoría de foro + canal de chat =====
CREATE OR REPLACE FUNCTION public.handle_space_phase3_resources()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  slug_fc TEXT;
  slug_ch TEXT;
BEGIN
  slug_fc := 'fc' || replace(NEW.id::text, '-', '');
  slug_ch := 'ch' || replace(NEW.id::text, '-', '');

  INSERT INTO public.forum_categories (name, slug, description, icon, color, sort_order, space_id)
  VALUES (
    NEW.name || ' — Foro',
    slug_fc,
    'Foro del espacio',
    'message-square',
    '#22d3ee',
    100,
    NEW.id
  )
  ON CONFLICT (slug) DO NOTHING;

  INSERT INTO public.chat_channels (name, slug, description, icon, category, space_id)
  VALUES (
    NEW.name || ' — Chat',
    slug_ch,
    'Chat del espacio',
    'hash',
    'general',
    NEW.id
  )
  ON CONFLICT (slug) DO NOTHING;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_space_created_phase3 ON public.spaces;
CREATE TRIGGER on_space_created_phase3
  AFTER INSERT ON public.spaces
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_space_phase3_resources();

-- Espacios ya existentes (antes del trigger)
INSERT INTO public.forum_categories (name, slug, description, icon, color, sort_order, space_id)
SELECT
  s.name || ' — Foro',
  'fc' || replace(s.id::text, '-', ''),
  'Foro del espacio',
  'message-square',
  '#22d3ee',
  100,
  s.id
FROM public.spaces s
WHERE NOT EXISTS (
  SELECT 1 FROM public.forum_categories fc WHERE fc.space_id = s.id
)
ON CONFLICT (slug) DO NOTHING;

INSERT INTO public.chat_channels (name, slug, description, icon, category, space_id)
SELECT
  s.name || ' — Chat',
  'ch' || replace(s.id::text, '-', ''),
  'Chat del espacio',
  'hash',
  'general',
  s.id
FROM public.spaces s
WHERE NOT EXISTS (
  SELECT 1 FROM public.chat_channels ch WHERE ch.space_id = s.id
)
ON CONFLICT (slug) DO NOTHING;

-- ===== 6) RPC: unirse a espacio privado con código =====
CREATE OR REPLACE FUNCTION public.join_space_with_invite(p_slug text, p_code text)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  s public.spaces%ROWTYPE;
BEGIN
  IF auth.uid() IS NULL THEN
    RETURN jsonb_build_object('ok', false, 'error', 'auth');
  END IF;

  SELECT * INTO s FROM public.spaces WHERE slug = trim(p_slug) LIMIT 1;
  IF NOT FOUND THEN
    RETURN jsonb_build_object('ok', false, 'error', 'not_found');
  END IF;

  IF NOT s.invite_enabled OR s.invite_code IS NULL
     OR lower(trim(s.invite_code)) <> lower(trim(p_code)) THEN
    RETURN jsonb_build_object('ok', false, 'error', 'invalid_code');
  END IF;

  IF EXISTS (
    SELECT 1 FROM public.space_members m
    WHERE m.space_id = s.id AND m.user_id = auth.uid()
  ) THEN
    RETURN jsonb_build_object('ok', true, 'already_member', true);
  END IF;

  INSERT INTO public.space_members (space_id, user_id, role)
  VALUES (s.id, auth.uid(), 'student');

  RETURN jsonb_build_object('ok', true);
EXCEPTION
  WHEN unique_violation THEN
    RETURN jsonb_build_object('ok', true, 'already_member', true);
END;
$$;

REVOKE ALL ON FUNCTION public.join_space_with_invite(text, text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.join_space_with_invite(text, text) TO authenticated;

-- ===== 7) RLS: reemplazar políticas de contenido global vs espacio =====

-- --- social_posts ---
DROP POLICY IF EXISTS "Anyone can view published posts" ON public.social_posts;
DROP POLICY IF EXISTS "Users can view own posts" ON public.social_posts;
DROP POLICY IF EXISTS "Authenticated users can create posts" ON public.social_posts;
DROP POLICY IF EXISTS "Users can edit own posts" ON public.social_posts;
DROP POLICY IF EXISTS "Users can delete own posts" ON public.social_posts;

CREATE POLICY "social_posts_select" ON public.social_posts
  FOR SELECT USING (
    (status = 'published' AND space_id IS NULL)
    OR (
      status = 'published'
      AND space_id IS NOT NULL
      AND auth.uid() IS NOT NULL
      AND EXISTS (
        SELECT 1 FROM public.space_members m
        WHERE m.space_id = social_posts.space_id AND m.user_id = auth.uid()
      )
    )
    OR (auth.uid() IS NOT NULL AND user_id = auth.uid())
  );

CREATE POLICY "social_posts_insert" ON public.social_posts
  FOR INSERT TO authenticated
  WITH CHECK (
    auth.uid() = user_id
    AND (
      space_id IS NULL
      OR EXISTS (
        SELECT 1 FROM public.space_members m
        WHERE m.space_id = social_posts.space_id AND m.user_id = auth.uid()
      )
    )
  );

CREATE POLICY "social_posts_update" ON public.social_posts
  FOR UPDATE TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (
    auth.uid() = user_id
    AND (
      space_id IS NULL
      OR EXISTS (
        SELECT 1 FROM public.space_members m
        WHERE m.space_id = social_posts.space_id AND m.user_id = auth.uid()
      )
    )
  );

CREATE POLICY "social_posts_delete" ON public.social_posts
  FOR DELETE TO authenticated
  USING (auth.uid() = user_id);

-- --- social_post_likes (solo si el post es visible) ---
DROP POLICY IF EXISTS "Anyone can view post likes" ON public.social_post_likes;
DROP POLICY IF EXISTS "Authenticated users can like posts" ON public.social_post_likes;

CREATE POLICY "social_post_likes_select" ON public.social_post_likes
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.social_posts p
      WHERE p.id = social_post_likes.post_id
      AND (
        (p.status = 'published' AND p.space_id IS NULL)
        OR (
          p.status = 'published'
          AND p.space_id IS NOT NULL
          AND auth.uid() IS NOT NULL
          AND EXISTS (
            SELECT 1 FROM public.space_members m
            WHERE m.space_id = p.space_id AND m.user_id = auth.uid()
          )
        )
        OR (auth.uid() IS NOT NULL AND p.user_id = auth.uid())
      )
    )
  );

CREATE POLICY "social_post_likes_insert" ON public.social_post_likes
  FOR INSERT TO authenticated
  WITH CHECK (
    auth.uid() = user_id
    AND EXISTS (
      SELECT 1 FROM public.social_posts p
      WHERE p.id = social_post_likes.post_id
      AND (
        (p.status = 'published' AND p.space_id IS NULL)
        OR (
          p.status = 'published'
          AND p.space_id IS NOT NULL
          AND EXISTS (
            SELECT 1 FROM public.space_members m
            WHERE m.space_id = p.space_id AND m.user_id = auth.uid()
          )
        )
      )
    )
  );

CREATE POLICY "Users can unlike own likes" ON public.social_post_likes
  FOR DELETE TO authenticated
  USING (auth.uid() = user_id);

-- --- social_post_comments ---
DROP POLICY IF EXISTS "Anyone can view comments" ON public.social_post_comments;
DROP POLICY IF EXISTS "Authenticated users can comment" ON public.social_post_comments;

CREATE POLICY "social_post_comments_select" ON public.social_post_comments
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.social_posts p
      WHERE p.id = social_post_comments.post_id
      AND (
        (p.status = 'published' AND p.space_id IS NULL)
        OR (
          p.status = 'published'
          AND p.space_id IS NOT NULL
          AND auth.uid() IS NOT NULL
          AND EXISTS (
            SELECT 1 FROM public.space_members m
            WHERE m.space_id = p.space_id AND m.user_id = auth.uid()
          )
        )
        OR (auth.uid() IS NOT NULL AND p.user_id = auth.uid())
      )
    )
  );

CREATE POLICY "social_post_comments_insert" ON public.social_post_comments
  FOR INSERT TO authenticated
  WITH CHECK (
    auth.uid() = user_id
    AND EXISTS (
      SELECT 1 FROM public.social_posts p
      WHERE p.id = social_post_comments.post_id
      AND (
        (p.status = 'published' AND p.space_id IS NULL)
        OR (
          p.status = 'published'
          AND p.space_id IS NOT NULL
          AND EXISTS (
            SELECT 1 FROM public.space_members m
            WHERE m.space_id = p.space_id AND m.user_id = auth.uid()
          )
        )
      )
    )
  );

-- --- forum_categories ---
DROP POLICY IF EXISTS "Anyone can view forum categories" ON public.forum_categories;

CREATE POLICY "forum_categories_select" ON public.forum_categories
  FOR SELECT USING (
    space_id IS NULL
    OR (
      auth.uid() IS NOT NULL
      AND EXISTS (
        SELECT 1 FROM public.space_members m
        WHERE m.space_id = forum_categories.space_id AND m.user_id = auth.uid()
      )
    )
  );

-- --- forum_posts ---
DROP POLICY IF EXISTS "Anyone can view posts" ON public.forum_posts;
DROP POLICY IF EXISTS "Authenticated users can create posts" ON public.forum_posts;

CREATE POLICY "forum_posts_select" ON public.forum_posts
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.forum_categories c
      WHERE c.id = forum_posts.category_id
      AND (
        c.space_id IS NULL
        OR (
          auth.uid() IS NOT NULL
          AND EXISTS (
            SELECT 1 FROM public.space_members m
            WHERE m.space_id = c.space_id AND m.user_id = auth.uid()
          )
        )
      )
    )
  );

CREATE POLICY "forum_posts_insert" ON public.forum_posts
  FOR INSERT TO authenticated
  WITH CHECK (
    auth.uid() = user_id
    AND EXISTS (
      SELECT 1 FROM public.forum_categories c
      WHERE c.id = forum_posts.category_id
      AND (
        c.space_id IS NULL
        OR EXISTS (
          SELECT 1 FROM public.space_members m
          WHERE m.space_id = c.space_id AND m.user_id = auth.uid()
        )
      )
    )
  );

-- --- forum_replies ---
DROP POLICY IF EXISTS "Anyone can view replies" ON public.forum_replies;

CREATE POLICY "forum_replies_select" ON public.forum_replies
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.forum_posts fp
      JOIN public.forum_categories c ON c.id = fp.category_id
      WHERE fp.id = forum_replies.post_id
      AND (
        c.space_id IS NULL
        OR (
          auth.uid() IS NOT NULL
          AND EXISTS (
            SELECT 1 FROM public.space_members m
            WHERE m.space_id = c.space_id AND m.user_id = auth.uid()
          )
        )
      )
    )
  );

-- --- chat_channels ---
DROP POLICY IF EXISTS "Anyone can view channels" ON public.chat_channels;

CREATE POLICY "chat_channels_select" ON public.chat_channels
  FOR SELECT USING (
    space_id IS NULL
    OR (
      auth.uid() IS NOT NULL
      AND EXISTS (
        SELECT 1 FROM public.space_members m
        WHERE m.space_id = chat_channels.space_id AND m.user_id = auth.uid()
      )
    )
  );

-- --- chat_messages ---
DROP POLICY IF EXISTS "Authenticated users can view messages" ON public.chat_messages;
DROP POLICY IF EXISTS "Authenticated users can send messages" ON public.chat_messages;

CREATE POLICY "chat_messages_select" ON public.chat_messages
  FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.chat_channels ch
      WHERE ch.id = chat_messages.channel_id
      AND (
        ch.space_id IS NULL
        OR EXISTS (
          SELECT 1 FROM public.space_members m
          WHERE m.space_id = ch.space_id AND m.user_id = auth.uid()
        )
      )
    )
  );

CREATE POLICY "chat_messages_insert" ON public.chat_messages
  FOR INSERT TO authenticated
  WITH CHECK (
    auth.uid() = user_id
    AND EXISTS (
      SELECT 1 FROM public.chat_channels ch
      WHERE ch.id = chat_messages.channel_id
      AND (
        ch.space_id IS NULL
        OR EXISTS (
          SELECT 1 FROM public.space_members m
          WHERE m.space_id = ch.space_id AND m.user_id = auth.uid()
        )
      )
    )
  );

-- --- forum_replies: insert con mismo alcance que los posts ---
DROP POLICY IF EXISTS "Authenticated users can reply" ON public.forum_replies;

CREATE POLICY "forum_replies_insert" ON public.forum_replies
  FOR INSERT TO authenticated
  WITH CHECK (
    auth.uid() = user_id
    AND EXISTS (
      SELECT 1 FROM public.forum_posts fp
      JOIN public.forum_categories c ON c.id = fp.category_id
      WHERE fp.id = forum_replies.post_id
      AND (
        c.space_id IS NULL
        OR EXISTS (
          SELECT 1 FROM public.space_members m
          WHERE m.space_id = c.space_id AND m.user_id = auth.uid()
        )
      )
    )
  );
