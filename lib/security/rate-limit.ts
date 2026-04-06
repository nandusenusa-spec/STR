/**
 * Fixed-window in-memory rate limiter (Edge/middleware compatible).
 * For multi-region production, prefer Upstash Redis + @upstash/ratelimit.
 */

type Bucket = { count: number; resetAt: number }

const store = new Map<string, Bucket>()
const MAX_KEYS = 50_000

function pruneIfNeeded() {
  if (store.size < MAX_KEYS) return
  const now = Date.now()
  for (const [k, b] of store) {
    if (now > b.resetAt) store.delete(k)
  }
  if (store.size > MAX_KEYS * 0.9) store.clear()
}

/**
 * @returns true if allowed, false if rate limited
 */
export function checkRateLimit(
  key: string,
  limit: number,
  windowMs: number,
): boolean {
  pruneIfNeeded()
  const now = Date.now()
  const bucket = store.get(key)

  if (!bucket || now > bucket.resetAt) {
    store.set(key, { count: 1, resetAt: now + windowMs })
    return true
  }

  if (bucket.count >= limit) return false
  bucket.count += 1
  return true
}
