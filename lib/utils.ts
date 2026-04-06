import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/** Slug para `public.spaces.slug`: minúsculas, números y guiones (valida CHECK en SQL). */
export function slugifyForSpaceKey(input: string): string {
  const s = input
    .trim()
    .toLowerCase()
    .normalize('NFD')
    .replace(/\u0300-\u036f/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 48)
  return s.length > 0 ? s : 'espacio'
}
