# Security Runbook (Comunidad)

## 1) Required SQL migrations

Run in Supabase SQL editor, in order:

1. `scripts/015_security_hardening.sql`
2. `scripts/016_security_events.sql`
3. `scripts/017_security_alerts.sql`
4. `scripts/018_security_health_rpcs.sql`

## 2) Required environment variables

Minimum:

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `NEXT_PUBLIC_APP_URL`
- `MERCADOPAGO_ACCESS_TOKEN`
- `MERCADOPAGO_WEBHOOK_SECRET` (mandatory in production)

Recommended:

- `UPSTASH_REDIS_REST_URL`
- `UPSTASH_REDIS_REST_TOKEN`
- `SECURITY_ALERT_WEBHOOK_URL`
- `SECURITY_ALERT_WEBHOOK_BEARER`
- `SECURITY_WARNING_WINDOW_MINUTES`
- `SECURITY_WARNING_BURST_THRESHOLD`

## 3) Monitoring surfaces

- Admin dashboard: `/admin/security`
- JSON health endpoint: `/api/admin/security/health` (admin-only)

Status in health endpoint:

- `green`: normal
- `yellow`: warning burst above threshold
- `red`: at least one critical event or failed alert delivery

## 4) Incident response quick checklist

1. Open `/admin/security`
2. Inspect:
   - `critical` events in last 24h
   - repeated `checkout_total_mismatch`
   - repeated `webhook_signature_invalid`
3. Call `/api/admin/security/health` and review `top_ips_24h` / `top_paths_24h`
4. If abuse is active:
   - block IP at edge/WAF (Cloudflare/Vercel firewall)
   - tighten rate limits
   - rotate secrets if needed (`MERCADOPAGO_WEBHOOK_SECRET`, service key)
5. Verify alert delivery in `security_alerts` table (`delivered = true`)

## 5) Common event meanings

- `checkout_total_mismatch`: manipulated cart/payment payload
- `api_forbidden_origin`: cross-site attempt against API
- `webhook_signature_invalid`: forged/invalid payment webhook
- `webhook_secret_missing`: unsafe production config

