'use client'

import { useEffect, useState } from 'react'
import Image from 'next/image'
import { Header } from '@/components/header'
import { Footer } from '@/components/footer'
import { CartDrawer } from '@/components/cart-drawer'
import { Instagram, Phone, CheckCircle, Loader2, Calendar, Plane } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { createClient } from '@/lib/supabase/client'

const fallbackTrips = [
  {
    id: 'nicaragua-mayo',
    destination: 'NICARAGUA',
    dates: '14 - 24 Mayo 2026',
    description: 'Surf trip epico a las mejores olas de Nicaragua. Traslados, alojamiento y comidas incluidas.',
    image: '/images/trip-nicaragua.jpg',
    subscriptionType: 'trip_nicaragua',
  },
  {
    id: 'nicaragua-junio',
    destination: 'NICARAGUA',
    dates: '25 Junio - 5 Julio 2026',
    description: 'Segunda fecha! Olas perfectas en temporada alta. Todo incluido.',
    image: '/images/trip-nicaragua.jpg',
    subscriptionType: 'trip_nicaragua',
  },
  {
    id: 'peru',
    destination: 'PERU',
    dates: '8 - 18 Octubre 2026',
    description: 'Los mejores spots de Peru: Chicama, Huanchaco y mas. Todo incluido.',
    image: '/images/trip-peru.jpg',
    subscriptionType: 'trip_peru',
  },
]

type DbTrip = {
  id: string
  destination: string
  start_date: string
  end_date: string
  description: string | null
  image_url: string | null
  active?: boolean
  is_active?: boolean
}

function formatRange(start: string, end: string) {
  const s = new Date(start)
  const e = new Date(end)
  const sm = s.toLocaleDateString('es-UY', { day: 'numeric', month: 'long' })
  const em = e.toLocaleDateString('es-UY', { day: 'numeric', month: 'long', year: 'numeric' })
  return `${sm} - ${em}`
}

function toSubscriptionType(destination: string) {
  const d = destination.toLowerCase()
  if (d.includes('nicaragua')) return 'trip_nicaragua'
  if (d.includes('peru') || d.includes('perú')) return 'trip_peru'
  return 'trip'
}

