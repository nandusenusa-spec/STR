-- Migration: Change email to Instagram + WhatsApp

-- Drop old subscriptions table and recreate with new fields
DROP TABLE IF EXISTS public.subscriptions CASCADE;

CREATE TABLE public.subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  instagram_username TEXT NOT NULL,
  phone TEXT NOT NULL,
  full_name TEXT,
  subscription_type TEXT NOT NULL CHECK (subscription_type IN ('classes', 'trip')),
  trip_id UUID REFERENCES public.trips(id) ON DELETE SET NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  admin_notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  approved_at TIMESTAMPTZ,
  approved_by UUID
);

-- Enable RLS
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Anyone can insert subscriptions" ON public.subscriptions 
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Admins can view all subscriptions" ON public.subscriptions 
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.admin_profiles WHERE id = auth.uid())
  );

CREATE POLICY "Admins can update subscriptions" ON public.subscriptions 
  FOR UPDATE USING (
    EXISTS (SELECT 1 FROM public.admin_profiles WHERE id = auth.uid())
  );

CREATE POLICY "Admins can delete subscriptions" ON public.subscriptions 
  FOR DELETE USING (
    EXISTS (SELECT 1 FROM public.admin_profiles WHERE id = auth.uid())
  );

-- Create index for faster queries
CREATE INDEX idx_subscriptions_status ON public.subscriptions(status);
CREATE INDEX idx_subscriptions_type ON public.subscriptions(subscription_type);
CREATE INDEX idx_subscriptions_trip ON public.subscriptions(trip_id);

-- Function to update updated_at
CREATE OR REPLACE FUNCTION update_subscription_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS subscriptions_updated_at ON public.subscriptions;
CREATE TRIGGER subscriptions_updated_at
  BEFORE UPDATE ON public.subscriptions
  FOR EACH ROW
  EXECUTE FUNCTION update_subscription_timestamp();
