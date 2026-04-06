/** Remove null bytes and trim; cap length to reduce abuse. */
export function sanitizeText(input: string, maxLen: number): string {
  return input.replace(/\0/g, '').trim().slice(0, maxLen)
}

/** Instagram-style handle: letters, numbers, underscore, dot */
export function sanitizeInstagramHandle(raw: string): string {
  const s = raw.replace(/^@/, '').toLowerCase().replace(/[^a-z0-9._]/g, '')
  return s.slice(0, 30)
}
