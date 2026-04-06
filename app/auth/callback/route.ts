import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

const PLACEHOLDER_URL = 'https://placeholder.supabase.co'
const PLACEHOLDER_ANON =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJyb2xlIjoiYW5vbiJ9.placeholder'

export const runtime = 'nodejs'

/**
 * OAuth (Google) vuelve aquí con ?code= — intercambio PKCE y cookies de sesión.
 * Supabase Dashboard → Auth → URL Configuration: agregar https://TU_DOMINIO/auth/callback
 */
export async function GET(request: NextRequest) {
  const urlEnv = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim()
  const keyEnv = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim()
  const supabaseUrl = urlEnv && keyEnv ? urlEnv : PLACEHOLDER_URL
  const supabaseKey = urlEnv && keyEnv ? keyEnv : PLACEHOLDER_ANON

  const origin = request.nextUrl.origin
  const code = request.nextUrl.searchParams.get('code')
  const nextRaw = request.nextUrl.searchParams.get('next')
  const safeNext =
    nextRaw && nextRaw.startsWith('/') && !nextRaw.startsWith('//') ? nextRaw : '/app'

  if (!code) {
    return NextResponse.redirect(`${origin}/auth/login`)
  }

  let response = NextResponse.redirect(`${origin}${safeNext}`)

  const supabase = createServerClient(supabaseUrl, supabaseKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll()
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value, options }) =>
          response.cookies.set(name, value, options),
        )
      },
    },
  })

  const { error } = await supabase.auth.exchangeCodeForSession(code)

  if (error) {
    return NextResponse.redirect(
      `${origin}/auth/error?error=${encodeURIComponent(error.message)}`,
    )
  }

  const { data: isBanned, error: banRpcError } = await supabase.rpc(
    'auth_is_user_banned',
  )
  if (banRpcError && process.env.NODE_ENV === 'development') {
    console.warn('[ban] auth_is_user_banned:', banRpcError.message)
  }
  if (!banRpcError && isBanned) {
    response = NextResponse.redirect(`${origin}/auth/expulsado`)
    await supabase.auth.signOut()
    return response
  }

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (user) {
    const configured = (
      process.env.NEXT_PUBLIC_ADMIN_EMAILS ||
      process.env.NEXT_PUBLIC_ADMIN_EMAIL ||
      ''
    )
      .split(',')
      .map((v) => v.trim().toLowerCase())
      .filter(Boolean)
    const email = user.email?.trim().toLowerCase()
    if (email && configured.length > 0 && configured.includes(email)) {
      await supabase.from('admin_profiles').upsert({
        id: user.id,
        email,
        full_name: email.split('@')[0],
      })
    }
  }

  return response
}
