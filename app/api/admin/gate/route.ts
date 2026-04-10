import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { createClient } from '@/lib/supabase/server'
import { blockUnexpectedOrigin } from '@/lib/security/api-origin'
import { applySecurityHeaders } from '@/lib/security/http-headers'

const COOKIE = 'str_admin_gate'
const MAX_AGE = 60 * 60 * 24 * 7

function expectedPassword(): string {
  return (process.env.ADMIN_PANEL_PASSWORD || 'str2026').trim()
}

/** Comprueba si la cookie de acceso al panel admin está presente (httpOnly). */
export async function GET() {
  const jar = await cookies()
  const ok = jar.get(COOKIE)?.value === '1'
  return applySecurityHeaders(NextResponse.json({ ok }))
}

export async function POST(request: NextRequest) {
  const originBlock = blockUnexpectedOrigin(request)
  if (originBlock) return applySecurityHeaders(originBlock)

  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) {
    return applySecurityHeaders(NextResponse.json({ error: 'No autenticado' }, { status: 401 }))
  }
  const { data: adminRow } = await supabase
    .from('admin_profiles')
    .select('id')
    .eq('id', user.id)
    .maybeSingle()
  if (!adminRow) {
    return applySecurityHeaders(NextResponse.json({ error: 'Forbidden' }, { status: 403 }))
  }

  let body: { password?: string }
  try {
    body = await request.json()
  } catch {
    return applySecurityHeaders(NextResponse.json({ error: 'JSON inválido' }, { status: 400 }))
  }

  const password = typeof body.password === 'string' ? body.password : ''
  if (password !== expectedPassword()) {
    return applySecurityHeaders(
      NextResponse.json({ error: 'Clave incorrecta' }, { status: 401 }),
    )
  }

  const res = applySecurityHeaders(NextResponse.json({ ok: true }))
  res.cookies.set(COOKIE, '1', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: MAX_AGE,
    path: '/admin',
  })
  return res
}

export async function DELETE(request: NextRequest) {
  const originBlock = blockUnexpectedOrigin(request)
  if (originBlock) return applySecurityHeaders(originBlock)

  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) {
    return applySecurityHeaders(NextResponse.json({ error: 'No autenticado' }, { status: 401 }))
  }
  const { data: adminRow } = await supabase
    .from('admin_profiles')
    .select('id')
    .eq('id', user.id)
    .maybeSingle()
  if (!adminRow) {
    return applySecurityHeaders(NextResponse.json({ error: 'Forbidden' }, { status: 403 }))
  }

  const res = applySecurityHeaders(NextResponse.json({ ok: true }))
  res.cookies.set(COOKIE, '', { path: '/admin', maxAge: 0 })
  return res
}
