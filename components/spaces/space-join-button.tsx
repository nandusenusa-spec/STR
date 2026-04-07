'use client'

import { useRouter, useSearchParams } from 'next/navigation'
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
  const searchParams = useSearchParams()
  const inviteFromUrl = searchParams.get('invite')?.trim() || undefined
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  if (isMember) {
    return (
      <p className="text-sm text-neon-lime border border-neon-lime/30 rounded-lg px-4 py-3 bg-neon-lime/5">
        Ya formás parte de este espacio. Podés ir al{' '}
        <Link href={`/e/${slug}/feed`} className="text-neon-cyan underline">
          feed
        </Link>
        ,{' '}
        <Link href={`/e/${slug}/forums`} className="text-neon-cyan underline">
          foros
        </Link>{' '}
        o{' '}
        <Link href={`/e/${slug}/chat`} className="text-neon-cyan underline">
          chat
        </Link>{' '}
        del espacio.
      </p>
    )
  }

  if (!isLoggedIn) {
    const redirect = inviteFromUrl
      ? `/e/${slug}?invite=${encodeURIComponent(inviteFromUrl)}`
      : `/e/${slug}`
    return (
      <div className="space-y-3">
        <p className="text-sm text-muted-foreground">Iniciá sesión para unirte a este espacio.</p>
        <Button asChild className="bg-gradient-to-r from-neon-cyan to-neon-magenta text-background">
          <Link href={`/auth/login?redirect=${encodeURIComponent(redirect)}`}>Ingresar</Link>
        </Button>
      </div>
    )
  }

  if (!isPublic && !inviteFromUrl) {
    return (
      <p className="text-sm text-muted-foreground border border-border rounded-lg px-4 py-3">
        Este espacio es privado. Pedile al entrenador el link de invitación o el código (Fase 3).
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

    if (!isPublic && inviteFromUrl) {
      const { data, error: rpcError } = await supabase.rpc('join_space_with_invite', {
        p_slug: slug,
        p_code: inviteFromUrl,
      })
      setLoading(false)
      if (rpcError) {
        setError(rpcError.message)
        return
      }
      const payload = data as { ok?: boolean; error?: string } | null
      if (payload?.ok === false) {
        setError(
          payload.error === 'invalid_code'
            ? 'Código de invitación inválido o vencido.'
            : 'No se pudo unir al espacio.',
        )
        return
      }
      router.refresh()
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
      {!isPublic && inviteFromUrl && (
        <p className="text-xs text-muted-foreground">Usás un link de invitación válido.</p>
      )}
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
