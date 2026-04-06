import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createServiceClient } from '@/lib/supabase/service'
import { applySecurityHeaders } from '@/lib/security/http-headers'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

async function isAdmin() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return false

  const { data } = await supabase
    .from('admin_profiles')
    .select('id')
    .eq('id', user.id)
    .maybeSingle()

  return !!data
}

export async function GET() {
  try {
    if (!(await isAdmin())) {
      return applySecurityHeaders(
        NextResponse.json({ error: 'Unauthorized' }, { status: 401 }),
      )
    }

    const supabase = createServiceClient()
    const since24 = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()
    const since1h = new Date(Date.now() - 60 * 60 * 1000).toISOString()

    const [
      critical24,
      warning24,
      alertsFailed24,
      eventsRecent,
      topPaths,
      topIps,
      alertBurstsHour,
    ] = await Promise.all([
      supabase
        .from('security_events')
        .select('id', { count: 'exact', head: true })
        .eq('severity', 'critical')
        .gte('created_at', since24),
      supabase
        .from('security_events')
        .select('id', { count: 'exact', head: true })
        .eq('severity', 'warning')
        .gte('created_at', since24),
      supabase
        .from('security_alerts')
        .select('id', { count: 'exact', head: true })
        .eq('delivered', false)
        .gte('created_at', since24),
      supabase
        .from('security_events')
        .select('event_type, severity, path, ip_address, created_at')
        .order('created_at', { ascending: false })
        .limit(25),
      supabase.rpc('security_top_paths_24h'),
      supabase.rpc('security_top_ips_24h'),
      supabase
        .from('security_events')
        .select('id', { count: 'exact', head: true })
        .eq('severity', 'warning')
        .gte('created_at', since1h),
    ])

    const status =
      (critical24.count || 0) > 0 || (alertsFailed24.count || 0) > 0
        ? 'red'
        : (warning24.count || 0) > Number(process.env.SECURITY_WARNING_BURST_THRESHOLD || '25')
          ? 'yellow'
          : 'green'

    return applySecurityHeaders(
      NextResponse.json({
        status,
        generated_at: new Date().toISOString(),
        metrics: {
          critical_24h: critical24.count || 0,
          warning_24h: warning24.count || 0,
          failed_alerts_24h: alertsFailed24.count || 0,
          warning_1h: alertBurstsHour.count || 0,
        },
        top_paths_24h: topPaths.data || [],
        top_ips_24h: topIps.data || [],
        recent_events: eventsRecent.data || [],
      }),
    )
  } catch (e) {
    console.error('security health error', e)
    return applySecurityHeaders(
      NextResponse.json({ error: 'Internal server error' }, { status: 500 }),
    )
  }
}
