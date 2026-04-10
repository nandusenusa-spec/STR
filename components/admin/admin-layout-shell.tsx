'use client'

import { usePathname, useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { AdminSidebar } from '@/components/admin/sidebar'
import { Loader2 } from 'lucide-react'

export function AdminLayoutShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const router = useRouter()
  const isLogin = pathname === '/admin/login'
  const [phase, setPhase] = useState<'loading' | 'ready' | 'denied'>('loading')

  useEffect(() => {
    if (isLogin) {
      setPhase('ready')
      return
    }

    let cancelled = false
    fetch('/api/admin/gate', { method: 'GET', credentials: 'include' })
      .then((r) => r.json() as Promise<{ ok?: boolean }>)
      .then((data) => {
        if (cancelled) return
        if (data.ok) setPhase('ready')
        else {
          setPhase('denied')
          router.replace('/admin/login')
        }
      })
      .catch(() => {
        if (cancelled) return
        setPhase('denied')
        router.replace('/admin/login')
      })

    return () => {
      cancelled = true
    }
  }, [isLogin, router])

  if (phase === 'loading' && !isLogin) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  if (isLogin) {
    return <>{children}</>
  }

  return (
    <div className="min-h-screen bg-background flex">
      <AdminSidebar />
      <main className="flex-1 overflow-auto">{children}</main>
    </div>
  )
}
