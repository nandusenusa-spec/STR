import Link from 'next/link'
import { redirect } from 'next/navigation'
import type { Metadata } from 'next'
import { createClient } from '@/lib/supabase/server'
import { Button } from '@/components/ui/button'
import { PlusCircle, ExternalLink } from 'lucide-react'

export const metadata: Metadata = {
  title: 'Mis espacios | STR',
  description: 'Espacios de entrenamiento donde participás o que administrás.',
}

export default async function EspaciosPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/auth/login?redirect=' + encodeURIComponent('/espacios'))
  }

  const { data: rows, error } = await supabase
    .from('space_members')
    .select(
      `
      role,
      spaces ( id, slug, name, description, is_public, owner_id, created_at )
    `,
    )
    .eq('user_id', user.id)

  type SpaceRow = {
    id: string
    slug: string
    name: string
    description: string | null
    is_public: boolean
    owner_id: string
    created_at: string
  }

  const spaces =
    rows
      ?.map((r) => {
        const s = r.spaces as SpaceRow | SpaceRow[] | null
        const one = Array.isArray(s) ? s[0] : s
        if (!one) return null
        return { ...one, role: r.role as string }
      })
      .filter((x): x is SpaceRow & { role: string } => x != null) ?? []

  const missingTable =
    error?.message?.includes('relation') && error?.message?.includes('does not exist')

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:py-16">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-10">
          <div>
            <p className="text-xs font-mono text-neon-cyan tracking-wider mb-2">FASE 2</p>
            <h1 className="font-[var(--font-display)] text-4xl sm:text-5xl">Mis espacios</h1>
            <p className="text-muted-foreground mt-2">
              Creá tu espacio como entrenador o unite a los públicos desde su página.
            </p>
          </div>
          <Button asChild className="bg-gradient-to-r from-neon-cyan to-neon-magenta text-background shrink-0">
            <Link href="/espacios/nuevo">
              <PlusCircle className="h-4 w-4 mr-2" />
              Nuevo espacio
            </Link>
          </Button>
        </div>

        {missingTable && (
          <div className="rounded-xl border border-amber-500/40 bg-amber-500/10 p-4 text-sm text-amber-200 mb-8">
            Falta aplicar la migración en Supabase. Abrí el SQL Editor y ejecutá el archivo{' '}
            <code className="text-amber-100">scripts/020_spaces_and_members.sql</code> del repositorio.
          </div>
        )}

        {error && !missingTable && (
          <p className="text-destructive text-sm mb-6">{error.message}</p>
        )}

        {!error && spaces.length === 0 && (
          <div className="rounded-2xl border border-white/10 bg-card/40 p-8 text-center">
            <p className="text-muted-foreground mb-4">Todavía no tenés espacios.</p>
            <Button asChild variant="outline" className="border-neon-lime/40 text-neon-lime">
              <Link href="/espacios/nuevo">Crear mi primer espacio</Link>
            </Button>
          </div>
        )}

        <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 list-none p-0 m-0">
          {spaces.map((s) => (
            <li key={s.id} className="h-full min-h-0">
              <div className="rounded-2xl border border-white/10 bg-card/30 p-5 flex flex-col h-full gap-4">
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-mono text-muted-foreground uppercase tracking-wider mb-1">
                    {s.role}
                  </p>
                  <h2 className="font-[var(--font-display)] text-2xl">{s.name}</h2>
                  {s.description && (
                    <p className="text-sm text-muted-foreground mt-1 line-clamp-2 flex-1">
                      {s.description}
                    </p>
                  )}
                  <p className="text-xs text-muted-foreground mt-2">
                    /e/{s.slug} · {s.is_public ? 'Público' : 'Privado'}
                  </p>
                </div>
                <Button
                  asChild
                  variant="outline"
                  size="sm"
                  className="shrink-0 border-neon-cyan/40 w-full sm:w-auto self-stretch sm:self-end"
                >
                  <Link href={`/e/${s.slug}`}>
                    Abrir
                    <ExternalLink className="h-4 w-4 ml-2" />
                  </Link>
                </Button>
              </div>
            </li>
          ))}
        </ul>

        <p className="mt-10 text-center">
          <Link href="/app" className="text-sm text-muted-foreground hover:text-foreground">
            ← Volver al panel
          </Link>
        </p>
      </div>
    </div>
  )
}
