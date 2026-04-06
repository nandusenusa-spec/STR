import { NextRequest, NextResponse } from 'next/server'

/**
 * Blocks cross-site POST to APIs when Origin is present and does not match the app URL.
 * Login/signup use Supabase client-side; configure Supabase dashboard rate limits + CAPTCHA there.
 */
export function blockUnexpectedOrigin(request: NextRequest): NextResponse | null {
  if (request.method !== 'POST' && request.method !== 'PUT' && request.method !== 'PATCH') {
    return null
  }
  const origin = request.headers.get('origin')
  if (!origin) return null

  const base = process.env.NEXT_PUBLIC_APP_URL?.replace(/\/$/, '')
  if (!base) return null

  if (origin === base) return null

  if (process.env.NODE_ENV === 'development' && origin.startsWith('http://localhost')) {
    return null
  }

  return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
}
