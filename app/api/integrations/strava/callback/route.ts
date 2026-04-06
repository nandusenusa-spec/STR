import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

type StravaTokenResponse = {
  athlete?: { id?: number }
}

export async function GET(request: NextRequest) {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
  const code = request.nextUrl.searchParams.get('code')
  const oauthError = request.nextUrl.searchParams.get('error')

  if (oauthError || !code) {
    return NextResponse.redirect(
      new URL('/app/profile?integration=strava&status=error', appUrl),
    )
  }

  const clientId = process.env.STRAVA_CLIENT_ID
  const clientSecret = process.env.STRAVA_CLIENT_SECRET
  if (!clientId || !clientSecret) {
    return NextResponse.redirect(
      new URL('/app/profile?integration=strava&status=error', appUrl),
    )
  }

  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.redirect(
      new URL('/auth/login?redirect=%2Fapp%2Fprofile', appUrl),
    )
  }

  const tokenRes = await fetch('https://www.strava.com/oauth/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      client_id: clientId,
      client_secret: clientSecret,
      code,
      grant_type: 'authorization_code',
    }),
  })

  if (!tokenRes.ok) {
    return NextResponse.redirect(
      new URL('/app/profile?integration=strava&status=error', appUrl),
    )
  }

  const payload = (await tokenRes.json()) as StravaTokenResponse
  const athleteId = payload.athlete?.id ? String(payload.athlete.id) : null

  const { error } = await supabase.from('surfer_biometrics').upsert({
    user_id: user.id,
    strava_connected: true,
    strava_athlete_id: athleteId,
  })

  if (error) {
    return NextResponse.redirect(
      new URL('/app/profile?integration=strava&status=error', appUrl),
    )
  }

  return NextResponse.redirect(
    new URL('/app/profile?integration=strava&status=connected', appUrl),
  )
}

