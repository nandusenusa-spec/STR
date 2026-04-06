-- Fix infinite recursion in RLS policies
-- The issue is that admin_profiles SELECT policy references itself

-- Drop the problematic policy
DROP POLICY IF EXISTS "Admins can view all admin profiles" ON public.admin_profiles;

-- Create a new policy that doesn't cause recursion
-- Allow users to see their own profile
CREATE POLICY "Users can view own admin profile" ON public.admin_profiles
  FOR SELECT USING (auth.uid() = id);

-- Also allow public read for store_categories (no auth needed)
DROP POLICY IF EXISTS "Anyone can view active categories" ON public.store_categories;
CREATE POLICY "Anyone can view categories" ON public.store_categories
  FOR SELECT USING (true);

-- Fix products policy - allow anyone to view active products without admin check
DROP POLICY IF EXISTS "Anyone can view active products" ON public.products;
CREATE POLICY "Public can view active products" ON public.products
  FOR SELECT USING (active = true);

-- Create separate admin policy for products that doesn't conflict
DROP POLICY IF EXISTS "Admins can manage products" ON public.products;
CREATE POLICY "Admins can insert products" ON public.products
  FOR INSERT WITH CHECK (auth.uid() IN (SELECT id FROM public.admin_profiles));

CREATE POLICY "Admins can update products" ON public.products
  FOR UPDATE USING (auth.uid() IN (SELECT id FROM public.admin_profiles));

CREATE POLICY "Admins can delete products" ON public.products
  FOR DELETE USING (auth.uid() IN (SELECT id FROM public.admin_profiles));

-- Admins should also be able to see inactive products
CREATE POLICY "Admins can view all products" ON public.products
  FOR SELECT USING (
    active = true OR auth.uid() IN (SELECT id FROM public.admin_profiles)
  );
