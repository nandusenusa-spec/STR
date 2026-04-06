'use client'

import { useEffect, useState, type FormEvent } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import Link from 'next/link'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { Loader2, Waves, Sparkles, ArrowLeft, Mail, Lock, User, Phone, Play } from 'lucide-react'
import { cn } from '@/lib/utils'

export type MemberJoinVariant = 'portal' | 'socios'

const VARIANT_COPY: Record<
  MemberJoinVariant,
  {
    leftLines: [string, string, string]
    leftSub: string
    mobileBrand: string
    defaultMode: 'login' | 'register'
  }
> = {
  portal: {
    leftLines: ['SURF', 'SKATE', 'COMUNIDAD'],
    leftSub:
      'Accede a clases en vivo, videos exclusivos, chat con la comunidad y mucho más.',
    mobileBrand: 'COMUNIDAD',
    defaultMode: 'login',
  },
  socios: {
    leftLines: ['HACETE', 'SOCIO', 'HOY'],
    leftSub:
      'Cargá tus datos, creá tu cuenta e ingresá al portal: clases, beneficios y seguimiento en un solo lugar.',
    mobileBrand: 'SOCIOS',
    defaultMode: 'register',
  },
}

export function MemberJoinPage({ variant }: { variant: MemberJoinVariant }) {
  const copy = VARIANT_COPY[variant]
  const [mode, setMode] = useState<'login' | 'register'>(copy.defaultMode)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const router = useRouter()

  const [loginEmail, setLoginEmail] = useState('')
  const [loginPassword, setLoginPassword] = useState('')

  const [registerData, setRegisterData] = useState({
    email: '',
    password: '',
    fullName: '',
    phone: '',
    favoriteDiscipline: 'Surf',
  })

  useEffect(() => {
    const checkExistingSession = async () => {
      const supabase = createClient()
      const { data } = await supabase.auth.getSession()
      if (data.session) {
        router.replace('/portal/dashboard')
      }
    }
    checkExistingSession()
  }, [router])

  const handleLogin = async (e: FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    const supabase = createClient()
    const { error: err } = await supabase.auth.signInWithPassword({
      email: loginEmail,
      password: loginPassword,
    })

    if (err) {
      setError(err.message)
      setIsLoading(false)
      return
    }

    router.push('/portal/dashboard')
  }

  const handleRegister = async (e: FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)
    setSuccess(null)

    const supabase = createClient()
    const redirectBase =
      process.env.NEXT_PUBLIC_DEV_SUPABASE_REDIRECT_URL ||
      `${window.location.origin}/portal/dashboard`

    const { data, error: signUpError } = await supabase.auth.signUp({
      email: registerData.email,
      password: registerData.password,
      options: {
        emailRedirectTo: redirectBase,
        data: {
          full_name: registerData.fullName,
          phone: registerData.phone,
          favorite_discipline: registerData.favoriteDiscipline,
        },
      },
    })

    if (signUpError) {
      setError(signUpError.message)
      setIsLoading(false)
      return
    }

    if (data.session) {
      router.push('/portal/dashboard')
      return
    }

    const { error: signInError } = await supabase.auth.signInWithPassword({
      email: registerData.email,
      password: registerData.password,
    })
    if (!signInError) {
      router.push('/portal/dashboard')
      return
    }

    setSuccess('Revisá tu email para confirmar la cuenta. Después podés ingresar desde acá.')
    setIsLoading(false)
  }

  return (
    <div className="min-h-screen bg-background flex">
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden">
        <video
          autoPlay
          muted
          loop
          playsInline
          className="absolute inset-0 w-full h-full object-cover"
          poster="/images/hero-surf.jpg"
        >
          <source
            src="https://videos.pexels.com/video-files/1409899/1409899-uhd_2560_1440_25fps.mp4"
            type="video/mp4"
          />
        </video>
        <div className="absolute inset-0 bg-background/80" />
        <div className="absolute inset-0 bg-gradient-to-r from-background via-background/50 to-transparent" />

        <div className="absolute inset-0 grid-bg opacity-30" />

        <div className="relative z-10 p-12 flex flex-col justify-between h-full">
          <Link href="/" className="flex items-center gap-3 group">
            <Image
              src="/logo.png"
              alt="Comunidad"
              width={56}
              height={56}
              className="group-hover:scale-110 transition-transform"
            />
          </Link>

          <div className="space-y-8">
            <h1 className="font-[var(--font-display)] text-7xl leading-[0.85] tracking-tight">
              <span className="block text-neon-cyan text-glow-cyan drop-shadow-[0_0_30px_rgba(0,255,255,0.5)]">
                {copy.leftLines[0]}
              </span>
              <span className="block text-neon-magenta text-glow-magenta drop-shadow-[0_0_30px_rgba(255,0,255,0.5)]">
                {copy.leftLines[1]}
              </span>
              <span className="block text-neon-lime text-glow-lime drop-shadow-[0_0_30px_rgba(0,255,0,0.5)]">
                {copy.leftLines[2]}
              </span>
            </h1>

            <p className="text-muted-foreground max-w-sm">{copy.leftSub}</p>
          </div>

          <div className="flex items-center gap-4">
            <div className="flex -space-x-2">
              {[1, 2, 3, 4].map((i) => (
                <div
                  key={i}
                  className="w-8 h-8 rounded-full bg-gradient-to-br from-neon-cyan to-neon-magenta border-2 border-background"
                />
              ))}
            </div>
            <span className="text-muted-foreground text-sm">+500 miembros activos</span>
          </div>
        </div>

        <div className="absolute right-0 top-0 bottom-0 w-1 bg-gradient-to-b from-neon-cyan via-neon-magenta to-neon-lime" />
      </div>

      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 sm:p-8">
        <div className="w-full max-w-md">
          <Link
            href="/"
            className="lg:hidden flex items-center gap-2 text-muted-foreground hover:text-neon-cyan mb-8 transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Volver al inicio</span>
          </Link>

          <div className="lg:hidden flex items-center gap-3 mb-8">
            <Image src="/logo.png" alt="Comunidad" width={48} height={48} />
            <span className="font-[var(--font-display)] text-2xl bg-gradient-to-r from-neon-cyan to-neon-magenta bg-clip-text text-transparent">
              {copy.mobileBrand}
            </span>
          </div>

          {variant === 'socios' && (
            <p className="text-sm text-muted-foreground mb-4 -mt-2">
              Completá el formulario para asociarte. Si ya tenés cuenta, usá{' '}
              <button
                type="button"
                onClick={() => {
                  setMode('login')
                  setError(null)
                  setSuccess(null)
                }}
                className="text-neon-cyan hover:underline font-medium"
              >
                Ingresar
              </button>
              .
            </p>
          )}

          <div className="flex mb-8 bg-card/50 border border-white/10 rounded-xl p-1">
            <button
              type="button"
              onClick={() => {
                setMode('login')
                setError(null)
                setSuccess(null)
              }}
              className={cn(
                'flex-1 py-3 rounded-lg text-sm font-medium tracking-wide transition-all',
                mode === 'login'
                  ? 'bg-gradient-to-r from-neon-cyan to-neon-magenta text-background'
                  : 'text-muted-foreground hover:text-foreground',
              )}
            >
              INGRESAR
            </button>
            <button
              type="button"
              onClick={() => {
                setMode('register')
                setError(null)
                setSuccess(null)
              }}
              className={cn(
                'flex-1 py-3 rounded-lg text-sm font-medium tracking-wide transition-all',
                mode === 'register'
                  ? 'bg-gradient-to-r from-neon-cyan to-neon-magenta text-background'
                  : 'text-muted-foreground hover:text-foreground',
              )}
            >
              {variant === 'socios' ? 'ASOCIARME' : 'REGISTRARSE'}
            </button>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-destructive/10 border border-destructive/30 rounded-xl text-destructive text-sm">
              {error}
            </div>
          )}

          {success && (
            <div className="mb-6 p-4 bg-neon-lime/10 border border-neon-lime/30 rounded-xl text-neon-lime text-sm">
              {success}
            </div>
          )}

          {mode === 'login' ? (
            <form onSubmit={handleLogin} className="space-y-6">
              <div>
                <Label htmlFor="email" className="text-foreground/80">
                  Email
                </Label>
                <div className="relative mt-2">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                  <Input
                    id="email"
                    type="email"
                    value={loginEmail}
                    onChange={(e) => setLoginEmail(e.target.value)}
                    className="pl-12 py-6 bg-card/50 border-white/10 text-foreground placeholder:text-muted-foreground rounded-xl focus:border-neon-cyan focus:ring-neon-cyan/20"
                    placeholder="tu@email.com"
                    required
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="password" className="text-foreground/80">
                  Contraseña
                </Label>
                <div className="relative mt-2">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                  <Input
                    id="password"
                    type="password"
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    className="pl-12 py-6 bg-card/50 border-white/10 text-foreground placeholder:text-muted-foreground rounded-xl focus:border-neon-cyan focus:ring-neon-cyan/20"
                    placeholder="••••••••"
                    required
                  />
                </div>
              </div>

              <div className="flex items-center justify-between text-xs text-muted-foreground -mt-2">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    defaultChecked
                    className="h-4 w-4 rounded border-white/20 bg-transparent accent-neon-cyan"
                  />
                  <span>Recordarme en este dispositivo</span>
                </label>
                <span className="text-neon-cyan/80">Sesion guardada automaticamente</span>
              </div>

              <Button
                type="submit"
                disabled={isLoading}
                className="w-full py-6 bg-gradient-to-r from-neon-cyan via-neon-magenta to-neon-lime text-background font-bold tracking-wider rounded-xl hover:opacity-90 transition-opacity"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    INGRESANDO...
                  </>
                ) : (
                  <>
                    <Play className="mr-2 h-4 w-4" />
                    INGRESAR
                  </>
                )}
              </Button>
            </form>
          ) : (
            <form onSubmit={handleRegister} className="space-y-5">
              <div>
                <Label className="text-foreground/80">Nombre completo</Label>
                <div className="relative mt-2">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                  <Input
                    type="text"
                    value={registerData.fullName}
                    onChange={(e) =>
                      setRegisterData({ ...registerData, fullName: e.target.value })
                    }
                    className="pl-12 py-6 bg-card/50 border-white/10 text-foreground placeholder:text-muted-foreground rounded-xl focus:border-neon-cyan"
                    placeholder="Tu nombre"
                    required
                  />
                </div>
              </div>

              <div>
                <Label className="text-foreground/80">Email</Label>
                <div className="relative mt-2">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                  <Input
                    type="email"
                    value={registerData.email}
                    onChange={(e) =>
                      setRegisterData({ ...registerData, email: e.target.value })
                    }
                    className="pl-12 py-6 bg-card/50 border-white/10 text-foreground placeholder:text-muted-foreground rounded-xl focus:border-neon-cyan"
                    placeholder="tu@email.com"
                    required
                  />
                </div>
              </div>

              <div>
                <Label className="text-foreground/80">Teléfono</Label>
                <div className="relative mt-2">
                  <Phone className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                  <Input
                    type="tel"
                    value={registerData.phone}
                    onChange={(e) =>
                      setRegisterData({ ...registerData, phone: e.target.value })
                    }
                    className="pl-12 py-6 bg-card/50 border-white/10 text-foreground placeholder:text-muted-foreground rounded-xl focus:border-neon-cyan"
                    placeholder="+598 99 123 456"
                  />
                </div>
              </div>

              <div>
                <Label className="text-foreground/80">Disciplina favorita</Label>
                <div className="grid grid-cols-2 gap-3 mt-2">
                  <button
                    type="button"
                    onClick={() =>
                      setRegisterData({ ...registerData, favoriteDiscipline: 'Surf' })
                    }
                    className={cn(
                      'p-4 rounded-xl flex flex-col items-center gap-2 transition-all border',
                      registerData.favoriteDiscipline === 'Surf'
                        ? 'bg-neon-cyan/20 border-neon-cyan text-neon-cyan'
                        : 'bg-card/50 border-white/10 text-muted-foreground hover:border-white/30',
                    )}
                  >
                    <Waves className="h-6 w-6" />
                    <span className="text-sm font-medium">Surf</span>
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      setRegisterData({ ...registerData, favoriteDiscipline: 'Skate' })
                    }
                    className={cn(
                      'p-4 rounded-xl flex flex-col items-center gap-2 transition-all border',
                      registerData.favoriteDiscipline === 'Skate'
                        ? 'bg-neon-magenta/20 border-neon-magenta text-neon-magenta'
                        : 'bg-card/50 border-white/10 text-muted-foreground hover:border-white/30',
                    )}
                  >
                    <Sparkles className="h-6 w-6" />
                    <span className="text-sm font-medium">Skate</span>
                  </button>
                </div>
              </div>

              <div>
                <Label className="text-foreground/80">Contraseña</Label>
                <div className="relative mt-2">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                  <Input
                    type="password"
                    value={registerData.password}
                    onChange={(e) =>
                      setRegisterData({ ...registerData, password: e.target.value })
                    }
                    className="pl-12 py-6 bg-card/50 border-white/10 text-foreground placeholder:text-muted-foreground rounded-xl focus:border-neon-cyan"
                    placeholder="Mínimo 6 caracteres"
                    minLength={6}
                    required
                  />
                </div>
              </div>

              <Button
                type="submit"
                disabled={isLoading}
                className="w-full py-6 bg-gradient-to-r from-neon-cyan via-neon-magenta to-neon-lime text-background font-bold tracking-wider rounded-xl hover:opacity-90 transition-opacity"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    CREANDO CUENTA...
                  </>
                ) : variant === 'socios' ? (
                  'ENVIAR SOLICITUD / CREAR CUENTA'
                ) : (
                  'CREAR CUENTA'
                )}
              </Button>
            </form>
          )}

          <p className="mt-8 text-center text-muted-foreground text-sm">
            Al registrarte, aceptás nuestros términos y condiciones
          </p>

          {variant === 'socios' && (
            <p className="mt-4 text-center text-xs text-muted-foreground">
              ¿Solo querés el feed y la app social?{' '}
              <Link href="/auth/sign-up" className="text-neon-cyan hover:underline">
                Registrate acá
              </Link>{' '}
              ·{' '}
              <Link href="/auth/login" className="text-neon-magenta hover:underline">
                Ingresar a la app
              </Link>
            </p>
          )}
        </div>
      </div>
    </div>
  )
}
