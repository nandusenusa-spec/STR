'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { ShieldOff } from 'lucide-react'
import Link from 'next/link'

export default function ExpulsadoPage() {
  const [done, setDone] = useState(false)

  useEffect(() => {
    let cancelled = false
    void (async () => {
      await createClient().auth.signOut()
      if (!cancelled) setDone(true)
    })()
    return () => {
      cancelled = true
    }
  }, [])

  return (
    <div className="flex min-h-[70vh] flex-col items-center justify-center gap-6 px-4">
      <div className="flex max-w-md flex-col items-center gap-4 text-center">
        <div className="rounded-full bg-destructive/10 p-4 text-destructive">
          <ShieldOff className="h-10 w-10" aria-hidden />
        </div>
        <h1 className="text-2xl font-semibold tracking-tight">
          Acceso a la comunidad revocado
        </h1>
        <p className="text-muted-foreground text-sm leading-relaxed">
          Esta cuenta quedó expulsada. No podés volver a entrar con el mismo correo,
          la misma cuenta de Google ni otros datos que hayamos registrado para
          proteger a la comunidad.
        </p>
        <p className="text-muted-foreground text-xs">
          {done ? 'Sesión cerrada.' : 'Cerrando sesión…'}
        </p>
        <Button asChild variant="outline">
          <Link href="/">Volver al inicio</Link>
        </Button>
      </div>
    </div>
  )
}
