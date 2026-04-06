-- =============================================
-- STR Community Platform - Migration
-- Chat, Forums, Events, Enhanced Profiles
-- =============================================

-- ===== CHAT CHANNELS =====
CREATE TABLE IF NOT EXISTS chat_channels (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  description TEXT,
  icon TEXT DEFAULT 'hash',
  category TEXT DEFAULT 'general', -- general, surf, skate, sup, announcements
  is_private BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- ===== CHAT MESSAGES =====
CREATE TABLE IF NOT EXISTS chat_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  channel_id UUID NOT NULL REFERENCES chat_channels(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  reply_to_id UUID REFERENCES chat_messages(id) ON DELETE SET NULL,
  is_edited BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- ===== MESSAGE REACTIONS =====
CREATE TABLE IF NOT EXISTS message_reactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  message_id UUID NOT NULL REFERENCES chat_messages(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  emoji TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(message_id, user_id, emoji)
);

-- ===== FORUM CATEGORIES =====
CREATE TABLE IF NOT EXISTS forum_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  description TEXT,
  icon TEXT DEFAULT 'message-square',
  color TEXT DEFAULT '#3b82f6',
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- ===== FORUM POSTS =====
CREATE TABLE IF NOT EXISTS forum_posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  category_id UUID NOT NULL REFERENCES forum_categories(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  is_pinned BOOLEAN DEFAULT false,
  is_locked BOOLEAN DEFAULT false,
  view_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- ===== FORUM REPLIES =====
CREATE TABLE IF NOT EXISTS forum_replies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id UUID NOT NULL REFERENCES forum_posts(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  reply_to_id UUID REFERENCES forum_replies(id) ON DELETE SET NULL,
  is_edited BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- ===== POST REACTIONS =====
CREATE TABLE IF NOT EXISTS post_reactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id UUID REFERENCES forum_posts(id) ON DELETE CASCADE,
  reply_id UUID REFERENCES forum_replies(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  emoji TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  CHECK (post_id IS NOT NULL OR reply_id IS NOT NULL),
  UNIQUE(post_id, user_id, emoji),
  UNIQUE(reply_id, user_id, emoji)
);

-- ===== EVENTS =====
CREATE TABLE IF NOT EXISTS events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  event_type TEXT NOT NULL, -- class, trip, meetup, competition
  discipline TEXT, -- surf, skate, sup, all
  location TEXT,
  start_date TIMESTAMPTZ NOT NULL,
  end_date TIMESTAMPTZ,
  max_participants INTEGER,
  price DECIMAL(10,2) DEFAULT 0,
  image_url TEXT,
  is_featured BOOLEAN DEFAULT false,
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- ===== EVENT REGISTRATIONS =====
CREATE TABLE IF NOT EXISTS event_registrations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  status TEXT DEFAULT 'registered', -- registered, waitlist, cancelled, attended
  payment_status TEXT DEFAULT 'pending', -- pending, paid, refunded
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(event_id, user_id)
);

-- ===== SHOP PRODUCTS =====
CREATE TABLE IF NOT EXISTS shop_products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  description TEXT,
  product_type TEXT NOT NULL, -- physical, digital, reservation
  category TEXT, -- clothing, accessories, boards, videos, courses
  price DECIMAL(10,2) NOT NULL,
  compare_at_price DECIMAL(10,2),
  images TEXT[] DEFAULT '{}',
  is_active BOOLEAN DEFAULT true,
  stock_quantity INTEGER,
  digital_url TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- ===== PRODUCT VARIANTS =====
CREATE TABLE IF NOT EXISTS product_variants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID NOT NULL REFERENCES shop_products(id) ON DELETE CASCADE,
  name TEXT NOT NULL, -- e.g., "M / Negro"
  sku TEXT,
  price DECIMAL(10,2),
  stock_quantity INTEGER DEFAULT 0,
  options JSONB DEFAULT '{}', -- {"size": "M", "color": "Negro"}
  created_at TIMESTAMPTZ DEFAULT now()
);

-- ===== ORDERS =====
CREATE TABLE IF NOT EXISTS shop_orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  status TEXT DEFAULT 'pending', -- pending, paid, shipped, delivered, cancelled
  subtotal DECIMAL(10,2) NOT NULL,
  shipping_cost DECIMAL(10,2) DEFAULT 0,
  total DECIMAL(10,2) NOT NULL,
  shipping_address JSONB,
  payment_method TEXT,
  payment_id TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- ===== ORDER ITEMS =====
CREATE TABLE IF NOT EXISTS order_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID NOT NULL REFERENCES shop_orders(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES shop_products(id) ON DELETE SET NULL,
  variant_id UUID REFERENCES product_variants(id) ON DELETE SET NULL,
  quantity INTEGER NOT NULL DEFAULT 1,
  unit_price DECIMAL(10,2) NOT NULL,
  total_price DECIMAL(10,2) NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- ===== ENHANCE USER PROFILES =====
ALTER TABLE user_profiles 
ADD COLUMN IF NOT EXISTS bio TEXT,
ADD COLUMN IF NOT EXISTS disciplines TEXT[] DEFAULT '{}',
ADD COLUMN IF NOT EXISTS social_links JSONB DEFAULT '{}',
ADD COLUMN IF NOT EXISTS is_online BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS last_seen TIMESTAMPTZ DEFAULT now();

-- ===== INDEXES =====
CREATE INDEX IF NOT EXISTS idx_chat_messages_channel ON chat_messages(channel_id);
CREATE INDEX IF NOT EXISTS idx_chat_messages_created ON chat_messages(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_forum_posts_category ON forum_posts(category_id);
CREATE INDEX IF NOT EXISTS idx_forum_posts_created ON forum_posts(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_forum_replies_post ON forum_replies(post_id);
CREATE INDEX IF NOT EXISTS idx_events_start ON events(start_date);
CREATE INDEX IF NOT EXISTS idx_events_type ON events(event_type);
CREATE INDEX IF NOT EXISTS idx_shop_products_type ON shop_products(product_type);
CREATE INDEX IF NOT EXISTS idx_shop_products_active ON shop_products(is_active);

-- ===== ENABLE RLS =====
ALTER TABLE chat_channels ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE message_reactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE forum_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE forum_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE forum_replies ENABLE ROW LEVEL SECURITY;
ALTER TABLE post_reactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE events ENABLE ROW LEVEL SECURITY;
ALTER TABLE event_registrations ENABLE ROW LEVEL SECURITY;
ALTER TABLE shop_products ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_variants ENABLE ROW LEVEL SECURITY;
ALTER TABLE shop_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;

-- ===== RLS POLICIES =====

-- Chat channels: everyone can read, only admins create
CREATE POLICY "Anyone can view channels" ON chat_channels FOR SELECT USING (true);

-- Chat messages: authenticated users can read/write
CREATE POLICY "Authenticated users can view messages" ON chat_messages FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can send messages" ON chat_messages FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can edit own messages" ON chat_messages FOR UPDATE TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own messages" ON chat_messages FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- Message reactions
CREATE POLICY "Anyone can view reactions" ON message_reactions FOR SELECT USING (true);
CREATE POLICY "Authenticated users can react" ON message_reactions FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can remove own reactions" ON message_reactions FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- Forum categories: public read
CREATE POLICY "Anyone can view forum categories" ON forum_categories FOR SELECT USING (true);

-- Forum posts: public read, authenticated write
CREATE POLICY "Anyone can view posts" ON forum_posts FOR SELECT USING (true);
CREATE POLICY "Authenticated users can create posts" ON forum_posts FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can edit own posts" ON forum_posts FOR UPDATE TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own posts" ON forum_posts FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- Forum replies
CREATE POLICY "Anyone can view replies" ON forum_replies FOR SELECT USING (true);
CREATE POLICY "Authenticated users can reply" ON forum_replies FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can edit own replies" ON forum_replies FOR UPDATE TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own replies" ON forum_replies FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- Post reactions
CREATE POLICY "Anyone can view post reactions" ON post_reactions FOR SELECT USING (true);
CREATE POLICY "Authenticated users can react to posts" ON post_reactions FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can remove own post reactions" ON post_reactions FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- Events: public read
CREATE POLICY "Anyone can view events" ON events FOR SELECT USING (true);

-- Event registrations: users can view own, admins all
CREATE POLICY "Users can view own registrations" ON event_registrations FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Authenticated users can register" ON event_registrations FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own registrations" ON event_registrations FOR UPDATE TO authenticated USING (auth.uid() = user_id);

-- Shop products: public read
CREATE POLICY "Anyone can view active products" ON shop_products FOR SELECT USING (is_active = true);
CREATE POLICY "Anyone can view variants" ON product_variants FOR SELECT USING (true);

-- Orders: users see own
CREATE POLICY "Users can view own orders" ON shop_orders FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Authenticated users can create orders" ON shop_orders FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can view own order items" ON order_items FOR SELECT TO authenticated 
  USING (EXISTS (SELECT 1 FROM shop_orders WHERE shop_orders.id = order_items.order_id AND shop_orders.user_id = auth.uid()));

-- ===== SEED DATA =====

-- Chat channels
INSERT INTO chat_channels (name, slug, description, icon, category) VALUES
  ('General', 'general', 'Conversaciones generales de la comunidad', 'hash', 'general'),
  ('Anuncios', 'anuncios', 'Novedades y anuncios oficiales', 'megaphone', 'announcements'),
  ('Surf', 'surf', 'Todo sobre surf', 'waves', 'surf'),
  ('Skate', 'skate', 'Todo sobre skate', 'skateboard', 'skate'),
  ('SUP', 'sup', 'Todo sobre Stand Up Paddle', 'anchor', 'sup'),
  ('Spots', 'spots', 'Comparte y descubre spots', 'map-pin', 'general'),
  ('Gear', 'gear', 'Equipamiento, reviews y recomendaciones', 'shopping-bag', 'general'),
  ('Off-Topic', 'off-topic', 'Cualquier tema fuera del agua', 'coffee', 'general')
ON CONFLICT (slug) DO NOTHING;

-- Forum categories
INSERT INTO forum_categories (name, slug, description, icon, color, sort_order) VALUES
  ('Tecnica', 'tecnica', 'Preguntas y consejos tecnicos', 'graduation-cap', '#3b82f6', 1),
  ('Equipamiento', 'equipamiento', 'Reviews, recomendaciones y ventas', 'wrench', '#10b981', 2),
  ('Spots', 'spots', 'Informacion sobre playas y spots', 'map', '#f59e0b', 3),
  ('Viajes', 'viajes', 'Experiencias y planificacion de viajes', 'plane', '#8b5cf6', 4),
  ('Competencias', 'competencias', 'Torneos y eventos competitivos', 'trophy', '#ef4444', 5),
  ('Off-Topic', 'off-topic', 'Cualquier otro tema', 'message-circle', '#6b7280', 6)
ON CONFLICT (slug) DO NOTHING;

-- Sample events
INSERT INTO events (title, description, event_type, discipline, location, start_date, end_date, max_participants, price, is_featured) VALUES
  ('Clase de Surf - Principiantes', 'Clase grupal para principiantes. Incluye tabla y traje.', 'class', 'surf', 'Playa Brava, Punta del Este', now() + interval '3 days', now() + interval '3 days' + interval '2 hours', 8, 1500.00, true),
  ('Sesion de Skate - Tecnica', 'Mejora tu tecnica con nuestros coaches', 'class', 'skate', 'Skatepark Parque Rodo', now() + interval '5 days', now() + interval '5 days' + interval '2 hours', 12, 800.00, false),
  ('Surf Trip Nicaragua', 'Una semana surfeando las mejores olas de Nicaragua', 'trip', 'surf', 'Nicaragua', now() + interval '30 days', now() + interval '37 days', 10, 45000.00, true),
  ('Meetup Comunidad', 'Juntada de la comunidad STR', 'meetup', 'all', 'Rambla de Pocitos', now() + interval '7 days', now() + interval '7 days' + interval '3 hours', null, 0, false)
ON CONFLICT DO NOTHING;

-- Sample products
INSERT INTO shop_products (name, slug, description, product_type, category, price, compare_at_price, images, is_active) VALUES
  ('Remera STR Classic', 'remera-str-classic', 'Remera 100% algodon con logo STR bordado', 'physical', 'clothing', 1200.00, 1500.00, ARRAY['/images/product-tshirt.jpg'], true),
  ('Hoodie STR', 'hoodie-str', 'Hoodie premium con capucha', 'physical', 'clothing', 2500.00, null, ARRAY['/images/product-hoodie.jpg'], true),
  ('Curso Online: Surf para Principiantes', 'curso-surf-principiantes', '10 videos con tecnicas basicas de surf', 'digital', 'courses', 3500.00, 5000.00, ARRAY['/images/hero-surf.jpg'], true),
  ('Pack de Videos SUP', 'pack-videos-sup', '5 videos de tecnicas avanzadas de SUP', 'digital', 'videos', 2000.00, null, ARRAY['/images/discipline-sup.jpg'], true)
ON CONFLICT (slug) DO NOTHING;

-- ===== SOCIAL FEED (Community content sharing) =====
CREATE TABLE IF NOT EXISTS social_posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  post_type TEXT NOT NULL, -- image, video, story, reel
  caption TEXT,
  media_url TEXT NOT NULL,
  media_type TEXT, -- image/jpeg, video/mp4, etc
  thumbnail_url TEXT,
  duration_seconds INTEGER,
  is_featured BOOLEAN DEFAULT false,
  status TEXT DEFAULT 'published', -- draft, published, archived
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Social post likes
CREATE TABLE IF NOT EXISTS social_post_likes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id UUID NOT NULL REFERENCES social_posts(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(post_id, user_id)
);

-- Social post comments
CREATE TABLE IF NOT EXISTS social_post_comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id UUID NOT NULL REFERENCES social_posts(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  reply_to_id UUID REFERENCES social_post_comments(id) ON DELETE CASCADE,
  is_edited BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Comment likes
CREATE TABLE IF NOT EXISTS social_comment_likes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  comment_id UUID NOT NULL REFERENCES social_post_comments(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(comment_id, user_id)
);

-- Story views (expires after 24h)
CREATE TABLE IF NOT EXISTS social_story_views (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id UUID NOT NULL REFERENCES social_posts(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  viewed_at TIMESTAMPTZ DEFAULT now(),
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(post_id, user_id)
);

-- ===== SOCIAL FEED INDEXES =====
CREATE INDEX IF NOT EXISTS idx_social_posts_user ON social_posts(user_id);
CREATE INDEX IF NOT EXISTS idx_social_posts_type ON social_posts(post_type);
CREATE INDEX IF NOT EXISTS idx_social_posts_created ON social_posts(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_social_posts_featured ON social_posts(is_featured);
CREATE INDEX IF NOT EXISTS idx_social_likes_post ON social_post_likes(post_id);
CREATE INDEX IF NOT EXISTS idx_social_likes_user ON social_post_likes(user_id);
CREATE INDEX IF NOT EXISTS idx_social_comments_post ON social_post_comments(post_id);
CREATE INDEX IF NOT EXISTS idx_social_comments_user ON social_post_comments(user_id);
CREATE INDEX IF NOT EXISTS idx_story_views_post ON social_story_views(post_id);
CREATE INDEX IF NOT EXISTS idx_story_views_user ON social_story_views(user_id);

-- ===== SOCIAL FEED RLS =====
ALTER TABLE social_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE social_post_likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE social_post_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE social_comment_likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE social_story_views ENABLE ROW LEVEL SECURITY;

-- Social posts: public read published/archived, authenticated write
CREATE POLICY "Anyone can view published posts" ON social_posts FOR SELECT USING (status = 'published');
CREATE POLICY "Users can view own posts" ON social_posts FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Authenticated users can create posts" ON social_posts FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can edit own posts" ON social_posts FOR UPDATE TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own posts" ON social_posts FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- Social likes
CREATE POLICY "Anyone can view post likes" ON social_post_likes FOR SELECT USING (true);
CREATE POLICY "Authenticated users can like posts" ON social_post_likes FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can unlike own likes" ON social_post_likes FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- Social comments
CREATE POLICY "Anyone can view comments" ON social_post_comments FOR SELECT USING (true);
CREATE POLICY "Authenticated users can comment" ON social_post_comments FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can edit own comments" ON social_post_comments FOR UPDATE TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own comments" ON social_post_comments FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- Comment likes
CREATE POLICY "Anyone can view comment likes" ON social_comment_likes FOR SELECT USING (true);
CREATE POLICY "Authenticated users can like comments" ON social_comment_likes FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can unlike own comment likes" ON social_comment_likes FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- Story views
CREATE POLICY "Anyone can view story views" ON social_story_views FOR SELECT USING (true);
CREATE POLICY "Authenticated users can mark story as viewed" ON social_story_views FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

-- Enable realtime for chat and social
ALTER PUBLICATION supabase_realtime ADD TABLE chat_messages;
ALTER PUBLICATION supabase_realtime ADD TABLE message_reactions;
ALTER PUBLICATION supabase_realtime ADD TABLE social_posts;
ALTER PUBLICATION supabase_realtime ADD TABLE social_post_likes;
ALTER PUBLICATION supabase_realtime ADD TABLE social_post_comments;
