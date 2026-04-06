import { createHmac, timingSafeEqual } from 'crypto'
import type { NextRequest } from 'next/server'

/**
 * Mercado Pago webhook signature (x-signature header).
 * @see https://www.mercadopago.com.ar/developers/en/docs/your-integrations/notifications/webhooks
 */
export function verifyMercadoPagoWebhook(
  request: NextRequest,
  rawBody: string,
  secret: string,
): boolean {
  const sigHeader = request.headers.get('x-signature') || request.headers.get('X-Signature')
  const requestId =
    request.headers.get('x-request-id') || request.headers.get('X-Request-Id') || ''

  if (!sigHeader) return false

  let ts = ''
  let v1 = ''
  for (const part of sigHeader.split(',')) {
    const [k, v] = part.split('=').map((s) => s.trim())
    if (k === 'ts') ts = v || ''
    if (k === 'v1') v1 = v || ''
  }
  if (!ts || !v1) return false

  let dataId = ''
  try {
    const j = JSON.parse(rawBody) as { data?: { id?: string } }
    dataId = j?.data?.id != null ? String(j.data.id) : ''
  } catch {
    return false
  }

  const manifest = `id:${dataId};request-id:${requestId};ts:${ts};`
  const expected = createHmac('sha256', secret).update(manifest).digest('hex')

  try {
    const a = Buffer.from(v1, 'hex')
    const b = Buffer.from(expected, 'hex')
    return a.length === b.length && timingSafeEqual(a, b)
  } catch {
    return false
  }
}
