import Link from 'next/link'
import Image from 'next/image'
import type { Metadata } from 'next'
import { Button } from '@/components/ui/button'
import { ArrowRight, MessageCircle } from 'lucide-react'

export const metadata: Metadata = {
  title: 'Entrenadores | STR Comunidad',
  description:
    'Conocé al equipo STR: Germán García y Diego Ottonello. Sumate como instructor por WhatsApp.',
}

const WHATSAPP_NEW_COACH = 'https://wa.me/598099046165?text=Hola%2C%20quiero%20info%20para%20ser%20instructor%20en%20STR'

const equipo = [
  {
    nombre: 'Germán García',
    rol: 'Surf',
    bio: 'Instructor de surf y skate. Fundador de la comunidad STR.',
    imagen: '/images/trainers/german-garcia.jpg',
  },
  {
    nombre: 'Diego Ottonello',
    rol: 'Skate',
    bio: 'Especialista en skate y acondicionamiento físico para riders.',
    imagen: '/images/trainers/diego-ottonello.jpg',
  },
  {
    nombre: 'Germán García',
    rol: 'Acondicionamiento Físico',
    bio: 'Preparación física especializada para surfers y skaters.',
    imagen: '/images/trainers/german-garcia.jpg',
  },
]

export default function EntrenadoresPage() {
  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-white/10 bg-background/80 backdrop-blur-md sticky top-0 z-40">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <Image src="/logo.svg" alt="STR" width={36} height={36} className="h-9 w-9 object-contain" />
            <span className="font-[var(--font-display)] text-lg tracking-wide">STR</span>
          </Link>
          <div className="flex items-center gap-2">
            <a href={WHATSAPP_NEW_COACH} target="_blank" rel="noopener noreferrer">
              <Button size="sm" variant="outline" className="border-neon-lime/50 text-neon-lime gap-1.5 hidden sm:inline-flex">
                <MessageCircle className="h-4 w-4" />
                Nuevo instructor
              </Button>
            </a>
            <Link href="/auth/login">
              <Button variant="ghost" size="sm">
                Ingresar
              </Button>
            </Link>
            <Link href="/auth/sign-up">
              <Button size="sm" className="bg-gradient-to-r from-neon-cyan to-neon-magenta text-background font-semibold">
                Crear cuenta
              </Button>
            </Link>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-4 sm:px-6 py-12 sm:py-16">
        <p className="text-xs font-mono tracking-[0.2em] text-neon-cyan mb-4">EQUIPO STR</p>
        <h1 className="font-[var(--font-display)] text-4xl sm:text-6xl lg:text-7xl text-foreground leading-[0.95] mb-6">
          ENTRENADORES
          <span className="block text-neon-magenta text-glow-magenta">QUE TE LLEVAN AL AGUA</span>
        </h1>
        <p className="text-lg text-muted-foreground max-w-2xl mb-10 leading-relaxed">
          Dos referentes de la casa: preparación física y surf. ¿Querés sumarte como instructor? Escribinos por WhatsApp.
        </p>

        <a
          href={WHATSAPP_NEW_COACH}
          target="_blank"
          rel="noopener noreferrer"
          className="sm:hidden fixed bottom-5 right-5 z-50"
        >
          <Button size="lg" className="rounded-full shadow-lg bg-[#25D366] text-white hover:bg-[#20bd5a] gap-2">
            <MessageCircle className="h-5 w-5" />
            Nuevo instructor
          </Button>
        </a>

        <div className="grid sm:grid-cols-2 gap-6 mb-14">
          {equipo.map((p) => (
            <div
              key={p.nombre}
              className="rounded-2xl border border-white/10 bg-card/40 overflow-hidden flex flex-col"
            >
              <div className="relative aspect-[4/3] w-full">
                <Image src={p.imagen} alt={p.nombre} fill className="object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent" />
              </div>
              <div className="p-6 flex flex-col flex-1">
                <p className="text-xs font-mono text-neon-cyan tracking-wider mb-1">{p.rol}</p>
                <h2 className="font-[var(--font-display)] text-2xl mb-2">{p.nombre}</h2>
                <p className="text-sm text-muted-foreground flex-1">{p.bio}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-16">
          <Link href="/auth/sign-up">
            <Button
              size="lg"
              className="w-full h-14 text-base font-semibold bg-gradient-to-r from-neon-cyan via-neon-magenta to-neon-lime text-background"
            >
              Soy entrenador — registrarme
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </Link>
          <Link href="/app/espacios">
            <Button size="lg" variant="outline" className="w-full h-14 text-base border-white/20 text-foreground hover:bg-white/5">
              Mis espacios
            </Button>
          </Link>
          <Link href="/socios">
            <Button size="lg" variant="outline" className="w-full h-14 text-base border-neon-lime/40 text-neon-lime hover:bg-neon-lime/10">
              Soy alumno — ser socio
            </Button>
          </Link>
        </div>

        <div className="rounded-2xl border border-neon-lime/25 bg-neon-lime/5 p-8 text-center mb-12">
          <h3 className="font-[var(--font-display)] text-xl mb-2">¿Querés dar clases en STR?</h3>
          <p className="text-sm text-muted-foreground mb-4 max-w-md mx-auto">
            Coordinamos alta de instructores y espacios por WhatsApp.
          </p>
          <Button asChild className="bg-[#25D366] hover:bg-[#20bd5a] text-white">
            <a href={WHATSAPP_NEW_COACH} target="_blank" rel="noopener noreferrer">
              <MessageCircle className="h-4 w-4 mr-2" />
              Escribir por WhatsApp
            </a>
          </Button>
        </div>

        <div className="text-center">
          <Link href="/" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
            ← Volver al inicio
          </Link>
        </div>
      </main>
    </div>
  )
}
