import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get('code')
  const next = requestUrl.searchParams.get('next') || '/app'

  if (code) {
    const supabase = await createClient()
    const { error } = await supabase.auth.exchangeCodeForSession(code)
    
    if (!error) {
      // Redirect to the next URL or default to /app
      const redirectUrl = next.startsWith('/') && !next.startsWith('//') ? next : '/app'
      return NextResponse.redirect(new URL(redirectUrl, requestUrl.origin))
    }
  }

  // If there's an error or no code, redirect to login with error
  return NextResponse.redirect(new URL('/auth/login?error=auth_failed', requestUrl.origin))
}
