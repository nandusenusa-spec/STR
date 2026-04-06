/**
 * Rutas que pueden verse aunque la cuenta esté expulsada (solo flujo de auth / webhooks).
 */
export function isBanExemptPath(path: string): boolean {
  if (path.startsWith('/_next')) return true
  if (path.startsWith('/api/webhooks/')) return true
  const exact = ['/auth/expulsado', '/auth/callback', '/auth/error']
  if (exact.some((e) => path === e)) return true
  if (path.startsWith('/auth/callback/') || path.startsWith('/auth/error/')) return true
  return false
}
