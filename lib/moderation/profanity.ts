/**
 * Moderación de texto por lista de términos (es/en).
 * No es lingüística avanzada: ampliá la lista o usá MODERATION_EXTRA_TERMS en el servidor.
 */

const EXTRA_FROM_ENV = () =>
  (process.env.MODERATION_EXTRA_TERMS || '')
    .split(',')
    .map((s) => s.trim().toLowerCase())
    .filter(Boolean)

/** Términos comunes (minúsculas, sin acentos en la lista; se normaliza el input). */
const BASE_BLOCKLIST = [
  'puta',
  'puto',
  'putas',
  'putos',
  'mierda',
  'joder',
  'hostia',
  'cabrón',
  'cabron',
  'coño',
  'cono',
  'gilipollas',
  'imbécil',
  'imbecil',
  'idiota',
  'estúpido',
  'estupido',
  'mamón',
  'mamon',
  'maricón',
  'maricon',
  'hijoputa',
  'hijo de puta',
  'fuck',
  'fucking',
  'shit',
  'bitch',
  'asshole',
  'bastard',
  'cunt',
  'dick',
  'pussy',
  'slut',
  'whore',
  'nigger',
  'nigga',
  'fag',
  'faggot',
  'retard',
  'kill yourself',
  'kys',
]

function stripDiacritics(s: string): string {
  return s.normalize('NFD').replace(/\p{M}/gu, '')
}

function escapeRegExp(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

function buildPattern(terms: string[]): RegExp {
  const sorted = [...new Set(terms.map((t) => stripDiacritics(t.trim().toLowerCase())))]
    .filter(Boolean)
    .sort((a, b) => b.length - a.length)
  const body = sorted.map((t) => escapeRegExp(t)).join('|')
  return new RegExp(`(?:^|[^a-z0-9ñ])(${body})(?=[^a-z0-9ñ]|$)`, 'i')
}

let cachedPattern: RegExp | null = null
let cachedExtraKey = ''

function getPattern(): RegExp {
  const extra = EXTRA_FROM_ENV().join('\0')
  if (cachedPattern && cachedExtraKey === extra) return cachedPattern
  cachedExtraKey = extra
  const all = [...BASE_BLOCKLIST, ...EXTRA_FROM_ENV()]
  cachedPattern = buildPattern(all)
  return cachedPattern
}

export function textContainsProfanity(text: string): boolean {
  if (!text || !text.trim()) return false
  const normalized = stripDiacritics(text.toLowerCase())
  const spaced = ` ${normalized.replace(/[_\-./]+/g, ' ')} `
  return getPattern().test(spaced)
}

export const PROFANITY_USER_MESSAGE =
  'El mensaje contiene lenguaje no permitido en la comunidad. Por favor reformulá el texto.'
