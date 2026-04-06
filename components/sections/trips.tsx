'use client'

import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Calendar, Plane, ArrowRight, CheckCircle, Loader2, Instagram, Phone } from 'lucide-react'
import { AnimatedSection } from '@/components/ui/animated-section'
import Image from 'next/image'
import { createClient } from '@/lib/supabase/client'

type TripCard = {
  id: string
  destination: string
  title: string
  dates: string
  startDate: string
  endDate: string
  description: string
  image: string
  subscriptionType?: string
}

const fallbackTrips: TripCard[] = [
  {
    id: 'nicaragua-mayo',
    destination: 'NICARAGUA',
    title: 'Nicaragua - Mayo 2026',
    dates: '14/05 al 24/05',
    startDate: '2026-05-14',
    endDate: '2026-05-24',
    description: 'Surf trip épico a las mejores olas de Nicaragua. Traslados, alojamiento y comidas incluidas.',
    image: '/images/trip-nicaragua.jpg',
  },
  {
    id: 'nicaragua-junio',
    destination: 'NICARAGUA',
    title: 'Nicaragua - Junio/Julio 2026',
    dates: '25/06 al 05/07',
    startDate: '2026-06-25',
    endDate: '2026-07-05',
    description: 'Segunda fecha! Olas perfectas en temporada alta. Todo incluido.',
    image: '/images/trip-nicaragua.jpg',
  },
  {
    id: 'peru',
    destination: 'PERÚ',
    title: 'Perú - Octubre 2026',
    dates: '08/10 al 18/10',
    startDate: '2026-10-08',
    endDate: '2026-10-18',
    description: 'Los mejores spots de Perú: Chicama, Huanchaco y más. Traslados, alojamiento, comida, todo incluido.',
    image: '/images/trip-peru.jpg',
  },
]

type DbTrip = {
  id: string
  destination: string
  start_date: string
  end_date: string
  description: string | null
  image_url: string | null
}

function formatDates(start: string, end: string) {
  const s = new Date(start)
  const e = new Date(end)
  const sm = s.toLocaleDateString('es-UY', { day: '2-digit', month: '2-digit' })
  const em = e.toLocaleDateString('es-UY', { day: '2-digit', month: '2-digit' })
  return `${sm} al ${em}`
}

function inferSubscriptionType(destination: string) {
  const d = destination.toLowerCase()
  if (d.includes('nicaragua')) return 'trip_nicaragua'
  if (d.includes('peru') || d.includes('perú')) return 'trip_peru'
  return 'trip'
}

