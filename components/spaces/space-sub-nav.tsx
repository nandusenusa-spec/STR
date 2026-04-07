'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'

const tabs = (slug: string) => [
  { href: `/e/${slug}`, label: 'Inicio' },
  { href: `/e/${slug}/feed`, label: 'Feed' },
  { href: `/e/${slug}/forums`, label: 'Foros' },
  { href: `/e/${slug}/chat`, label: 'Chat' },
]

type Props = { slug: string; spaceName: string }

export function SpaceSubNav({ slug, spaceName }: Props) {
  const pathname = usePathname()

  return (
    <div className="border-b border-white/10 bg-background/80 backdrop-blur-md sticky top-0 z-30">
      <div className="mx-auto max-w-4xl px-4 py-3">
        <p className="text-xs font-mono text-neon-cyan tracking-wider mb-2">ESPACIO</p>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <h2 className="font-[var(--font-display)] text-xl text-foreground truncate">{spaceName}</h2>
          <nav className="flex flex-wrap gap-1">
            {tabs(slug).map((t) => {
              const homeHref = `/e/${slug}`
              const active =
                t.href === homeHref
                  ? pathname === homeHref
                  : pathname === t.href || pathname.startsWith(`${t.href}/`)
              return (
                <Link
                  key={t.href}
                  href={t.href}
                  className={cn(
                    'text-xs px-3 py-1.5 rounded-full border transition-colors',
                    active
                      ? 'border-neon-cyan/50 bg-neon-cyan/10 text-neon-cyan'
                      : 'border-white/10 text-muted-foreground hover:border-white/20 hover:text-foreground',
                  )}
                >
                  {t.label}
                </Link>
              )
            })}
          </nav>
        </div>
      </div>
    </div>
  )
}
