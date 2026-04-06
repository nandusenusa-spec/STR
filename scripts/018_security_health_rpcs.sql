-- =============================================================================
-- 018_security_health_rpcs.sql
-- Helper RPCs for admin security dashboard / health endpoint.
-- =============================================================================

CREATE OR REPLACE FUNCTION public.security_top_paths_24h(limit_n integer DEFAULT 10)
RETURNS TABLE(path text, events bigint)
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT COALESCE(se.path, '(unknown)') AS path, COUNT(*)::bigint AS events
  FROM public.security_events se
  WHERE se.created_at >= NOW() - INTERVAL '24 hours'
  GROUP BY 1
  ORDER BY events DESC
  LIMIT GREATEST(limit_n, 1)
$$;

CREATE OR REPLACE FUNCTION public.security_top_ips_24h(limit_n integer DEFAULT 10)
RETURNS TABLE(ip_address text, events bigint)
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT COALESCE(se.ip_address, '(unknown)') AS ip_address, COUNT(*)::bigint AS events
  FROM public.security_events se
  WHERE se.created_at >= NOW() - INTERVAL '24 hours'
  GROUP BY 1
  ORDER BY events DESC
  LIMIT GREATEST(limit_n, 1)
$$;

REVOKE ALL ON FUNCTION public.security_top_paths_24h(integer) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.security_top_ips_24h(integer) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.security_top_paths_24h(integer) TO service_role;
GRANT EXECUTE ON FUNCTION public.security_top_ips_24h(integer) TO service_role;