export function TripsSection() {
  const [trips, setTrips] = useState<TripCard[]>(fallbackTrips)
  const [selectedTrip, setSelectedTrip] = useState<string | null>(null)
  const [instagram, setInstagram] = useState('')
  const [whatsapp, setWhatsapp] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [successTrip, setSuccessTrip] = useState<string | null>(null)
  const [error, setError] = useState('')

  useEffect(() => {
    const loadTrips = async () => {
      const supabase = createClient()
      const { data } = await supabase
        .from('trips')
        .select('id, destination, start_date, end_date, description, image_url')
        .or('active.eq.true,is_active.eq.true')
        .order('start_date', { ascending: true })
        .limit(6)

      if (!data || data.length === 0) return
      const mapped = (data as DbTrip[]).map((t) => ({
        id: t.id,
        destination: (t.destination || 'VIAJE').toUpperCase(),
        title: t.destination || 'Trip',
        dates: formatDates(t.start_date, t.end_date),
        startDate: t.start_date,
        endDate: t.end_date,
        description: t.description || 'Surf trip con todo incluido.',
        image: t.image_url || '/images/trip-nicaragua.jpg',
        subscriptionType: inferSubscriptionType(t.destination || ''),
      }))
      setTrips(mapped)
    }
    loadTrips()
  }, [])

  async function handleSubscribe(tripId: string, subscriptionType: string) {
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
          subscription_type: subscriptionType 
        }),
      })

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || 'Error al suscribirse')
      }

      setSuccessTrip(tripId)
      setInstagram('')
      setWhatsapp('')
      setSelectedTrip(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al suscribirse')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <section id="viajes" className="py-24 sm:py-32 bg-background relative section-divider">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <AnimatedSection className="text-center mb-16">
          <p className="text-sm font-medium tracking-[0.3em] text-accent mb-4">
            VIAJES 2026
          </p>
          <h2 className="font-[var(--font-display)] text-4xl sm:text-5xl md:text-6xl tracking-tight text-foreground mb-4">
            PRÓXIMOS
            <span className="text-accent"> DESTINOS</span>
          </h2>
          <p className="max-w-2xl mx-auto text-muted-foreground">
            Surf trips con todo incluido. Traslados, alojamiento, comidas y las mejores olas.
          </p>
        </AnimatedSection>

        {/* Trips Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {trips.map((trip) => (
            <AnimatedSection key={trip.id} className="group">
              <div className="relative h-full bg-foreground overflow-hidden">
                {/* Image */}
                <div className="relative h-48 sm:h-56">
                  <Image
                    src={trip.image || "/placeholder.svg"}
                    alt={trip.destination}
                    fill
                    className="object-cover opacity-70 group-hover:opacity-90 group-hover:scale-105 transition-all duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-foreground to-transparent" />
                  
                  {/* Destination badge */}
                  <div className="absolute top-4 left-4 bg-accent px-3 py-1">
                    <span className="font-[var(--font-display)] text-sm font-bold text-foreground">
                      {trip.destination}
                    </span>
                  </div>
                </div>

                {/* Content */}
                <div className="p-6">
                  <h3 className="font-[var(--font-display)] text-2xl sm:text-3xl text-background mb-3">
                    {trip.destination}
                  </h3>
                  
                  {/* Dates - Prominent */}
                  <div className="flex items-center gap-3 bg-accent/10 border border-accent/30 px-4 py-3 mb-4">
                    <Calendar className="h-5 w-5 text-accent" />
                    <div>
                      <p className="text-accent font-bold text-lg">{trip.dates}</p>
                      <p className="text-background/50 text-xs">2026</p>
                    </div>
                  </div>
                  
                  <p className="text-background/60 text-sm mb-6 line-clamp-2">
                    {trip.description}
                  </p>

                  {/* Success state */}
                  {successTrip === trip.id ? (
                    <div className="bg-green-500/10 border border-green-500/30 p-4 text-center">
                      <CheckCircle className="h-6 w-6 text-green-500 mx-auto mb-2" />
                      <p className="text-sm text-background/80">
                        Te contactamos por WhatsApp pronto
                      </p>
                    </div>
                  ) : selectedTrip === trip.id ? (
                    /* Subscription form */
                    <div className="space-y-3">
                      <div className="relative">
                        <Instagram className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-background/40" />
                        <input
                          type="text"
                          value={instagram}
                          onChange={(e) => setInstagram(e.target.value)}
                          placeholder="@tuusuario"
                          className="w-full bg-background/10 border border-background/20 py-2.5 pl-10 pr-3 text-sm text-background placeholder:text-background/40 focus:outline-none focus:border-accent"
                        />
                      </div>
                      <div className="relative">
                        <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-background/40" />
                        <input
                          type="tel"
                          value={whatsapp}
                          onChange={(e) => setWhatsapp(e.target.value)}
                          placeholder="+598 99 123 456"
                          className="w-full bg-background/10 border border-background/20 py-2.5 pl-10 pr-3 text-sm text-background placeholder:text-background/40 focus:outline-none focus:border-accent"
                        />
                      </div>
                      {error && <p className="text-red-400 text-xs">{error}</p>}
                      <div className="flex gap-2">
                        <Button
                          onClick={() => setSelectedTrip(null)}
                          variant="outline"
                          size="sm"
                          className="flex-1 border-background/30 text-background hover:bg-background/10 bg-transparent"
                        >
                          Cancelar
                        </Button>
                        <Button
                          onClick={() =>
                            handleSubscribe(
                              trip.id,
                              trip.subscriptionType || inferSubscriptionType(trip.destination),
                            )
                          }
                          disabled={isSubmitting || !instagram || !whatsapp}
                          size="sm"
                          className="flex-1 bg-background text-foreground hover:bg-background/90"
                        >
                          {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Enviar'}
                        </Button>
                      </div>
                    </div>
                  ) : (
                    /* Action buttons */
                    <div className="flex gap-3">
                      <Button
                        onClick={() => setSelectedTrip(trip.id)}
                        className="flex-1 bg-background text-foreground hover:bg-background/90 text-sm"
                      >
                        <Plane className="h-4 w-4 mr-2" />
                        Quiero ir
                      </Button>
                      <a 
                        href={`#viajes`}
                        onClick={(e) => {
                          e.preventDefault()
                          setSelectedTrip(trip.id)
                        }}
                        className="flex items-center justify-center px-4 border border-background/30 text-background hover:bg-background/10 transition-colors"
                      >
                        <ArrowRight className="h-4 w-4" />
                      </a>
                    </div>
                  )}
                </div>
              </div>
            </AnimatedSection>
          ))}
        </div>

        {/* Bottom note */}
        <AnimatedSection delay={0.3} className="text-center mt-12">
          <p className="text-muted-foreground text-sm">
            Revisamos tu perfil de Instagram y te contactamos por WhatsApp con toda la info del viaje.
          </p>
        </AnimatedSection>
      </div>
    </section>
  )
}
