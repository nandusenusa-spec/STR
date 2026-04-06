-- =============================================================================
-- 014_backend_complete.sql — Run in Supabase SQL Editor after prior scripts
-- Aligns schema/triggers with the Next.js app (orders, forums, trips, stock).
-- =============================================================================

-- ----- Forum: counters + trigger (RLS blocks non-authors updating reply count)
ALTER TABLE forum_posts ADD COLUMN IF NOT EXISTS replies_count INTEGER DEFAULT 0;
ALTER TABLE forum_posts ADD COLUMN IF NOT EXISTS views_count INTEGER DEFAULT 0;
UPDATE forum_posts SET views_count = COALESCE(view_count, 0) WHERE views_count = 0 AND view_count IS NOT NULL;

CREATE OR REPLACE FUNCTION public.forum_reply_after_insert()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE public.forum_posts
  SET replies_count = COALESCE(replies_count, 0) + 1
  WHERE id = NEW.post_id;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS forum_replies_bump_count ON forum_replies;
CREATE TRIGGER forum_replies_bump_count
  AFTER INSERT ON forum_replies
  FOR EACH ROW
  EXECUTE FUNCTION public.forum_reply_after_insert();

UPDATE forum_posts p
SET replies_count = (SELECT COUNT(*)::int FROM forum_replies r WHERE r.post_id = p.id);

-- ----- Trips: optional phone + auto-increment participants (anon cannot UPDATE trips)
ALTER TABLE trip_registrations ALTER COLUMN phone DROP NOT NULL;

CREATE OR REPLACE FUNCTION public.trip_registration_after_insert()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE public.trips
  SET current_participants = COALESCE(current_participants, 0) + 1
  WHERE id = NEW.trip_id;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trip_reg_bump_participants ON trip_registrations;
CREATE TRIGGER trip_reg_bump_participants
  AFTER INSERT ON trip_registrations
  FOR EACH ROW
  EXECUTE FUNCTION public.trip_registration_after_insert();

-- ----- Products / trips / schedule: is_active <-> active (app uses is_active)
ALTER TABLE products ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT TRUE;
UPDATE products SET is_active = COALESCE(active, TRUE) WHERE is_active IS NULL;

CREATE OR REPLACE FUNCTION public.products_sync_active()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  NEW.active := COALESCE(NEW.is_active, NEW.active, TRUE);
  NEW.is_active := NEW.active;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS products_active_sync ON products;
CREATE TRIGGER products_active_sync
  BEFORE INSERT OR UPDATE ON products
  FOR EACH ROW
  EXECUTE FUNCTION public.products_sync_active();

ALTER TABLE trips ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT TRUE;
UPDATE trips SET is_active = COALESCE(active, TRUE) WHERE is_active IS NULL;

CREATE OR REPLACE FUNCTION public.trips_sync_active()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  NEW.active := COALESCE(NEW.is_active, NEW.active, TRUE);
  NEW.is_active := NEW.active;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trips_active_sync ON trips;
CREATE TRIGGER trips_active_sync
  BEFORE INSERT OR UPDATE ON trips
  FOR EACH ROW
  EXECUTE FUNCTION public.trips_sync_active();

ALTER TABLE training_schedule ADD COLUMN IF NOT EXISTS instructor TEXT;
ALTER TABLE training_schedule ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT TRUE;
UPDATE training_schedule SET is_active = COALESCE(active, TRUE) WHERE is_active IS NULL;

CREATE OR REPLACE FUNCTION public.training_schedule_sync_active()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  NEW.active := COALESCE(NEW.is_active, NEW.active, TRUE);
  NEW.is_active := NEW.active;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS training_schedule_active_sync ON training_schedule;
CREATE TRIGGER training_schedule_active_sync
  BEFORE INSERT OR UPDATE ON training_schedule
  FOR EACH ROW
  EXECUTE FUNCTION public.training_schedule_sync_active();

-- ----- Stock decrement (webhook / service role)
CREATE OR REPLACE FUNCTION public.decrement_stock(p_id uuid, amount int)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE public.products
  SET stock = GREATEST(0, COALESCE(stock, 0) - GREATEST(amount, 0))
  WHERE id = p_id;
END;
$$;

REVOKE ALL ON FUNCTION public.decrement_stock(uuid, int) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.decrement_stock(uuid, int) TO service_role;

-- ----- Auth: auto-create user_profiles
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.user_profiles (id, full_name, phone, favorite_discipline)
  VALUES (
    NEW.id,
    COALESCE(NULLIF(trim(NEW.raw_user_meta_data->>'full_name'), ''), split_part(NEW.email, '@', 1)),
    NULLIF(trim(NEW.raw_user_meta_data->>'phone'), ''),
    NULLIF(trim(NEW.raw_user_meta_data->>'favorite_discipline'), '')
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- ----- Subscriptions: match landing + API payloads
ALTER TABLE subscriptions DROP CONSTRAINT IF EXISTS subscriptions_subscription_type_check;
ALTER TABLE subscriptions
  ADD CONSTRAINT subscriptions_subscription_type_check
  CHECK (subscription_type IN ('classes', 'trip', 'newsletter', 'trip_nicaragua', 'trip_peru'));

CREATE UNIQUE INDEX IF NOT EXISTS subscriptions_instagram_type_unique
  ON public.subscriptions (instagram_username, subscription_type);

-- ----- Forum category for UI slug "general"
INSERT INTO forum_categories (name, slug, description, icon, color, sort_order)
VALUES ('General', 'general', 'Discusiones generales', 'message-square', '#6b7280', 0)
ON CONFLICT (slug) DO NOTHING;

-- ----- Events: participant count (UI expects this)
ALTER TABLE events ADD COLUMN IF NOT EXISTS current_participants INTEGER DEFAULT 0;
