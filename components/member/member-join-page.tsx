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
    <div className="min-h-screen bg-white flex">
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden bg-white">
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
        <div className="absolute inset-0 bg-black/60" />

        <div className="relative z-10 p-12 flex flex-col justify-between h-full">
          <Link href="/" className="flex items-center gap-3 group">
            <Image
              src="/logo.png"
              alt="Comunidad"
              width={56}
              height={56}
              className="group-hover:scale-110 transition-transform filter invert"
            />
          </Link>

          <div className="space-y-8">
            <h1 className="text-7xl leading-[0.85] tracking-tight font-black">
              <span className="block text-white">
                {copy.leftLines[0]}
              </span>
              <span className="block text-white">
                {copy.leftLines[1]}
              </span>
              <span className="block text-white">
                {copy.leftLines[2]}
              </span>
            </h1>

            <p className="text-white/70 max-w-sm">{copy.leftSub}</p>
          </div>

          <div className="flex items-center gap-4">
            <div className="flex -space-x-2">
              {[1, 2, 3, 4].map((i) => (
                <div
                  key={i}
                  className="w-8 h-8 rounded-full bg-white/20 border-2 border-white"
                />
              ))}
            </div>
            <span className="text-white/60 text-sm">+500 miembros activos</span>
          </div>
        </div>

        <div className="absolute right-0 top-0 bottom-0 w-1 bg-white" />
      </div>

      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 sm:p-8">
        <div className="w-full max-w-md">
          <Link
            href="/"
            className="lg:hidden flex items-center gap-2 text-gray-600 hover:text-black mb-8 transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Volver al inicio</span>
          </Link>

          <div className="lg:hidden flex items-center gap-3 mb-8">
            <Image src="/logo.png" alt="Comunidad" width={48} height={48} className="filter invert" />
            <span className="text-2xl font-black text-black">
              {copy.mobileBrand}
            </span>
          </div>

          {variant === 'socios' && (
            <p className="text-sm text-gray-600 mb-4 -mt-2">
              Completá el formulario para asociarte. Si ya tenés cuenta, usá{' '}
              <button
                type="button"
                onClick={() => {
                  setMode('login')
                  setError(null)
                  setSuccess(null)
                }}
                className="text-black hover:underline font-bold"
              >
                Ingresar
              </button>
              .
            </p>
          )}

          <div className="flex mb-8 bg-gray-50 border border-black/10 p-1">
            <button
              type="button"
              onClick={() => {
                setMode('login')
                setError(null)
                setSuccess(null)
              }}
              className={cn(
                'flex-1 py-3 text-sm font-medium tracking-wide transition-all',
                mode === 'login'
                  ? 'bg-black text-white'
                  : 'text-gray-500 hover:text-black',
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
                'flex-1 py-3 text-sm font-medium tracking-wide transition-all',
                mode === 'register'
                  ? 'bg-black text-white'
                  : 'text-gray-500 hover:text-black',
              )}
            >
              {variant === 'socios' ? 'ASOCIARME' : 'REGISTRARSE'}
            </button>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-600 text-sm">
              {error}
            </div>
          )}

          {success && (
            <div className="mb-6 p-4 bg-green-50 border border-green-200 text-green-600 text-sm">
              {success}
            </div>
          )}

          {mode === 'login' ? (
            <form onSubmit={handleLogin} className="space-y-6">
              <div>
                <Label htmlFor="email" className="text-black font-medium">
                  Email
                </Label>
                <div className="relative mt-2">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <Input
                    id="email"
                    type="email"
                    value={loginEmail}
                    onChange={(e) => setLoginEmail(e.target.value)}
                    className="pl-12 py-6 bg-white border border-black/20 text-black placeholder:text-gray-400 focus:border-black focus:ring-black/20"
                    placeholder="tu@email.com"
                    required
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="password" className="text-black font-medium">
                  Contraseña
                </Label>
                <div className="relative mt-2">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <Input
                    id="password"
                    type="password"
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    className="pl-12 py-6 bg-white border border-black/20 text-black placeholder:text-gray-400 focus:border-black focus:ring-black/20"
                    placeholder="••••••••"
                    required
                  />
                </div>
              </div>

              <div className="flex items-center justify-between text-xs text-gray-600 -mt-2">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    defaultChecked
                    className="h-4 w-4 border-black/20 bg-white accent-black"
                  />
                  <span>Recordarme en este dispositivo</span>
                </label>
                <span className="text-gray-500">Sesion guardada automaticamente</span>
              </div>

              <Button
                type="submit"
                disabled={isLoading}
                className="w-full py-6 bg-black text-white font-bold tracking-wider hover:bg-gray-800 transition-opacity"
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
                <Label className="text-black font-medium">Nombre completo</Label>
                <div className="relative mt-2">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <Input
                    type="text"
                    value={registerData.fullName}
                    onChange={(e) =>
                      setRegisterData({ ...registerData, fullName: e.target.value })
                    }
                    className="pl-12 py-6 bg-white border border-black/20 text-black placeholder:text-gray-400 focus:border-black"
                    placeholder="Tu nombre"
                    required
                  />
                </div>
              </div>

              <div>
                <Label className="text-black font-medium">Email</Label>
                <div className="relative mt-2">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <Input
                    type="email"
                    value={registerData.email}
                    onChange={(e) =>
                      setRegisterData({ ...registerData, email: e.target.value })
                    }
                    className="pl-12 py-6 bg-white border border-black/20 text-black placeholder:text-gray-400 focus:border-black"
                    placeholder="tu@email.com"
                    required
                  />
                </div>
              </div>

              <div>
                <Label className="text-black font-medium">Teléfono</Label>
                <div className="relative mt-2">
                  <Phone className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <Input
                    type="tel"
                    value={registerData.phone}
                    onChange={(e) =>
                      setRegisterData({ ...registerData, phone: e.target.value })
                    }
                    className="pl-12 py-6 bg-white border border-black/20 text-black placeholder:text-gray-400 focus:border-black"
                    placeholder="+598 99 123 456"
                  />
                </div>
              </div>

              <div>
                <Label className="text-black font-medium">Disciplina favorita</Label>
                <div className="grid grid-cols-2 gap-3 mt-2">
                  <button
                    type="button"
                    onClick={() =>
                      setRegisterData({ ...registerData, favoriteDiscipline: 'Surf' })
                    }
                    className={cn(
                      'p-4 flex flex-col items-center gap-2 transition-all border',
                      registerData.favoriteDiscipline === 'Surf'
                        ? 'bg-black border-black text-white'
                        : 'bg-white border-black/20 text-gray-500 hover:border-black',
                    )}
                  >
                    <Waves className="h-6 w-6" />
                    <span className="text-sm font-medium uppercase tracking-wider">Surf</span>
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      setRegisterData({ ...registerData, favoriteDiscipline: 'Skate' })
                    }
                    className={cn(
                      'p-4 flex flex-col items-center gap-2 transition-all border',
                      registerData.favoriteDiscipline === 'Skate'
                        ? 'bg-black border-black text-white'
                        : 'bg-white border-black/20 text-gray-500 hover:border-black',
                    )}
                  >
                    <Sparkles className="h-6 w-6" />
                    <span className="text-sm font-medium uppercase tracking-wider">Skate</span>
                  </button>
                </div>
              </div>

              <div>
                <Label className="text-black font-medium">Contraseña</Label>
                <div className="relative mt-2">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <Input
                    type="password"
                    value={registerData.password}
                    onChange={(e) =>
                      setRegisterData({ ...registerData, password: e.target.value })
                    }
                    className="pl-12 py-6 bg-white border border-black/20 text-black placeholder:text-gray-400 focus:border-black"
                    placeholder="Mínimo 6 caracteres"
                    minLength={6}
                    required
                  />
                </div>
              </div>

              <Button
                type="submit"
                disabled={isLoading}
                className="w-full py-6 bg-black text-white font-bold tracking-wider hover:bg-gray-800 transition-opacity"
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

          <p className="mt-8 text-center text-gray-600 text-sm">
            Al registrarte, aceptás nuestros términos y condiciones
          </p>

          {variant === 'socios' && (
            <p className="mt-4 text-center text-xs text-gray-600">
              ¿Solo querés el feed y la app social?{' '}
              <Link href="/auth/sign-up" className="text-black hover:underline font-medium">
                Registrate acá
              </Link>{' '}
              ·{' '}
              <Link href="/auth/login" className="text-black hover:underline font-medium">
                Ingresar a la app
              </Link>
            </p>
          )}
        </div>
      </div>
    </div>
  )
}
