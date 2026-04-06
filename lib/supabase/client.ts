import { createBrowserClient } from '@supabase/ssr'

/** Allows `next build` / RSC prerender when env is not set; replace with real .env locally. */
const PLACEHOLDER_URL = 'https://placeholder.supabase.co'
const PLACEHOLDER_ANON =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJyb2xlIjoiYW5vbiJ9.placeholder'

export function createClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (url && key) {
    return createBrowserClient(url, key)
  }

  if (typeof window !== 'undefined') {
    console.error(
      'Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY — add them to .env.local',
    )
  }

  return createBrowserClient(PLACEHOLDER_URL, PLACEHOLDER_ANON)
}
