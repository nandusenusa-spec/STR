import { checkRateLimit } from '@/lib/security/rate-limit'

async function upstashIncr(key: string): Promise<number | null> {
  const url = process.env.UPSTASH_REDIS_REST_URL
  const token = process.env.UPSTASH_REDIS_REST_TOKEN
  if (!url || !token) return null

  const res = await fetch(`${url}/incr/${encodeURIComponent(key)}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
    cache: 'no-store',
  })
  if (!res.ok) return null
  const body = (await res.json()) as { result?: number }
  return typeof body.result === 'number' ? body.result : null
}

async function upstashExpire(key: string, ttlSeconds: number): Promise<void> {
  const url = process.env.UPSTASH_REDIS_REST_URL
  const token = process.env.UPSTASH_REDIS_REST_TOKEN
  if (!url || !token) return
  await fetch(`${url}/expire/${encodeURIComponent(key)}/${ttlSeconds}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
    cache: 'no-store',
  })
}

/**
 * Distributed limiter when Upstash env vars exist, otherwise in-memory fallback.
 */
export async function checkRateLimitGlobal(
  key: string,
  limit: number,
  windowMs: number,
): Promise<boolean> {
  const ttlSeconds = Math.max(1, Math.ceil(windowMs / 1000))
  const count = await upstashIncr(key)
  if (count === null) {
    return checkRateLimit(key, limit, windowMs)
  }
  if (count === 1) {
    await upstashExpire(key, ttlSeconds)
  }
  return count <= limit
}
