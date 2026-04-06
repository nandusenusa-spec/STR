import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createServiceClient } from '@/lib/supabase/service'
import { applySecurityHeaders } from '@/lib/security/http-headers'
import type { User } from '@supabase/supabase-js'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

function normalizePhone(raw: string | undefined): string | null {
  if (!raw) return null
  const digits = raw.replace(/\D/g, '')
  return digits.length > 0 ? digits : null
}

function googleSubFromUser(user: User): string | null {
  const ids = user.identities ?? []
  for (const i of ids) {
    if (i.provider !== 'google') continue
    const data = i.identity_data as Record<string, unknown> | undefined
    const sub =
      typeof data?.sub === 'string'
        ? data.sub.trim()
        : typeof data?.provider_id === 'string'
          ? data.provider_id.trim()
          : null
    if (sub) return sub
  }
  return null
}

async function isAdmin() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return { ok: false as const, adminId: null as string | null }

  const { data } = await supabase
    .from('admin_profiles')
    .select('id')
    .eq('id', user.id)
    .maybeSingle()

  if (!data) return { ok: false as const, adminId: null as string | null }
  return { ok: true as const, adminId: user.id }
}

/**
 * Expulsa a un usuario de la comunidad: guarda email, Google sub y teléfono
 * normalizado para bloquear reingresos. Requiere admin.
 */
export async function POST(request: Request) {
  try {
    const gate = await isAdmin()
    if (!gate.ok) {
      return applySecurityHeaders(
        NextResponse.json({ error: 'Unauthorized' }, { status: 401 }),
      )
    }

    let body: {
      user_id?: string
      reason?: string
      phone_norm?: string
    }
    try {
      body = await request.json()
    } catch {
      return applySecurityHeaders(
        NextResponse.json({ error: 'Invalid JSON' }, { status: 400 }),
      )
    }

    const userId = typeof body.user_id === 'string' ? body.user_id.trim() : ''
    if (!userId) {
      return applySecurityHeaders(
        NextResponse.json({ error: 'user_id requerido' }, { status: 400 }),
      )
    }

    const service = createServiceClient()
    const { data: authData, error: authErr } =
      await service.auth.admin.getUserById(userId)

    if (authErr || !authData?.user) {
      return applySecurityHeaders(
        NextResponse.json(
          { error: authErr?.message || 'Usuario no encontrado' },
          { status: 404 },
        ),
      )
    }

    const target = authData.user
    const email = target.email?.trim().toLowerCase()
    if (!email) {
      return applySecurityHeaders(
        NextResponse.json(
          { error: 'El usuario no tiene email' },
          { status: 400 },
        ),
      )
    }

    const googleSub = googleSubFromUser(target)
    const phoneNorm =
      normalizePhone(body.phone_norm) ?? undefined

    const reason =
      typeof body.reason === 'string' && body.reason.trim()
        ? body.reason.trim()
        : null

    const { error: insertErr } = await service.from('community_bans').insert({
      user_id: userId,
      email_norm: email,
      google_sub: googleSub,
      phone_norm: phoneNorm ?? null,
      reason,
      banned_by: gate.adminId,
      metadata: {},
      active: true,
    })

    if (insertErr) {
      console.error('community_bans insert', insertErr)
      return applySecurityHeaders(
        NextResponse.json(
          { error: insertErr.message || 'No se pudo registrar la expulsión' },
          { status: 400 },
        ),
      )
    }

    const { error: banAuthErr } = await service.auth.admin.updateUserById(
      userId,
      { ban_duration: '876000h' },
    )
    if (banAuthErr && process.env.NODE_ENV === 'development') {
      console.warn('[ban-user] auth.admin.updateUserById:', banAuthErr.message)
    }

    return applySecurityHeaders(
      NextResponse.json({
        ok: true,
        email_norm: email,
        google_sub: googleSub,
        phone_norm: phoneNorm ?? null,
        auth_ban: !banAuthErr,
      }),
    )
  } catch (e) {
    console.error('ban-user', e)
    return applySecurityHeaders(
      NextResponse.json({ error: 'Internal server error' }, { status: 500 }),
    )
  }
}
