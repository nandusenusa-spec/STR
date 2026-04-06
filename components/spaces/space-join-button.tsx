'use client'

import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import Link from 'next/link'

type Props = {
  spaceId: string
  slug: string
  isPublic: boolean
  isMember: boolean
  isLoggedIn: boolean
}

export function SpaceJoinButton({ spaceId, slug, isPublic, isMember, isLoggedIn }: Props) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  if (isMember) {
    return (
      <p className="text-sm text-neon-lime border border-neon-lime/30 rounded-lg px-4 py-3 bg-neon-lime/5">
        Ya formás parte de este espacio.
      </p>
    )
  }

  if (!isLoggedIn) {
    return (
      <div className="space-y-3">
        <p className="text-sm text-muted-foreground">Iniciá sesión para unirte a este espacio.</p>
        <Button asChild className="bg-gradient-to-r from-neon-cyan to-neon-magenta text-background">
          <Link href={`/auth/login?redirect=${encodeURIComponent(`/e/${slug}`)}`}>Ingresar</Link>
        </Button>
      </div>
    )
  }

  if (!isPublic) {
    return (
      <p className="text-sm text-muted-foreground border border-border rounded-lg px-4 py-3">
        Este espacio es privado. Pedile al entrenador que te invite o te comparta acceso.
      </p>
    )
  }

  const join = async () => {
    setLoading(true)
    setError(null)
    const supabase = createClient()
    const {
      data: { user: u },
    } = await supabase.auth.getUser()
    if (!u) {
      setLoading(false)
      setError('Volvé a iniciar sesión.')
      return
    }
    const { error: insertError } = await supabase.from('space_members').insert({
      space_id: spaceId,
      user_id: u.id,
      role: 'student',
    })
    setLoading(false)
    if (insertError) {
      setError(insertError.message)
      return
    }
    router.refresh()
  }

  return (
    <div className="space-y-2">
      <Button
        type="button"
        onClick={join}
        disabled={loading}
        className="bg-gradient-to-r from-neon-lime to-neon-cyan text-background font-semibold"
      >
        {loading ? 'Uniéndote…' : 'Unirme a este espacio'}
      </Button>
      {error && <p className="text-sm text-destructive">{error}</p>}
    </div>
  )
}
