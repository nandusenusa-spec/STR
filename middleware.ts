import { type NextRequest, NextResponse } from 'next/server'
import { updateSession } from '@/lib/supabase/proxy'
import { getClientIp } from '@/lib/security/get-client-ip'
import { checkRateLimitGlobal } from '@/lib/security/rate-limit-distributed'
import { applySecurityHeaders } from '@/lib/security/http-headers'

export async function middleware(request: NextRequest) {
  const ip = getClientIp(request)
  const path = request.nextUrl.pathname
  const method = request.method

  if (method === 'POST' && path.startsWith('/api/checkout')) {
    if (!(await checkRateLimitGlobal(`checkout:${ip}`, 25, 60_000))) {
      return applySecurityHeaders(
        NextResponse.json(
          { error: 'Demasiados intentos. Probá de nuevo en un minuto.' },
          { status: 429 },
        ),
      )
    }
  }

  if (method === 'POST' && path.startsWith('/api/subscribe')) {
    if (!(await checkRateLimitGlobal(`subscribe:${ip}`, 20, 60_000))) {
      return applySecurityHeaders(
        NextResponse.json(
          { error: 'Demasiados intentos. Probá de nuevo en un minuto.' },
          { status: 429 },
        ),
      )
    }
  }

  if (method === 'POST' && path.startsWith('/api/webhooks/mercadopago')) {
    if (!(await checkRateLimitGlobal(`mpwh:${ip}`, 120, 60_000))) {
      return applySecurityHeaders(NextResponse.json({ received: true }, { status: 429 }))
    }
  }

  return updateSession(request)
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
