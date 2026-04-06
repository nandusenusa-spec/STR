-- =============================================================================
-- 016_security_events.sql
-- Security telemetry for suspicious activity and operational alerting.
-- =============================================================================

CREATE TABLE IF NOT EXISTS public.security_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_type TEXT NOT NULL,
  severity TEXT NOT NULL DEFAULT 'warning',
  ip_address TEXT,
  path TEXT,
  details JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_security_events_created_at
  ON public.security_events(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_security_events_event_type
  ON public.security_events(event_type);
CREATE INDEX IF NOT EXISTS idx_security_events_severity
  ON public.security_events(severity);

ALTER TABLE public.security_events ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Admins can view security events" ON public.security_events;
CREATE POLICY "Admins can view security events" ON public.security_events
  FOR SELECT USING (
    auth.uid() IN (SELECT id FROM public.admin_profiles)
  );

DROP POLICY IF EXISTS "No direct security event insert" ON public.security_events;
CREATE POLICY "No direct security event insert" ON public.security_events
  FOR INSERT WITH CHECK (false);
