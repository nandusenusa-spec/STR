-- STR Community Database Schema

-- Admin profiles table (references auth.users)
CREATE TABLE IF NOT EXISTS public.admin_profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  full_name TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.admin_profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can view all admin profiles" ON public.admin_profiles
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.admin_profiles WHERE id = auth.uid())
  );

CREATE POLICY "Admins can insert their own profile" ON public.admin_profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "Admins can update their own profile" ON public.admin_profiles
  FOR UPDATE USING (auth.uid() = id);

-- Products table
CREATE TABLE IF NOT EXISTS public.products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  price DECIMAL(10,2) NOT NULL,
  image_url TEXT,
  category TEXT NOT NULL,
  stock INTEGER DEFAULT 0,
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;

-- Anyone can view active products
CREATE POLICY "Anyone can view active products" ON public.products
  FOR SELECT USING (active = true);

-- Only admins can manage products
CREATE POLICY "Admins can manage products" ON public.products
  FOR ALL USING (
    EXISTS (SELECT 1 FROM public.admin_profiles WHERE id = auth.uid())
  );

-- Trips table
CREATE TABLE IF NOT EXISTS public.trips (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  destination TEXT NOT NULL,
  image_url TEXT,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  price DECIMAL(10,2) NOT NULL,
  max_participants INTEGER NOT NULL,
  current_participants INTEGER DEFAULT 0,
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.trips ENABLE ROW LEVEL SECURITY;

-- Anyone can view active trips
CREATE POLICY "Anyone can view active trips" ON public.trips
  FOR SELECT USING (active = true);

-- Only admins can manage trips
CREATE POLICY "Admins can manage trips" ON public.trips
  FOR ALL USING (
    EXISTS (SELECT 1 FROM public.admin_profiles WHERE id = auth.uid())
  );

-- Trip registrations
CREATE TABLE IF NOT EXISTS public.trip_registrations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  trip_id UUID NOT NULL REFERENCES public.trips(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT NOT NULL,
  payment_status TEXT DEFAULT 'pending',
  payment_id TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.trip_registrations ENABLE ROW LEVEL SECURITY;

-- Admins can view all registrations
CREATE POLICY "Admins can view all registrations" ON public.trip_registrations
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.admin_profiles WHERE id = auth.uid())
  );

-- Anyone can create a registration
CREATE POLICY "Anyone can create registration" ON public.trip_registrations
  FOR INSERT WITH CHECK (true);

-- Training schedule
CREATE TABLE IF NOT EXISTS public.training_schedule (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  day_of_week INTEGER NOT NULL CHECK (day_of_week >= 0 AND day_of_week <= 6),
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  discipline TEXT NOT NULL,
  location TEXT NOT NULL,
  location_lat DECIMAL(10, 8),
  location_lng DECIMAL(11, 8),
  description TEXT,
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.training_schedule ENABLE ROW LEVEL SECURITY;

-- Anyone can view active schedules
CREATE POLICY "Anyone can view active schedules" ON public.training_schedule
  FOR SELECT USING (active = true);

-- Only admins can manage schedules
CREATE POLICY "Admins can manage schedules" ON public.training_schedule
  FOR ALL USING (
    EXISTS (SELECT 1 FROM public.admin_profiles WHERE id = auth.uid())
  );

-- Orders table for products
CREATE TABLE IF NOT EXISTS public.orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_name TEXT NOT NULL,
  customer_email TEXT NOT NULL,
  customer_phone TEXT NOT NULL,
  shipping_address TEXT NOT NULL,
  total DECIMAL(10,2) NOT NULL,
  status TEXT DEFAULT 'pending',
  payment_id TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;

-- Admins can view all orders
CREATE POLICY "Admins can view all orders" ON public.orders
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.admin_profiles WHERE id = auth.uid())
  );

-- Anyone can create orders
CREATE POLICY "Anyone can create orders" ON public.orders
  FOR INSERT WITH CHECK (true);

-- Admins can update orders
CREATE POLICY "Admins can update orders" ON public.orders
  FOR UPDATE USING (
    EXISTS (SELECT 1 FROM public.admin_profiles WHERE id = auth.uid())
  );

-- Order items
CREATE TABLE IF NOT EXISTS public.order_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES public.products(id),
  quantity INTEGER NOT NULL,
  price DECIMAL(10,2) NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;

-- Admins can view all order items
CREATE POLICY "Admins can view all order items" ON public.order_items
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.admin_profiles WHERE id = auth.uid())
  );

-- Anyone can create order items (when creating an order)
CREATE POLICY "Anyone can create order items" ON public.order_items
  FOR INSERT WITH CHECK (true);

-- Insert sample data for development
INSERT INTO public.training_schedule (day_of_week, start_time, end_time, discipline, location, location_lat, location_lng, description)
VALUES 
  (1, '07:00', '08:30', 'Surf', 'Playa de Palermo', -34.5667, -58.4333, 'Entrenamiento de movimientos básicos de surf'),
  (2, '18:00', '19:30', 'Skate', 'Skatepark Costanera', -34.5478, -58.4514, 'Técnicas de equilibrio y maniobras'),
  (3, '07:00', '08:30', 'SUP', 'Lago de Palermo', -34.5722, -58.4231, 'Stand Up Paddle técnica y resistencia'),
  (4, '18:00', '19:30', 'Surf', 'Playa de Palermo', -34.5667, -58.4333, 'Entrenamiento avanzado'),
  (5, '07:00', '08:30', 'Skate', 'Skatepark Costanera', -34.5478, -58.4514, 'Freestyle y bowl'),
  (6, '09:00', '11:00', 'Mixto', 'Parque 3 de Febrero', -34.5700, -58.4200, 'Entrenamiento grupal todas las disciplinas');

-- Insert sample products
INSERT INTO public.products (name, description, price, category, stock, image_url)
VALUES 
  ('Remera STR Classic', 'Remera de algodón 100% con logo STR', 15000, 'ropa', 50, '/products/remera-classic.jpg'),
  ('Hoodie STR Black', 'Buzo con capucha negro con bordado', 35000, 'ropa', 30, '/products/hoodie-black.jpg'),
  ('Gorra STR Snapback', 'Gorra ajustable con logo bordado', 12000, 'accesorios', 40, '/products/gorra-snapback.jpg'),
  ('Tabla de equilibrio STR', 'Balance board para entrenamiento en casa', 45000, 'equipamiento', 15, '/products/balance-board.jpg');

-- Insert sample trips
INSERT INTO public.trips (title, description, destination, start_date, end_date, price, max_participants, image_url)
VALUES 
  ('Surf Trip Mar del Plata', 'Una semana de surf en las mejores olas de MDQ', 'Mar del Plata, Argentina', '2026-03-15', '2026-03-22', 250000, 20, '/trips/mdq-surf.jpg'),
  ('SUP Experience Tigre', 'Fin de semana de paddle en el Delta', 'Tigre, Buenos Aires', '2026-04-10', '2026-04-12', 85000, 15, '/trips/tigre-sup.jpg'),
  ('Skate Camp Córdoba', 'Skate camp intensivo en las sierras', 'Villa Carlos Paz, Córdoba', '2026-05-01', '2026-05-05', 180000, 25, '/trips/cordoba-skate.jpg');
