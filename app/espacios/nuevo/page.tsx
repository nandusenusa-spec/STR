'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { slugifyForSpaceKey } from '@/lib/utils'
import { ArrowLeft } from 'lucide-react'

export default function NuevoEspacioPage() {
  const router = useRouter()
  const [name, setName] = useState('')
  const [slug, setSlug] = useState('')
  const [slugTouched, setSlugTouched] = useState(false)
  const [description, setDescription] = useState('')
  const [isPublic, setIsPublic] = useState(true)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const onNameChange = (v: string) => {
    setName(v)
    if (!slugTouched) setSlug(slugifyForSpaceKey(v))
  }

  const onSlugChange = (v: string) => {
    setSlugTouched(true)
    setSlug(slugifyForSpaceKey(v))
  }

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    const supabase = createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) {
      router.push('/auth/login?redirect=' + encodeURIComponent('/espacios/nuevo'))
      return
    }

    const finalSlug = slugifyForSpaceKey(slug)
    const { data, error: insertError } = await supabase
      .from('spaces')
      .insert({
        name: name.trim(),
        slug: finalSlug,
        description: description.trim() || null,
        owner_id: user.id,
        is_public: isPublic,
      })
      .select('slug')
      .maybeSingle()

    setLoading(false)
    if (insertError) {
      if (insertError.message.includes('duplicate') || insertError.code === '23505') {
        setError('Ese slug ya está en uso. Cambiá el identificador.')
      } else if (insertError.message.includes('does not exist') || insertError.message.includes('relation')) {
        setError('Falta ejecutar la migración SQL 020_spaces_and_members.sql en Supabase.')
      } else {
        setError(insertError.message)
      }
      return
    }
    if (data?.slug) {
      router.push(`/e/${data.slug}`)
      router.refresh()
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-lg px-4 py-12">
        <Link
          href="/espacios"
          className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-8"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Mis espacios
        </Link>

        <h1 className="font-[var(--font-display)] text-4xl mb-2">Nuevo espacio</h1>
        <p className="text-muted-foreground text-sm mb-8">
          Tu espacio tiene un link compartible: <span className="text-foreground">/e/tu-slug</span>
        </p>

        <form onSubmit={submit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="name">Nombre del espacio</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => onNameChange(e.target.value)}
              placeholder="Ej. Surf Pocitos — Grupo mañana"
              required
              className="bg-background/50"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="slug">Identificador (URL)</Label>
            <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
              <span>/e/</span>
            </div>
            <Input
              id="slug"
              value={slug}
              onChange={(e) => onSlugChange(e.target.value)}
              placeholder="surf-pocitos-manana"
              required
              pattern="[a-z0-9]+(-[a-z0-9]+)*"
              className="bg-background/50 font-mono text-sm"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="desc">Descripción (opcional)</Label>
            <Input
              id="desc"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Quién entrena, horarios, nivel…"
              className="bg-background/50"
            />
          </div>
          <label className="flex items-center gap-2 text-sm cursor-pointer">
            <input
              type="checkbox"
              checked={isPublic}
              onChange={(e) => setIsPublic(e.target.checked)}
              className="rounded border-border accent-neon-cyan"
            />
            Espacio público (cualquiera con cuenta puede unirse como alumno)
          </label>

          {error && <p className="text-sm text-destructive">{error}</p>}

          <Button
            type="submit"
            disabled={loading || !name.trim() || !slug.trim()}
            className="w-full bg-gradient-to-r from-neon-cyan to-neon-magenta text-background font-semibold"
          >
            {loading ? 'Creando…' : 'Crear espacio'}
          </Button>
        </form>
      </div>
    </div>
  )
}
