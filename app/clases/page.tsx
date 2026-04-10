'use client'

import { useEffect, useState } from 'react'
import Image from 'next/image'
import { Header } from '@/components/header'
import { Footer } from '@/components/footer'
import { CartDrawer } from '@/components/cart-drawer'
import Link from 'next/link'
import { Instagram, Phone, CheckCircle, Loader2, Calendar, ArrowRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { createClient } from '@/lib/supabase/client'

const fallbackDisciplines = [
  {
    id: 'surf',
    title: 'SURF',
    description: 'Entrenamiento en tierra para mejorar tu surf. Movimientos, técnica, equilibrio y fuerza específica.',
    image: '/images/hero-surf.jpg',
  },
  {
    id: 'skate',
    title: 'SKATE',
    description: 'Mejora tu técnica de skate y desarrolla habilidades que se transfieren directamente al surf.',
    image: '/images/discipline-skate.jpg',
  },
  {
    id: 'sup',
    title: 'SUP',
    description: 'Stand Up Paddle. Equilibrio, fuerza y conexión con el agua en sesiones grupales.',
    image: '/images/discipline-sup.jpg',
  },
]

type ScheduleRow = {
  discipline: string
}

const disciplineAssets: Record<string, { title: string; image: string; description: string }> = {
  surf: {
    title: 'SURF',
    image: '/images/hero-surf.jpg',
    description:
      'Entrenamiento en tierra para mejorar tu surf. Movimientos, tecnica, equilibrio y fuerza especifica.',
  },
  skate: {
    title: 'SKATE',
    image: '/images/discipline-skate.jpg',
    description:
      'Mejora tu tecnica de skate y desarrolla habilidades que se transfieren directamente al surf.',
  },
  sup: {
    title: 'SUP',
    image: '/images/discipline-sup.jpg',
    description:
      'Stand Up Paddle. Equilibrio, fuerza y conexion con el agua en sesiones grupales.',
  },
}

export default function ClasesPage() {
  const [disciplines, setDisciplines] = useState(fallbackDisciplines)
  const [instagram, setInstagram] = useState('')
  const [whatsapp, setWhatsapp] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    const loadDisciplines = async () => {
      const supabase = createClient()
      const { data } = await supabase
        .from('training_schedule')
        .select('discipline')
        .or('active.eq.true,is_active.eq.true')

      if (!data || data.length === 0) return
      const unique = [...new Set((data as ScheduleRow[]).map((r) => String(r.discipline).toLowerCase()))]
      const mapped = unique
        .map((d) => disciplineAssets[d])
        .filter(Boolean)
        .map((d) => ({
          id: d.title.toLowerCase(),
          title: d.title,
          description: d.description,
          image: d.image,
        }))

      if (mapped.length > 0) setDisciplines(mapped)
    }
    loadDisciplines()
  }, [])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!instagram || !whatsapp) return

    setIsSubmitting(true)
    setError('')

    try {
      const res = await fetch('/api/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          instagram_username: instagram.replace('@', ''), 
          whatsapp_phone: whatsapp, 
          subscription_type: 'newsletter' 
        }),
      })

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || 'Error al suscribirse')
      }

      setIsSuccess(true)
      setInstagram('')
      setWhatsapp('')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al suscribirse')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <>
      <Header />
      <main className="pt-16">
        {/* Hero */}
        <section className="relative h-[60vh] min-h-[400px]">
          <Image
            src="/images/hero-community.jpg"
            alt="Clases STR"
            fill
            className="object-cover"
            priority
          />
          <div className="absolute inset-0 bg-foreground/40" />
          <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-8">
            <p className="text-background/80 text-sm tracking-[0.2em] mb-4">
              MONTEVIDEO, URUGUAY
            </p>
            <h1 className="font-[var(--font-display)] text-5xl sm:text-6xl lg:text-7xl text-background mb-4">
              CLASES
            </h1>
            <p className="text-background/80 max-w-lg">
              Entrenamientos en tierra para surf, skate y SUP. Mejora tu tecnica y lleva tu nivel al siguiente paso.
            </p>
          </div>
        </section>

        {/* Coming Soon Banner */}
        <section className="bg-accent text-foreground py-4">
          <div className="mx-auto max-w-7xl px-4 text-center">
            <div className="flex items-center justify-center gap-2">
              <Calendar className="h-4 w-4" />
              <span className="text-sm font-medium">Clases presenciales desde Marzo 2026</span>
            </div>
          </div>
        </section>

        {/* Disciplines — estilo “espacios” (cards) */}
        <section className="py-16 sm:py-24 bg-background">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <p className="text-sm tracking-[0.2em] text-muted-foreground mb-3">DISCIPLINAS</p>
              <h2 className="font-[var(--font-display)] text-4xl sm:text-5xl text-foreground">
                ENTRENA TU FLOW
              </h2>
            </div>

            <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 list-none p-0 m-0">
              {disciplines.map((discipline) => (
                <li key={discipline.id} className="h-full min-h-0">
                  <div className="rounded-2xl border border-white/10 bg-card/30 overflow-hidden flex flex-col h-full">
                    <div className="relative aspect-[16/10] w-full">
                      <Image
                        src={discipline.image}
                        alt={discipline.title}
                        fill
                        className="object-cover"
                      />
                      <div className="absolute top-3 left-3">
                        <Badge className="bg-background/80 text-foreground border border-white/20 font-[var(--font-display)] tracking-wide">
                          {discipline.title}
                        </Badge>
                      </div>
                    </div>
                    <div className="p-5 flex flex-col flex-1 gap-4">
                      <p className="text-sm text-muted-foreground flex-1">{discipline.description}</p>
                      <Button asChild variant="outline" className="w-full border-neon-cyan/40 text-neon-cyan shrink-0">
                        <Link href="/auth/login?redirect=/app">
                          Entrar
                          <ArrowRight className="h-4 w-4 ml-2" />
                        </Link>
                      </Button>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </section>

        {/* Subscription Form */}
        <section className="py-16 sm:py-24 bg-foreground text-background">
          <div className="mx-auto max-w-xl px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="font-[var(--font-display)] text-4xl sm:text-5xl mb-4">
                QUIERO INFO
              </h2>
              <p className="text-background/70">
                Dejanos tu Instagram y WhatsApp para recibir informacion sobre horarios, 
                ubicaciones y novedades.
              </p>
            </div>

            {isSuccess ? (
              <div className="bg-green-500/10 border border-green-500/30 p-8 text-center">
                <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
                <h3 className="font-[var(--font-display)] text-2xl mb-2">Listo!</h3>
                <p className="text-background/70">
                  Te contactaremos por WhatsApp con toda la informacion.
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label htmlFor="instagram" className="block text-sm text-background/70 mb-2">
                    Instagram
                  </label>
                  <div className="relative">
                    <Instagram className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-background/40" />
                    <input
                      type="text"
                      id="instagram"
                      value={instagram}
                      onChange={(e) => setInstagram(e.target.value)}
                      placeholder="@tuusuario"
                      required
                      className="w-full bg-background/10 border border-background/20 py-3 pl-10 pr-4 text-background placeholder:text-background/40 focus:outline-none focus:border-accent transition-colors"
                    />
                  </div>
                </div>
                
                <div>
                  <label htmlFor="whatsapp" className="block text-sm text-background/70 mb-2">
                    WhatsApp
                  </label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-background/40" />
                    <input
                      type="tel"
                      id="whatsapp"
                      value={whatsapp}
                      onChange={(e) => setWhatsapp(e.target.value)}
                      placeholder="+598 99 123 456"
                      required
                      className="w-full bg-background/10 border border-background/20 py-3 pl-10 pr-4 text-background placeholder:text-background/40 focus:outline-none focus:border-accent transition-colors"
                    />
                  </div>
                </div>

                {error && (
                  <p className="text-red-400 text-sm">{error}</p>
                )}

                <Button
                  type="submit"
                  disabled={isSubmitting || !instagram || !whatsapp}
                  className="w-full bg-background text-foreground hover:bg-background/90 py-6 font-medium"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="h-5 w-5 animate-spin mr-2" />
                      Enviando...
                    </>
                  ) : (
                    'Enviar'
                  )}
                </Button>
              </form>
            )}
          </div>
        </section>
      </main>
      <Footer />
      <CartDrawer />
    </>
  )
}
