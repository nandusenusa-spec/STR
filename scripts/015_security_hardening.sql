-- =============================================================================
-- 015_security_hardening.sql
-- Extra hardening: constraints + audit log for sensitive tables.
-- =============================================================================

-- ---- Basic data integrity constraints
ALTER TABLE public.orders
  ADD CONSTRAINT orders_total_non_negative CHECK (total >= 0) NOT VALID;
ALTER TABLE public.orders
  VALIDATE CONSTRAINT orders_total_non_negative;

ALTER TABLE public.order_items
  ADD CONSTRAINT order_items_quantity_positive CHECK (quantity > 0) NOT VALID;
ALTER TABLE public.order_items
  VALIDATE CONSTRAINT order_items_quantity_positive;

ALTER TABLE public.order_items
  ADD CONSTRAINT order_items_price_non_negative CHECK (price >= 0) NOT VALID;
ALTER TABLE public.order_items
  VALIDATE CONSTRAINT order_items_price_non_negative;

ALTER TABLE public.products
  ADD CONSTRAINT products_price_non_negative CHECK (price >= 0) NOT VALID;
ALTER TABLE public.products
  VALIDATE CONSTRAINT products_price_non_negative;

ALTER TABLE public.products
  ADD CONSTRAINT products_stock_non_negative CHECK (stock >= 0) NOT VALID;
ALTER TABLE public.products
  VALIDATE CONSTRAINT products_stock_non_negative;

-- ---- Audit log for sensitive changes
CREATE TABLE IF NOT EXISTS public.audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  table_name TEXT NOT NULL,
  operation TEXT NOT NULL,
  row_id TEXT,
  actor_id UUID,
  old_data JSONB,
  new_data JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_audit_logs_created_at ON public.audit_logs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_audit_logs_table_name ON public.audit_logs(table_name);
CREATE INDEX IF NOT EXISTS idx_audit_logs_actor_id ON public.audit_logs(actor_id);

ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Admins can view audit logs" ON public.audit_logs;
CREATE POLICY "Admins can view audit logs" ON public.audit_logs
  FOR SELECT USING (
    auth.uid() IN (SELECT id FROM public.admin_profiles)
  );

-- No direct writes; only via trigger function (security definer)
DROP POLICY IF EXISTS "No direct audit writes" ON public.audit_logs;
CREATE POLICY "No direct audit writes" ON public.audit_logs
  FOR INSERT WITH CHECK (false);

CREATE OR REPLACE FUNCTION public.audit_sensitive_changes()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_row_id TEXT;
BEGIN
  IF TG_OP = 'INSERT' THEN
    v_row_id := COALESCE(NEW.id::text, NULL);
    INSERT INTO public.audit_logs(table_name, operation, row_id, actor_id, old_data, new_data)
    VALUES (TG_TABLE_NAME, TG_OP, v_row_id, auth.uid(), NULL, to_jsonb(NEW));
    RETURN NEW;
  ELSIF TG_OP = 'UPDATE' THEN
    v_row_id := COALESCE(NEW.id::text, OLD.id::text, NULL);
    INSERT INTO public.audit_logs(table_name, operation, row_id, actor_id, old_data, new_data)
    VALUES (TG_TABLE_NAME, TG_OP, v_row_id, auth.uid(), to_jsonb(OLD), to_jsonb(NEW));
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    v_row_id := COALESCE(OLD.id::text, NULL);
    INSERT INTO public.audit_logs(table_name, operation, row_id, actor_id, old_data, new_data)
    VALUES (TG_TABLE_NAME, TG_OP, v_row_id, auth.uid(), to_jsonb(OLD), NULL);
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$;

DROP TRIGGER IF EXISTS trg_audit_orders ON public.orders;
CREATE TRIGGER trg_audit_orders
AFTER INSERT OR UPDATE OR DELETE ON public.orders
FOR EACH ROW EXECUTE FUNCTION public.audit_sensitive_changes();

DROP TRIGGER IF EXISTS trg_audit_products ON public.products;
CREATE TRIGGER trg_audit_products
AFTER INSERT OR UPDATE OR DELETE ON public.products
FOR EACH ROW EXECUTE FUNCTION public.audit_sensitive_changes();

DROP TRIGGER IF EXISTS trg_audit_subscriptions ON public.subscriptions;
CREATE TRIGGER trg_audit_subscriptions
AFTER INSERT OR UPDATE OR DELETE ON public.subscriptions
FOR EACH ROW EXECUTE FUNCTION public.audit_sensitive_changes();

DROP TRIGGER IF EXISTS trg_audit_trips ON public.trips;
CREATE TRIGGER trg_audit_trips
AFTER INSERT OR UPDATE OR DELETE ON public.trips
FOR EACH ROW EXECUTE FUNCTION public.audit_sensitive_changes();
