import { createServiceClient } from '@/lib/supabase/service'
import { emitSecurityAlert } from '@/lib/security/alerting'

export type SecuritySeverity = 'info' | 'warning' | 'critical'

export async function logSecurityEvent(input: {
  event_type: string
  severity?: SecuritySeverity
  ip?: string | null
  path?: string | null
  details?: Record<string, unknown> | null
}) {
  try {
    const supabase = createServiceClient()
    const severity = input.severity || 'warning'
    await supabase.from('security_events').insert({
      event_type: input.event_type,
      severity,
      ip_address: input.ip || null,
      path: input.path || null,
      details: input.details || {},
    })

    // Alerting strategy:
    // - Critical events: immediate alert.
    // - Warning bursts: alert if threshold exceeded in short window.
    if (severity === 'critical') {
      await emitSecurityAlert({
        title: 'Evento critico de seguridad',
        severity,
        eventType: input.event_type,
        ip: input.ip || null,
        path: input.path || null,
        details: input.details || {},
      })
      return
    }

    if (severity === 'warning') {
      const windowMinutes = Number(process.env.SECURITY_WARNING_WINDOW_MINUTES || '10')
      const threshold = Number(process.env.SECURITY_WARNING_BURST_THRESHOLD || '25')
      const since = new Date(Date.now() - windowMinutes * 60_000).toISOString()

      let countQuery = supabase
        .from('security_events')
        .select('id', { count: 'exact', head: true })
        .eq('event_type', input.event_type)
        .eq('severity', 'warning')
        .gte('created_at', since)

      if (input.path) countQuery = countQuery.eq('path', input.path)

      const { count } = await countQuery
      const burst = count || 0

      if (burst >= threshold) {
        await emitSecurityAlert({
          title: 'Rafaga de eventos de seguridad',
          severity: 'warning',
          eventType: input.event_type,
          ip: input.ip || null,
          path: input.path || null,
          details: input.details || {},
          burstCount: burst,
        })
      }
    }
  } catch {
    // Never break user flow for logging failures.
  }
}
