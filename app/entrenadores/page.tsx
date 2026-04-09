import Link from 'next/link'
import Image from 'next/image'
import type { Metadata } from 'next'
import { Button } from '@/components/ui/button'
import { Users, Sparkles, LayoutDashboard, Mail, ArrowRight, CheckCircle2 } from 'lucide-react'

export const metadata: Metadata = {
  title: 'Entrenadores | STR Comunidad',
  description:
    'Abrí tu espacio en STR, invitá a tus alumnos y usá la misma plataforma para clases, comunidad y seguimiento.',
}

const fases = [
  {
    fase: 'Fase 1',
    titulo: 'Base compartida',
    items: [
      'Registro e ingreso (email o Google).',
      'Comunidad, feed, eventos y tienda en /app mientras sumamos módulos por espacio.',
    ],
    activa: false,
  },
  {
    fase: 'Fase 2',
    titulo: 'Espacio por entrenador',
    items: [
      'Creá tu espacio en Mis espacios → Nuevo (/espacios/nuevo) con URL /e/tu-slug.',
      'Alumnos con cuenta se unen desde la página del espacio si es público.',
      'RLS en Supabase: miembros y dueño.',
    ],
    activa: false,
  },
  {
    fase: 'Fase 3 — Ahora',
    titulo: 'Invitaciones y contenido por espacio',
    items: [
      'Link con código de invitación para espacios privados (dueño activa en la página del espacio).',
      'Feed, foros y chat por espacio: /e/tu-slug/feed, /forums, /chat — migración SQL 022 en Supabase.',
      'La comunidad global sigue en /app.',
    ],
    activa: true,
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

      <main className="mx-auto max-w-5xl px-4 sm:px-6 py-12 sm:py-20">
        <p className="text-xs font-mono tracking-[0.2em] text-neon-cyan mb-4">PLATAFORMA STR</p>
        <h1 className="font-[var(--font-display)] text-4xl sm:text-6xl lg:text-7xl text-foreground leading-[0.95] mb-6">
          TU ESPACIO
          <span className="block text-neon-magenta text-glow-magenta">PARA ENTRENAR</span>
        </h1>
        <p className="text-lg sm:text-xl text-muted-foreground max-w-2xl mb-10 leading-relaxed">
          STR es la plataforma donde los entrenadores pueden abrir su espacio e invitar a sus alumnos a la misma
          experiencia: comunidad, clases, eventos y más. Empezamos con la base que ya tenés; el resto se va sumando por
          fases.
        </p>

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
          <Link href="/espacios">
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

        <section className="rounded-2xl border border-white/10 bg-card/40 p-6 sm:p-10 mb-16">
          <div className="flex items-center gap-2 mb-6">
            <LayoutDashboard className="h-5 w-5 text-neon-lime" />
            <h2 className="font-[var(--font-display)] text-2xl sm:text-3xl">Cómo lo estamos armando</h2>
          </div>
          <div className="space-y-10">
            {fases.map((bloque) => (
              <div key={bloque.fase} className="relative pl-6 sm:pl-8 border-l-2 border-white/10">
                <span
                  className={`absolute -left-[9px] top-0 h-4 w-4 rounded-full border-2 border-background ${
                    bloque.activa ? 'bg-neon-cyan shadow-[0_0_12px_rgba(0,255,255,0.6)]' : 'bg-muted-foreground/40'
                  }`}
                />
                <p className="text-xs font-mono text-neon-cyan mb-1">{bloque.fase}</p>
                <h3 className="font-[var(--font-display)] text-xl text-foreground mb-3">{bloque.titulo}</h3>
                <ul className="space-y-2">
                  {bloque.items.map((item) => (
                    <li key={item} className="flex gap-2 text-muted-foreground text-sm sm:text-base">
                      <CheckCircle2 className="h-5 w-5 shrink-0 text-neon-lime/80 mt-0.5" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </section>

        <section className="grid sm:grid-cols-2 gap-6 mb-16">
          <div className="rounded-2xl border border-neon-cyan/20 bg-neon-cyan/5 p-6">
            <Users className="h-8 w-8 text-neon-cyan mb-4" />
            <h3 className="font-[var(--font-display)] text-xl mb-2">Acceso de instructor</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Hoy el panel avanzado sigue ligado a los permisos de administración. Si querés coordinar contenido o
              probar flujos de entrenador, escribinos y te damos de alta cuando corresponda.
            </p>
            <a href="https://wa.me/598099046165" target="_blank" rel="noopener noreferrer">
              <Button variant="outline" size="sm" className="border-neon-cyan/40 text-neon-cyan">
                <Mail className="h-4 w-4 mr-2" />
                Coordinar por WhatsApp
              </Button>
            </a>
          </div>
          <div className="rounded-2xl border border-neon-magenta/20 bg-neon-magenta/5 p-6">
            <Sparkles className="h-8 w-8 text-neon-magenta mb-4" />
            <h3 className="font-[var(--font-display)] text-xl mb-2">Feedback</h3>
            <p className="text-sm text-muted-foreground">
              Tu uso real nos dice qué construir primero en la Fase 2 (espacios por entrenador). Mientras tanto, usá la
              comunidad y contanos qué necesitás para tu grupo.
            </p>
          </div>
        </section>

        <div className="text-center">
          <Link href="/" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
            ← Volver al inicio
          </Link>
        </div>
      </main>
    </div>
  )
}
