import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'
import { subscribeBodySchema } from '@/lib/validation/api-schemas'
import { sanitizeInstagramHandle, sanitizeText } from '@/lib/security/sanitize'
import { blockUnexpectedOrigin } from '@/lib/security/api-origin'
import { applySecurityHeaders } from '@/lib/security/http-headers'
import { getClientIp } from '@/lib/security/get-client-ip'
import { logSecurityEvent } from '@/lib/security/event-log'

const MAX_BODY = 32_000

export async function POST(request: NextRequest) {
  const ip = getClientIp(request)
  const path = request.nextUrl.pathname
  const originBlock = blockUnexpectedOrigin(request)
  if (originBlock) {
    await logSecurityEvent({
      event_type: 'api_forbidden_origin',
      severity: 'warning',
      ip,
      path,
    })
    return applySecurityHeaders(originBlock)
  }

  try {
    const raw = await request.text()
    if (raw.length > MAX_BODY) {
      await logSecurityEvent({
        event_type: 'api_payload_too_large',
        severity: 'warning',
        ip,
        path,
        details: { endpoint: 'subscribe' },
      })
      return applySecurityHeaders(
        NextResponse.json({ error: 'Solicitud demasiado grande' }, { status: 413 }),
      )
    }

    let parsed: unknown
    try {
      parsed = JSON.parse(raw)
    } catch {
      await logSecurityEvent({
        event_type: 'api_invalid_json',
        severity: 'warning',
        ip,
        path,
        details: { endpoint: 'subscribe' },
      })
      return applySecurityHeaders(
        NextResponse.json({ error: 'JSON inválido' }, { status: 400 }),
      )
    }

    const parsedBody = subscribeBodySchema.safeParse(parsed)
    if (!parsedBody.success) {
      await logSecurityEvent({
        event_type: 'subscribe_validation_failed',
        severity: 'warning',
        ip,
        path,
      })
      return applySecurityHeaders(
        NextResponse.json({ error: 'Datos inválidos' }, { status: 400 }),
      )
    }

    const { subscription_type } = parsedBody.data
    const instagram = sanitizeInstagramHandle(parsedBody.data.instagram_username)
    if (!instagram || instagram.length < 2) {
      await logSecurityEvent({
        event_type: 'subscribe_invalid_instagram',
        severity: 'warning',
        ip,
        path,
      })
      return applySecurityHeaders(
        NextResponse.json({ error: 'Instagram inválido' }, { status: 400 }),
      )
    }

    const phone = sanitizeText(parsedBody.data.whatsapp_phone, 32).replace(
      /[^\d+\s-]/g,
      '',
    )
    if (phone.length < 6) {
      await logSecurityEvent({
        event_type: 'subscribe_invalid_phone',
        severity: 'warning',
        ip,
        path,
      })
      return applySecurityHeaders(
        NextResponse.json({ error: 'WhatsApp inválido' }, { status: 400 }),
      )
    }

    const supabase = await createClient()

    const { error } = await supabase.from('subscriptions').insert({
      instagram_username: instagram,
      phone,
      subscription_type,
      status: 'pending',
    })

    if (error) {
      if (error.code === '23505') {
        return applySecurityHeaders(
          NextResponse.json(
            { error: 'Ya estás registrado con este Instagram' },
            { status: 400 },
          ),
        )
      }
      console.error('Supabase error:', error)
      throw error
    }

    return applySecurityHeaders(NextResponse.json({ success: true }))
  } catch (error) {
    console.error('Subscription error:', error)
    return applySecurityHeaders(
      NextResponse.json({ error: 'Error al procesar el registro' }, { status: 500 }),
    )
  }
}
