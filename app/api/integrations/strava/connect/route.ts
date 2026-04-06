import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.redirect(
      new URL('/auth/login?redirect=%2Fapp%2Fprofile', process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'),
    )
  }

  const clientId = process.env.STRAVA_CLIENT_ID
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'

  if (!clientId) {
    return NextResponse.redirect(
      new URL('/app/profile?integration=strava&status=error', appUrl),
    )
  }

  const callbackUrl = `${appUrl}/api/integrations/strava/callback`
  const authUrl =
    `https://www.strava.com/oauth/authorize?client_id=${encodeURIComponent(clientId)}` +
    `&response_type=code&redirect_uri=${encodeURIComponent(callbackUrl)}` +
    `&approval_prompt=auto&scope=read,activity:read_all`

  return NextResponse.redirect(authUrl)
}

