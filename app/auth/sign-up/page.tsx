'use client'

import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import Link from 'next/link'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { Mail, Lock, User, ArrowRight } from 'lucide-react'

export default function Page() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [fullName, setFullName] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault()
    const supabase = createClient()
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
            <p className="text-muted-foreground text-sm mb-8">Crea tu cuenta y entra a la comunidad</p>

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
