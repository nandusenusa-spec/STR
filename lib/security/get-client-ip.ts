import type { NextRequest } from 'next/server'

/**
 * Best-effort client IP for rate limiting (respects common proxy headers).
 */
export function getClientIp(request: NextRequest): string {
  const cf = request.headers.get('cf-connecting-ip')
  if (cf) return cf.trim()

  const forwarded = request.headers.get('x-forwarded-for')
  if (forwarded) {
    const first = forwarded.split(',')[0]?.trim()
    if (first) return first
  }
  const real = request.headers.get('x-real-ip')
  if (real) return real.trim()

  return 'unknown'
}
