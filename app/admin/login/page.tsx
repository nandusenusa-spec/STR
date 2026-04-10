'use client'

import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Loader2 } from 'lucide-react'

export default function AdminLoginPage() {
  const router = useRouter()
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      const res = await fetch('/api/admin/gate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ password }),
      })
      const data = (await res.json().catch(() => ({}))) as { error?: string }
      if (!res.ok) {
        setError(data.error || 'No se pudo verificar')
        return
      }
      router.replace('/admin')
      router.refresh()
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center px-4">
      <Link href="/" className="mb-10 flex items-center gap-2">
        <Image src="/logo.svg" alt="STR" width={40} height={40} className="h-10 w-10 object-contain" />
        <span className="font-[var(--font-display)] text-xl">STR Admin</span>
      </Link>
      <form
        onSubmit={submit}
        className="w-full max-w-sm space-y-4 rounded-2xl border border-white/10 bg-card/40 p-8"
      >
        <div>
          <h1 className="font-[var(--font-display)] text-2xl mb-1">Acceso interno</h1>
          <p className="text-sm text-muted-foreground">
            Solo cuentas con permiso en el panel. Ingresá con Google y la clave del equipo.
          </p>
        </div>
        <div className="space-y-2">
          <Label htmlFor="admin-pw">Clave</Label>
          <Input
            id="admin-pw"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete="current-password"
            required
            className="bg-background/50"
          />
        </div>
        {error && <p className="text-sm text-destructive">{error}</p>}
        <Button type="submit" disabled={loading} className="w-full">
          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Entrar'}
        </Button>
        <p className="text-center text-xs text-muted-foreground">
          <Link href="/" className="hover:text-foreground">
            Volver al sitio
          </Link>
        </p>
      </form>
    </div>
  )
}