export default function ViajesPage() {
  const [trips, setTrips] = useState(fallbackTrips)
  const [loadingTrips, setLoadingTrips] = useState(true)
  const [selectedTrip, setSelectedTrip] = useState<string | null>(null)
  const [instagram, setInstagram] = useState('')
  const [whatsapp, setWhatsapp] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [successTrip, setSuccessTrip] = useState<string | null>(null)
  const [error, setError] = useState('')

  useEffect(() => {
    const loadTrips = async () => {
      try {
        const supabase = createClient()
        const { data } = await supabase
          .from('trips')
          .select('id, destination, start_date, end_date, description, image_url, active, is_active')
          .or('active.eq.true,is_active.eq.true')
          .order('start_date', { ascending: true })
          .limit(20)

        if (data && data.length > 0) {
          const mapped = (data as DbTrip[]).map((t) => ({
            id: t.id,
            destination: (t.destination || 'VIAJE').toUpperCase(),
            dates: formatRange(t.start_date, t.end_date),
            description: t.description || 'Surf trip con todo incluido.',
            image: t.image_url || '/images/trip-nicaragua.jpg',
            subscriptionType: toSubscriptionType(t.destination || ''),
          }))
          setTrips(mapped)
        }
      } finally {
        setLoadingTrips(false)
      }
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
    <>
      <Header />
      <main className="pt-16">
        {/* Hero */}
        <section className="relative h-[60vh] min-h-[400px]">
          <Image
            src="/images/surf-action-1.jpg"
            alt="Surf Trips"
            fill
            className="object-cover"
            priority
          />
          <div className="absolute inset-0 bg-foreground/40" />
          <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-8">
            <p className="text-background/80 text-sm tracking-[0.2em] mb-4">
              SURF TRIPS 2026
            </p>
            <h1 className="font-[var(--font-display)] text-5xl sm:text-6xl lg:text-7xl text-background mb-4">
              VIAJES
            </h1>
            <p className="text-background/80 max-w-lg">
              Experiencias de surf con todo incluido. Traslados, alojamiento, comidas y las mejores olas.
            </p>
          </div>
        </section>

        {/* Trips Grid */}
        <section className="py-16 sm:py-24 bg-background">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <p className="text-sm tracking-[0.2em] text-muted-foreground mb-3">PROXIMOS DESTINOS</p>
              <h2 className="font-[var(--font-display)] text-4xl sm:text-5xl text-foreground">
                RESERVA TU LUGAR
              </h2>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {loadingTrips && (
                <div className="col-span-full text-center text-muted-foreground text-sm">
                  Cargando viajes...
                </div>
              )}
              {trips.map((trip) => (
                <div key={trip.id} className="group">
                  {/* Image */}
                  <div className="relative aspect-[4/3] overflow-hidden mb-6">
                    <Image
                      src={trip.image}
                      alt={trip.destination}
                      fill
                      className="object-cover transition-transform duration-700 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-foreground/20 group-hover:bg-foreground/30 transition-colors" />
                    <div className="absolute inset-0 flex items-center justify-center">
                      <h3 className="font-[var(--font-display)] text-5xl text-background">
                        {trip.destination}
                      </h3>
                    </div>
                  </div>

                  {/* Content */}
                  <div className="text-center">
                    <div className="flex items-center justify-center gap-2 text-accent mb-3">
                      <Calendar className="h-4 w-4" />
                      <span className="text-sm font-medium">{trip.dates}</span>
                    </div>
                    <p className="text-muted-foreground text-sm mb-6">
                      {trip.description}
                    </p>

                    {/* Success state */}
                    {successTrip === trip.id ? (
                      <div className="bg-green-500/10 border border-green-500/30 p-4 text-center">
                        <CheckCircle className="h-6 w-6 text-green-500 mx-auto mb-2" />
                        <p className="text-sm">
                          Te contactamos por WhatsApp pronto
                        </p>
                      </div>
                    ) : selectedTrip === trip.id ? (
                      /* Subscription form */
                      <div className="space-y-3 text-left">
                        <div className="relative">
                          <Instagram className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                          <input
                            type="text"
                            value={instagram}
                            onChange={(e) => setInstagram(e.target.value)}
                            placeholder="@tuusuario"
                            className="w-full border border-border py-2.5 pl-10 pr-3 text-sm focus:outline-none focus:border-foreground"
                          />
                        </div>
                        <div className="relative">
                          <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                          <input
                            type="tel"
                            value={whatsapp}
                            onChange={(e) => setWhatsapp(e.target.value)}
                            placeholder="+598 99 123 456"
                            className="w-full border border-border py-2.5 pl-10 pr-3 text-sm focus:outline-none focus:border-foreground"
                          />
                        </div>
                        {error && <p className="text-red-500 text-xs">{error}</p>}
                        <div className="flex gap-2">
                          <Button
                            onClick={() => setSelectedTrip(null)}
                            variant="outline"
                            size="sm"
                            className="flex-1"
                          >
                            Cancelar
                          </Button>
                          <Button
                            onClick={() => handleSubscribe(trip.id, trip.subscriptionType)}
                            disabled={isSubmitting || !instagram || !whatsapp}
                            size="sm"
                            className="flex-1 bg-foreground text-background hover:bg-foreground/90"
                          >
                            {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Enviar'}
                          </Button>
                        </div>
                      </div>
                    ) : (
                      /* Action button */
                      <Button
                        onClick={() => setSelectedTrip(trip.id)}
                        className="bg-foreground text-background hover:bg-foreground/90"
                      >
                        <Plane className="h-4 w-4 mr-2" />
                        Quiero ir
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* Note */}
            <div className="text-center mt-12">
              <p className="text-muted-foreground text-sm">
                Revisamos tu perfil de Instagram y te contactamos por WhatsApp con toda la info del viaje.
              </p>
            </div>
          </div>
        </section>

        {/* What's Included */}
        <section className="py-16 sm:py-24 bg-secondary/30">
          <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <p className="text-sm tracking-[0.2em] text-muted-foreground mb-3">TODO INCLUIDO</p>
              <h2 className="font-[var(--font-display)] text-4xl sm:text-5xl text-foreground">
                QUE INCLUYE
              </h2>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
              {[
                { title: 'Traslados', desc: 'Aeropuerto y spots' },
                { title: 'Alojamiento', desc: 'Frente al mar' },
                { title: 'Comidas', desc: 'Desayuno y cena' },
                { title: 'Guias', desc: 'Locales expertos' },
              ].map((item) => (
                <div key={item.title}>
                  <h3 className="font-[var(--font-display)] text-xl mb-1">{item.title}</h3>
                  <p className="text-muted-foreground text-sm">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>
      <Footer />
      <CartDrawer />
    </>
  )
}
