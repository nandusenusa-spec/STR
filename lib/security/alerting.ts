import { createServiceClient } from '@/lib/supabase/service'

type AlertPayload = {
  title: string
  severity: 'warning' | 'critical'
  eventType: string
  path?: string | null
  ip?: string | null
  details?: Record<string, unknown>
  burstCount?: number
}

function toText(p: AlertPayload): string {
  const lines = [
    `🚨 ${p.title}`,
    `Severidad: ${p.severity.toUpperCase()}`,
    `Evento: ${p.eventType}`,
  ]
  if (p.path) lines.push(`Path: ${p.path}`)
  if (p.ip) lines.push(`IP: ${p.ip}`)
  if (typeof p.burstCount === 'number') lines.push(`Repeticiones: ${p.burstCount}`)
  if (p.details && Object.keys(p.details).length > 0) {
    lines.push(`Detalles: ${JSON.stringify(p.details)}`)
  }
  lines.push(`Timestamp: ${new Date().toISOString()}`)
  return lines.join('\n')
}

async function sendWebhook(message: string): Promise<boolean> {
  const url = process.env.SECURITY_ALERT_WEBHOOK_URL
  if (!url) return false

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  }
  if (process.env.SECURITY_ALERT_WEBHOOK_BEARER) {
    headers.Authorization = `Bearer ${process.env.SECURITY_ALERT_WEBHOOK_BEARER}`
  }

  const res = await fetch(url, {
    method: 'POST',
    headers,
    body: JSON.stringify({ text: message }),
  })
  return res.ok
}

export async function emitSecurityAlert(
  payload: AlertPayload,
): Promise<{ sent: boolean; responseOk: boolean }> {
  let responseOk = false
  try {
    responseOk = await sendWebhook(toText(payload))
  } catch {
    responseOk = false
  }

  try {
    const supabase = createServiceClient()
    await supabase.from('security_alerts').insert({
      event_type: payload.eventType,
      severity: payload.severity,
      path: payload.path || null,
      ip_address: payload.ip || null,
      details: payload.details || {},
      delivered: responseOk,
      delivered_at: responseOk ? new Date().toISOString() : null,
      channel: process.env.SECURITY_ALERT_WEBHOOK_URL ? 'webhook' : 'none',
    })
  } catch {
    // ignore persistence errors
  }

  return { sent: !!process.env.SECURITY_ALERT_WEBHOOK_URL, responseOk }
}
