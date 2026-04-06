'use client'

import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useState, useEffect } from 'react'
import { Loader2, Mail, Lock, Zap } from 'lucide-react'
import Image from 'next/image'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [loadingProvider, setLoadingProvider] = useState<string | null>(null)
  const [mounted, setMounted] = useState(false)
  const router = useRouter()
  const supabase = createClient()
  const configuredAdminEmails = (
    process.env.NEXT_PUBLIC_ADMIN_EMAILS ||
    process.env.NEXT_PUBLIC_ADMIN_EMAIL ||
    ''
  )
    .split(',')
    .map((v) => v.trim().toLowerCase())
    .filter(Boolean)

  const ensureAdminProfileIfConfigured = async (user: { id: string; email?: string | null }) => {
    const email = (user.email || '').trim().toLowerCase()
    if (!email || configuredAdminEmails.length === 0) return false
    if (!configuredAdminEmails.includes(email)) return false

    const { error } = await supabase.from('admin_profiles').upsert({
      id: user.id,
      email,
      full_name: email.split('@')[0],
    })
    return !error
  }

  const syncUserProfileFromAuth = async (user: {
    id: string
    email?: string | null
    user_metadata?: Record<string, unknown>
  }) => {
    const meta = user.user_metadata || {}
    const fallbackName = (user.email || '').split('@')[0] || 'Usuario'
    const computedName =
      (typeof meta.full_name === 'string' && meta.full_name.trim()) ||
      (typeof meta.name === 'string' && meta.name.trim()) ||
      ([meta.given_name, meta.family_name]
        .filter((v): v is string => typeof v === 'string' && v.trim().length > 0)
        .join(' ')
        .trim() || null) ||
      fallbackName

    const avatar =
      (typeof meta.avatar_url === 'string' && meta.avatar_url) ||
      (typeof meta.picture === 'string' && meta.picture) ||
      (typeof meta.photo_url === 'string' && meta.photo_url) ||
      null

    const instagramHandle =
      (typeof meta.user_name === 'string' && meta.user_name) ||
      (typeof meta.preferred_username === 'string' && meta.preferred_username) ||
      null

    const payload: Record<string, unknown> = {
      id: user.id,
      full_name: computedName,
    }
    if (avatar) payload.avatar_url = avatar
    if (instagramHandle) payload.instagram_handle = instagramHandle

    const { error } = await supabase.from('user_profiles').upsert(payload)
    if (error) {
      console.warn('[auth] No se pudo sincronizar user_profiles:', error.message)
    }
  }

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    const checkExistingSession = async () => {
      const { data } = await supabase.auth.getSession()
      if (data.session) {
        const params = new URLSearchParams(window.location.search)
        const next = params.get('redirect')
        let safe =
          next && next.startsWith('/') && !next.startsWith('//') ? next : '/app'
        if (!next) {
          await syncUserProfileFromAuth(data.session.user)
          const bootstrapped = await ensureAdminProfileIfConfigured(data.session.user)
          if (bootstrapped) {
            safe = '/admin'
          }
          const { data: adminProfile } = await supabase
            .from('admin_profiles')
            .select('id')
            .eq('id', data.session.user.id)
            .maybeSingle()
          if (adminProfile) safe = '/admin'
        }
        router.replace(safe)
      }
    }
    checkExistingSession()
  }, [router, supabase])

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })
      if (error) throw error
      const params = new URLSearchParams(window.location.search)
      const next = params.get('redirect')
      let safe =
        next && next.startsWith('/') && !next.startsWith('//') ? next : '/app'
      if (data.user) {
        await syncUserProfileFromAuth(data.user)
      }
      if (!next && data.user) {
        const bootstrapped = await ensureAdminProfileIfConfigured(data.user)
        if (bootstrapped) {
          safe = '/admin'
        }
        const { data: adminProfile } = await supabase
          .from('admin_profiles')
          .select('id')
          .eq('id', data.user.id)
          .maybeSingle()
        if (adminProfile) safe = '/admin'
      }
      router.push(safe)
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Error al iniciar sesión')
    } finally {
      setIsLoading(false)
    }
  }

  const handleGoogleLogin = async () => {
    setLoadingProvider('google')
    setError(null)

    try {
      const params = new URLSearchParams(window.location.search)
      const next = params.get('redirect')
      const safeNext =
        next && next.startsWith('/') && !next.startsWith('//') ? next : '/app'
      const redirectTo =
        process.env.NEXT_PUBLIC_DEV_SUPABASE_REDIRECT_URL ||
        `${window.location.origin}/auth/login?redirect=${encodeURIComponent(safeNext)}`

      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: { redirectTo },
      })
      if (error) throw error
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Error al conectar')
      setLoadingProvider(null)
    }
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4 overflow-hidden relative">
      {/* Animated background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div 
          className={`absolute -top-1/2 -left-1/2 w-full h-full bg-[radial-gradient(circle,oklch(0.7_0.25_180/0.15),transparent_50%)] transition-all duration-1000 ${mounted ? 'opacity-100 scale-100' : 'opacity-0 scale-50'}`}
          style={{ animationDelay: '0ms' }}
        />
        <div 
          className={`absolute -bottom-1/2 -right-1/2 w-full h-full bg-[radial-gradient(circle,oklch(0.6_0.25_320/0.15),transparent_50%)] transition-all duration-1000 delay-200 ${mounted ? 'opacity-100 scale-100' : 'opacity-0 scale-50'}`}
        />
        <div 
          className={`absolute top-1/4 right-1/4 w-96 h-96 bg-[radial-gradient(circle,oklch(0.65_0.2_85/0.1),transparent_60%)] transition-all duration-1000 delay-500 ${mounted ? 'opacity-100 scale-100' : 'opacity-0 scale-50'}`}
        />
        
        {/* Grid overlay */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:50px_50px]" />
        
        {/* Scan line effect */}
        <div className="absolute inset-0 bg-[linear-gradient(transparent_50%,rgba(0,0,0,0.05)_50%)] bg-[size:100%_4px] pointer-events-none" />
      </div>

      <div 
        className={`w-full max-w-md relative z-10 transition-all duration-700 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}
      >
        {/* Logo */}
        <Link href="/" className="flex items-center justify-center gap-3 mb-8 group">
          <Image
            src="/logo.png"
            alt="Comunidad"
            width={80}
            height={80}
            className="h-20 w-20 object-contain transition-transform duration-300 group-hover:scale-110"
          />
        </Link>

        {/* Card */}
        <div 
          className={`relative transition-all duration-700 delay-200 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}
        >
          {/* Glow effect behind card */}
          <div className="absolute -inset-1 bg-gradient-to-r from-cyan-500/20 via-purple-500/20 to-pink-500/20 rounded-2xl blur-xl opacity-50" />
          
          <div className="relative bg-card/80 backdrop-blur-xl border border-border/50 rounded-2xl p-8">
            {/* Header */}
            <div className="text-center mb-8">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 text-xs mb-4">
                <Zap className="w-3 h-3" />
                ACCESO RAPIDO
              </div>
              <h1 className="font-[family-name:var(--font-display)] text-3xl text-foreground mb-2">
                BIENVENIDO
              </h1>
              <p className="text-muted-foreground text-sm">
                Conecta con la comunidad surf & skate
              </p>
            </div>

            {/* Social Login Buttons */}
            <div className="space-y-3 mb-6">
              <Button
                type="button"
                variant="outline"
                className="w-full h-12 bg-white/5 border-border/50 hover:bg-white/10 hover:border-white/20 transition-all duration-300 group relative overflow-hidden"
                onClick={handleGoogleLogin}
                disabled={!!loadingProvider}
              >
                <div className="absolute inset-0 bg-gradient-to-r from-red-500/0 via-yellow-500/0 to-green-500/0 group-hover:from-red-500/5 group-hover:via-yellow-500/5 group-hover:to-green-500/5 transition-all duration-300" />
                {loadingProvider === 'google' ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <>
                    <svg className="w-5 h-5 mr-3" viewBox="0 0 24 24">
                      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                    </svg>
                    <span className="text-foreground">Continuar con Google</span>
                  </>
                )}
              </Button>
            </div>

            {/* Divider */}
            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-border/50"></div>
              </div>
              <div className="relative flex justify-center text-xs">
                <span className="px-4 bg-card text-muted-foreground">o con email</span>
              </div>
            </div>

            {/* Email Login Form */}
            <form onSubmit={handleLogin} className="space-y-4">
              <div className="relative group">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground group-focus-within:text-cyan-400 transition-colors" />
                <Input
                  type="email"
                  placeholder="Email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-11 h-12 bg-white/5 border-border/50 focus:border-cyan-500/50 focus:ring-cyan-500/20 transition-all"
                />
              </div>
              
              <div className="relative group">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground group-focus-within:text-cyan-400 transition-colors" />
                <Input
                  type="password"
                  placeholder="Contraseña"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-11 h-12 bg-white/5 border-border/50 focus:border-cyan-500/50 focus:ring-cyan-500/20 transition-all"
                />
              </div>

              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    defaultChecked
                    className="h-4 w-4 rounded border-border/60 bg-transparent accent-cyan-500"
                  />
                  <span>Recordarme en este dispositivo</span>
                </label>
                <span className="text-cyan-400/80">Sesion guardada automaticamente</span>
              </div>
              
              {error && (
                <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
                  {error}
                </div>
              )}
              
              <Button 
                type="submit" 
                className="w-full h-12 bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-400 hover:to-blue-400 text-white font-semibold transition-all duration-300 hover:shadow-[0_0_20px_rgba(6,182,212,0.4)]" 
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    Entrando...
                  </>
                ) : (
                  'ENTRAR'
                )}
              </Button>
            </form>
            
            {/* Footer */}
            <div className="mt-6 text-center space-y-2">
              <p className="text-sm text-muted-foreground">
                ¿No tienes cuenta?{' '}
                <Link
                  href="/auth/sign-up"
                  className="text-cyan-400 hover:text-cyan-300 transition-colors font-medium"
                >
                  Registrate
                </Link>
              </p>
              <Link
                href="/"
                className="text-xs text-muted-foreground hover:text-foreground transition-colors inline-block"
              >
                ← Volver al inicio
              </Link>
            </div>
          </div>
        </div>

        {/* Trust badges */}
        <div 
          className={`mt-8 flex items-center justify-center gap-6 text-muted-foreground text-xs transition-all duration-700 delay-500 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}
        >
          <div className="flex items-center gap-1">
            <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
            <span>Seguro</span>
          </div>
          <div className="flex items-center gap-1">
            <Zap className="w-3 h-3" />
            <span>Rápido</span>
          </div>
          <div className="flex items-center gap-1">
            <span>🏄</span>
            <span>Comunidad</span>
          </div>
        </div>
      </div>
    </div>
  )
}
