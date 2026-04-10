'use client'

import { useEffect, useState } from 'react'
import Image from 'next/image'
import { Header } from '@/components/header'
import { Footer } from '@/components/footer'
import { CartDrawer } from '@/components/cart-drawer'
import { Instagram, Phone, CheckCircle, Loader2, Plane } from 'lucide-react'
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
      <main>
        {/* Header Section - ESPACIOS Style */}
        <div className="pt-32 px-4 sm:px-6 lg:px-8 pb-8 bg-white">
          <div className="max-w-7xl mx-auto">
            <div className="mb-8">
              <h1 className="text-5xl sm:text-7xl font-bold mb-2 uppercase tracking-wide text-black">
                VIAJES
              </h1>
              <p className="text-gray-600 text-lg">Experiencias de surf con todo incluido</p>
            </div>
          </div>
        </div>

        {/* Trips Horizontal Carousel - Vertical Cards */}
        <section className="py-8 bg-white">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            {loadingTrips && (
              <div className="text-center text-gray-500 text-sm py-12">
                Cargando viajes...
              </div>
            )}
            <div className="flex gap-4 overflow-x-auto pb-4 snap-x snap-mandatory scrollbar-hide">
              {trips.map((trip) => (
                <div key={trip.id} className="group flex-shrink-0 w-72 snap-start">
                  <div className="h-full bg-white border border-black/10 overflow-hidden hover:border-black transition-colors">
                    {/* Vertical Image - Instagram Stories aspect ratio */}
                    <div className="relative aspect-[9/16] overflow-hidden bg-gray-100">
                      <Image
                        src={trip.image}
                        alt={trip.destination}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                      <span className="absolute bottom-3 right-3 px-2 py-1 bg-black text-white text-xs font-medium uppercase tracking-wider">
                        {trip.dates.split(' - ')[0]}
                      </span>
                      {/* Play button overlay for video */}
                      <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                        <div className="w-16 h-16 bg-white/90 rounded-full flex items-center justify-center">
                          <Plane className="w-6 h-6 text-black" />
                        </div>
                      </div>
                    </div>

                    {/* Content */}
                    <div className="p-4 flex flex-col flex-1">
                      <h3 className="text-lg font-bold text-black mb-1 uppercase tracking-wide">
                        {trip.destination}
                      </h3>
                      <p className="text-sm text-gray-600 mb-4 line-clamp-2 flex-1">
                        {trip.description}
                      </p>

                      {/* Success state */}
                      {successTrip === trip.id ? (
                        <div className="bg-green-50 border border-green-200 p-3 text-center">
                          <CheckCircle className="h-5 w-5 text-green-600 mx-auto mb-1" />
                          <p className="text-xs text-gray-700">
                            Te contactamos pronto
                          </p>
                        </div>
                      ) : selectedTrip === trip.id ? (
                        /* Subscription form */
                        <div className="space-y-2">
                          <div className="relative">
                            <Instagram className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                            <input
                              type="text"
                              value={instagram}
                              onChange={(e) => setInstagram(e.target.value)}
                              placeholder="@tuusuario"
                              className="w-full border border-black/20 py-2 pl-10 pr-3 text-sm text-black placeholder:text-gray-400 focus:outline-none focus:border-black"
                            />
                          </div>
                          <div className="relative">
                            <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                            <input
                              type="tel"
                              value={whatsapp}
                              onChange={(e) => setWhatsapp(e.target.value)}
                              placeholder="+598 99 123 456"
                              className="w-full border border-black/20 py-2 pl-10 pr-3 text-sm text-black placeholder:text-gray-400 focus:outline-none focus:border-black"
                            />
                          </div>
                          {error && <p className="text-red-600 text-xs">{error}</p>}
                          <div className="flex gap-2">
                            <button
                              onClick={() => setSelectedTrip(null)}
                              className="flex-1 py-2 border border-black/20 text-black hover:bg-gray-50 transition-colors text-xs font-medium uppercase tracking-wider"
                            >
                              Cancelar
                            </button>
                            <button
                              onClick={() => handleSubscribe(trip.id, trip.subscriptionType)}
                              disabled={isSubmitting || !instagram || !whatsapp}
                              className="flex-1 py-2 bg-black text-white hover:bg-gray-800 transition-colors text-xs font-medium uppercase tracking-wider disabled:opacity-50"
                            >
                              {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin inline" /> : 'Enviar'}
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div className="flex items-center justify-between">
                          <span className="text-xs text-gray-500">
                            8 confirmados
                          </span>
                          <button
                            onClick={() => setSelectedTrip(trip.id)}
                            className="text-xs px-2 py-1 bg-black text-white uppercase tracking-wider hover:bg-gray-800 transition-colors"
                          >
                            Quiero ir →
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* What's Included */}
        <section className="py-16 sm:py-24 bg-gray-50">
          <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <p className="text-sm tracking-[0.2em] text-gray-500 mb-3 uppercase">Todo incluido</p>
              <h2 className="font-bold text-4xl sm:text-5xl text-black uppercase tracking-wide">
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
                  <h3 className="font-bold text-xl mb-1 text-black uppercase">{item.title}</h3>
                  <p className="text-gray-600 text-sm">{item.desc}</p>
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
