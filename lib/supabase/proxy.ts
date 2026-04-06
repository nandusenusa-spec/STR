import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'
import { applySecurityHeaders } from '@/lib/security/http-headers'
import { isBanExemptPath } from '@/lib/security/ban-middleware'

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  })

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim()
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim()

  if (!url || !anonKey) {
    if (process.env.NODE_ENV === 'development') {
      console.warn(
        '[supabase] Faltan NEXT_PUBLIC_SUPABASE_URL o NEXT_PUBLIC_SUPABASE_ANON_KEY. Creá .env.local (copiá desde .env.example) y pegá las claves en https://supabase.com/dashboard/project/_/settings/api',
      )
    }
    return applySecurityHeaders(supabaseResponse)
  }

  // With Fluid compute, don't put this client in a global environment
  // variable. Always create a new one on each request.
  const supabase = createServerClient(
    url,
    anonKey,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value),
          )
          supabaseResponse = NextResponse.next({
            request,
          })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options),
          )
        },
      },
    },
  )

  // Do not run code between createServerClient and
  // supabase.auth.getUser(). A simple mistake could make it very hard to debug
  // issues with users being randomly logged out.

  // IMPORTANT: If you remove getUser() and you use server-side rendering
  // with the Supabase client, your users may be randomly logged out.
  const {
    data: { user },
  } = await supabase.auth.getUser()

  const path = request.nextUrl.pathname

  if (user && !isBanExemptPath(path)) {
    const { data: isBanned, error: banRpcError } = await supabase.rpc(
      'auth_is_user_banned',
    )
    if (banRpcError) {
      if (process.env.NODE_ENV === 'development') {
        console.warn('[ban] auth_is_user_banned:', banRpcError.message)
      }
    } else if (isBanned) {
      if (path.startsWith('/api/')) {
        return applySecurityHeaders(
          NextResponse.json(
            { error: 'Tu acceso a la comunidad fue revocado.' },
            { status: 403 },
          ),
        )
      }
      const deny = NextResponse.redirect(
        new URL('/auth/expulsado', request.url),
      )
      supabaseResponse.cookies.getAll().forEach((c) => {
        deny.cookies.set(c.name, c.value)
      })
      return applySecurityHeaders(deny)
    }
  }

  const needsAuth =
    path.startsWith('/app') ||
    path.startsWith('/admin') ||
    path.startsWith('/portal/dashboard')

  if (needsAuth && !user) {
    const url = request.nextUrl.clone()
    url.pathname = '/auth/login'
    url.searchParams.set('redirect', `${path}${request.nextUrl.search}`)
    return applySecurityHeaders(NextResponse.redirect(url))
  }

  // Solo `admin_profiles` puede usar /admin y /api/admin (RLS: cada uno ve su fila)
  const isAdminPath = path.startsWith('/admin') || path.startsWith('/api/admin')
  if (isAdminPath && user) {
    const { data: adminRow } = await supabase
      .from('admin_profiles')
      .select('id')
      .eq('id', user.id)
      .maybeSingle()

    if (!adminRow) {
      if (path.startsWith('/api/admin')) {
        return applySecurityHeaders(
          NextResponse.json({ error: 'Forbidden' }, { status: 403 }),
        )
      }
      const deny = NextResponse.redirect(new URL('/app?admin=forbidden', request.url))
      supabaseResponse.cookies.getAll().forEach((c) => {
        deny.cookies.set(c.name, c.value)
      })
      return applySecurityHeaders(deny)
    }
  }

  // IMPORTANT: You *must* return the supabaseResponse object as it is.
  // If you're creating a new response object with NextResponse.next() make sure to:
  // 1. Pass the request in it, like so:
  //    const myNewResponse = NextResponse.next({ request })
  // 2. Copy over the cookies, like so:
  //    myNewResponse.cookies.setAll(supabaseResponse.cookies.getAll())
  // 3. Change the myNewResponse object to fit your needs, but avoid changing
  //    the cookies!
  // 4. Finally:
  //    return myNewResponse
  // If this is not done, you may be causing the browser and server to go out
  // of sync and terminate the user's session prematurely!

  return applySecurityHeaders(supabaseResponse)
}
