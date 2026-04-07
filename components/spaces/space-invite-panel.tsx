'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Copy, RefreshCw, Shield } from 'lucide-react'

function randomInviteCode(): string {
  const bytes = new Uint8Array(5)
  crypto.getRandomValues(bytes)
  return Array.from(bytes)
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('')
    .slice(0, 10)
}

type Props = {
  spaceId: string
  slug: string
  initialInviteEnabled: boolean
  initialInviteCode: string | null
}

export function SpaceInvitePanel({
  spaceId,
  slug,
  initialInviteEnabled,
  initialInviteCode,
}: Props) {
  const supabase = createClient()
  const [enabled, setEnabled] = useState(initialInviteEnabled)
  const [code, setCode] = useState(initialInviteCode)
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState<string | null>(null)

  const baseUrl =
    typeof window !== 'undefined' ? window.location.origin : ''
  const link =
    code && enabled ? `${baseUrl}/e/${slug}?invite=${encodeURIComponent(code)}` : ''

  const save = async (nextEnabled: boolean, nextCode: string | null) => {
    setLoading(true)
    setMessage(null)
    const { error } = await supabase
      .from('spaces')
      .update({
        invite_enabled: nextEnabled,
        invite_code: nextCode,
      })
      .eq('id', spaceId)

    setLoading(false)
    if (error) {
      setMessage(error.message)
      return
    }
    setEnabled(nextEnabled)
    setCode(nextCode)
    setMessage(nextEnabled ? 'Invitación actualizada.' : 'Invitación desactivada.')
  }

  const toggle = async () => {
    if (enabled) {
      await save(false, null)
      return
    }
    const c = code || randomInviteCode()
    await save(true, c)
  }

  const regenerate = async () => {
    await save(true, randomInviteCode())
  }

  const copy = async () => {
    if (!link) return
    try {
      await navigator.clipboard.writeText(link)
      setMessage('Link copiado.')
    } catch {
      setMessage('No se pudo copiar.')
    }
  }

  return (
    <div className="rounded-xl border border-neon-cyan/20 bg-neon-cyan/5 p-4 space-y-3">
      <div className="flex items-center gap-2 text-sm font-medium text-neon-cyan">
        <Shield className="h-4 w-4" />
        Invitación (espacio privado o link directo)
      </div>
      <p className="text-xs text-muted-foreground">
        Activá un código para que alumnos entren con el link aunque el espacio sea privado. Podés
        desactivarlo cuando quieras.
      </p>
      <div className="flex flex-wrap gap-2">
        <Button
          type="button"
          size="sm"
          variant={enabled ? 'destructive' : 'default'}
          onClick={() => void toggle()}
          disabled={loading}
        >
          {enabled ? 'Desactivar invitación' : 'Activar invitación'}
        </Button>
        {enabled && (
          <Button
            type="button"
            size="sm"
            variant="outline"
            onClick={() => void regenerate()}
            disabled={loading}
          >
            <RefreshCw className="h-3.5 w-3.5 mr-1" />
            Nuevo código
          </Button>
        )}
      </div>
      {enabled && code && (
        <div className="space-y-1 font-mono text-xs break-all">
          <p>
            <span className="text-muted-foreground">Código:</span> {code}
          </p>
          {link && (
            <Button type="button" size="sm" variant="secondary" className="mt-1" onClick={() => void copy()}>
              <Copy className="h-3.5 w-3.5 mr-1" />
              Copiar link de invitación
            </Button>
          )}
        </div>
      )}
      {message && <p className="text-xs text-muted-foreground">{message}</p>}
    </div>
  )
}
