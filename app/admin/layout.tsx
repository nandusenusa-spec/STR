'use client'

import React, { useState, useEffect } from "react"
import { AdminSidebar } from '@/components/admin/sidebar'

const ADMIN_PASSWORD = 'str2026'

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')

  useEffect(() => {
    const stored = sessionStorage.getItem('admin_auth')
    if (stored === 'true') {
      setIsAuthenticated(true)
    }
  }, [])

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault()
    if (password === ADMIN_PASSWORD) {
      sessionStorage.setItem('admin_auth', 'true')
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
            Admin STR
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
    <div className="min-h-screen bg-background flex">
      <AdminSidebar />
      <main className="flex-1 overflow-auto">
        {children}
      </main>
    </div>
  )
}
