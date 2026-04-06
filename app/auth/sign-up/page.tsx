'use client'

import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import Link from 'next/link'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { Mail, Lock, User, ArrowRight, Loader2 } from 'lucide-react'

export default function Page() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [fullName, setFullName] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [loadingProvider, setLoadingProvider] = useState<string | null>(null)
  const router = useRouter()
  const supabase = createClient()

  const handleGoogleSignUp = async () => {
    setLoadingProvider('google')
    setError(null)
    try {
      const params = new URLSearchParams(window.location.search)
      const next = params.get('redirect')
      const safeNext =
        next && next.startsWith('/') && !next.startsWith('//') ? next : '/app'

      const appBase = process.env.NEXT_PUBLIC_APP_URL?.replace(/\/$/, '')
      const base = appBase || window.location.origin
      const configured = process.env.NEXT_PUBLIC_DEV_SUPABASE_REDIRECT_URL?.trim()
      const redirectTo = configured
        ? `${configured.split('?')[0]}?next=${encodeURIComponent(safeNext)}`
        : `${base}/auth/callback?next=${encodeURIComponent(safeNext)}`

      const { error: oauthError } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: { redirectTo },
      })
      if (oauthError) throw oauthError
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Error al conectar con Google')
      setLoadingProvider(null)
    }
  }

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    try {
      // Sign up and auto-confirm by immediately signing in
      const { data, error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { full_name: fullName },
          emailRedirectTo: `${window.location.origin}/app`,
        },
      })

      if (signUpError) throw signUpError

      // If email confirmation is disabled, user is confirmed immediately
      if (data.session) {
        router.push('/app')
        return
      }

      // If confirmation required, try to sign in anyway
      const { error: signInError } = await supabase.auth.signInWithPassword({ email, password })
      if (!signInError) {
        router.push('/app')
      } else {
        // Needs email confirmation
        router.push('/auth/sign-up-success')
      }
    } catch (error: unknown) {
      setError(error instanceof Error ? error.message : 'Ocurrio un error')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 grid-bg opacity-20" />
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-neon-cyan/10 rounded-full blur-[120px]" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-neon-magenta/10 rounded-full blur-[120px]" />
      </div>

      <div className="relative w-full max-w-md">
        {/* Logo */}
        <Link href="/" className="flex items-center justify-center mb-8 group">
          <Image
            src="/logo.png"
            alt="Comunidad"
            width={64}
            height={64}
            className="h-16 w-16 object-contain transition-transform duration-300 group-hover:scale-110"
          />
        </Link>

        {/* Card */}
        <div className="relative rounded-2xl border border-white/10 bg-card/80 backdrop-blur-xl p-8">
          <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-neon-cyan/5 via-transparent to-neon-magenta/5" />

          <div className="relative">
            <h1 className="font-[var(--font-display)] text-3xl text-foreground mb-1">REGISTRATE</h1>
            <p className="text-muted-foreground text-sm mb-6">Crea tu cuenta y entra a la comunidad</p>

            <div className="space-y-3 mb-6">
              <Button
                type="button"
                variant="outline"
                className="w-full h-12 bg-white/5 border-white/10 hover:bg-white/10"
                onClick={handleGoogleSignUp}
                disabled={!!loadingProvider || isLoading}
              >
                {loadingProvider === 'google' ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <>
                    <svg className="w-5 h-5 mr-3" viewBox="0 0 24 24" aria-hidden>
                      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                    </svg>
                    <span>Continuar con Google</span>
                  </>
                )}
              </Button>
            </div>

            <div className="relative mb-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-white/10" />
              </div>
              <div className="relative flex justify-center text-xs">
                <span className="px-3 bg-card text-muted-foreground">o con email</span>
              </div>
            </div>

            <form onSubmit={handleSignUp} className="flex flex-col gap-5">
              <div className="flex flex-col gap-2">
                <Label htmlFor="fullName" className="text-sm text-muted-foreground">Nombre completo</Label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    id="fullName"
                    type="text"
                    placeholder="Tu nombre"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="pl-10 bg-background/50 border-white/10 focus:border-neon-cyan focus:ring-0"
                  />
                </div>
              </div>

              <div className="flex flex-col gap-2">
                <Label htmlFor="email" className="text-sm text-muted-foreground">Email</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="tu@email.com"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="pl-10 bg-background/50 border-white/10 focus:border-neon-cyan focus:ring-0"
                  />
                </div>
              </div>

              <div className="flex flex-col gap-2">
                <Label htmlFor="password" className="text-sm text-muted-foreground">Contraseña</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    id="password"
                    type="password"
                    placeholder="••••••••"
                    required
                    minLength={6}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pl-10 bg-background/50 border-white/10 focus:border-neon-cyan focus:ring-0"
                  />
                </div>
              </div>

              {error && (
                <div className="px-4 py-3 rounded-lg bg-destructive/20 border border-destructive/50 text-destructive text-sm">
                  {error}
                </div>
              )}

              <Button
                type="submit"
                disabled={isLoading}
                className="w-full bg-gradient-to-r from-neon-cyan via-neon-magenta to-neon-lime text-background font-bold py-6 text-base"
              >
                {isLoading ? 'Creando cuenta...' : (
                  <span className="flex items-center gap-2">
                    CREAR CUENTA <ArrowRight className="w-4 h-4" />
                  </span>
                )}
              </Button>
            </form>

            <p className="text-center text-sm text-muted-foreground mt-6">
              Ya tienes cuenta?{' '}
              <Link href="/auth/login" className="text-neon-cyan hover:underline">
                Ingresar
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
