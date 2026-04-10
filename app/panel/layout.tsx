'use client'

import React, { useState, useEffect } from "react"
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { 
  LayoutDashboard, 
  Video, 
  Calendar, 
  Users, 
  ShoppingBag, 
  CreditCard,
  Plane,
  Link as LinkIcon,
  Dumbbell,
  Shield,
  MessageSquare,
  CheckCircle,
  Gift,
  Zap
} from 'lucide-react'

const ADMIN_PASSWORD = (process.env.NEXT_PUBLIC_ADMIN_PANEL_PASSWORD || 'str2026').trim()

const menuItems = [
  { href: '/admin', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/admin/videos', label: 'Videos', icon: Video },
  { href: '/admin/clases-en-vivo', label: 'Clases en Vivo', icon: Video },
  { href: '/admin/clases-offline', label: 'Clases Offline', icon: Dumbbell },
  { href: '/admin/events', label: 'Eventos', icon: Calendar },
  { href: '/admin/trips', label: 'Viajes', icon: Plane },
  { href: '/admin/maniobras', label: 'Maniobras', icon: Zap },
  { href: '/admin/subscriptions', label: 'Suscripciones', icon: Users },
  { href: '/admin/products', label: 'Productos', icon: ShoppingBag },
  { href: '/admin/orders', label: 'Ordenes', icon: ShoppingBag },
  { href: '/admin/pagos', label: 'Pagos', icon: CreditCard },
  { href: '/admin/promociones', label: 'Promociones', icon: Gift },
  { href: '/admin/links', label: 'Links', icon: LinkIcon },
  { href: '/admin/contacto', label: 'Contactos', icon: MessageSquare },
  { href: '/admin/validaciones', label: 'Validaciones', icon: CheckCircle },
  { href: '/admin/security', label: 'Seguridad', icon: Shield },
]

export default function PanelLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const pathname = usePathname()

  useEffect(() => {
    const stored = sessionStorage.getItem('panel_auth')
    if (stored === 'true') {
      setIsAuthenticated(true)
    }
  }, [])

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault()
    if (password === ADMIN_PASSWORD) {
      sessionStorage.setItem('panel_auth', 'true')
      setIsAuthenticated(true)
      setError('')
    } else {
      setError('Clave incorrecta')
    }
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center p-4">
        <div className="w-full max-w-sm">
          <h1 className="text-2xl font-bold text-white mb-8 text-center uppercase tracking-wider">
            Panel STR
          </h1>
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Clave de acceso"
                className="w-full px-4 py-3 bg-white/10 border border-white/20 text-white placeholder:text-white/50 focus:outline-none focus:border-white"
                autoFocus
              />
            </div>
            {error && (
              <p className="text-red-500 text-sm">{error}</p>
            )}
            <button
              type="submit"
              className="w-full py-3 bg-white text-black font-medium uppercase tracking-wider hover:bg-gray-200 transition-colors"
            >
              Entrar
            </button>
          </form>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-100 flex">
      {/* Sidebar */}
      <aside className="w-64 bg-black text-white flex flex-col">
        <div className="p-4 border-b border-white/10">
          <h1 className="text-lg font-bold uppercase tracking-wider">Panel STR</h1>
        </div>
        <nav className="flex-1 p-4 overflow-y-auto">
          <ul className="space-y-1">
            {menuItems.map((item) => {
              const isActive =
                item.href === '/admin' ? pathname === '/admin' : pathname.startsWith(item.href)
              const Icon = item.icon
              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className={`flex items-center gap-3 px-3 py-2 text-sm transition-colors ${
                      isActive 
                        ? 'bg-white text-black' 
                        : 'text-white/70 hover:text-white hover:bg-white/10'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    {item.label}
                  </Link>
                </li>
              )
            })}
          </ul>
        </nav>
        <div className="p-4 border-t border-white/10">
          <button 
            onClick={() => {
              sessionStorage.removeItem('panel_auth')
              setIsAuthenticated(false)
            }}
            className="w-full text-sm text-white/50 hover:text-white transition-colors"
          >
            Cerrar sesion
          </button>
        </div>
      </aside>
      
      {/* Main content */}
      <main className="flex-1 overflow-auto">
        {children}
      </main>
    </div>
  )
}
