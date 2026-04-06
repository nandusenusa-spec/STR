'use client'

import { useSearchParams, useRouter, usePathname } from 'next/navigation'
import { useEffect, useState, useCallback } from 'react'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { ShieldOff, X } from 'lucide-react'
import { Button } from '@/components/ui/button'

export function AdminAccessNotice() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const pathname = usePathname()
  const [open, setOpen] = useState(false)

  useEffect(() => {
    if (searchParams.get('admin') !== 'forbidden') return

    setOpen(true)
    const params = new URLSearchParams(searchParams.toString())
    params.delete('admin')
    const q = params.toString()
    router.replace(q ? `${pathname}?${q}` : pathname, { scroll: false })
  }, [searchParams, pathname, router])

  const dismiss = useCallback(() => setOpen(false), [])

  if (!open) return null

  return (
    <div className="shrink-0 border-b border-amber-500/30 bg-amber-500/10 px-4 py-3">
      <Alert className="border-amber-500/40 bg-amber-500/5 text-foreground max-w-4xl mx-auto relative pr-10">
        <ShieldOff className="text-amber-500" />
        <AlertTitle className="text-amber-200">Acceso al panel de administración</AlertTitle>
        <AlertDescription className="text-amber-100/90">
          Tu cuenta no tiene permisos de administrador. Si necesitás acceso, contactá al equipo STR.
        </AlertDescription>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="absolute right-2 top-2 h-8 w-8 text-amber-200/80 hover:text-amber-100"
          onClick={dismiss}
          aria-label="Cerrar aviso"
        >
          <X className="h-4 w-4" />
        </Button>
      </Alert>
    </div>
  )
}
