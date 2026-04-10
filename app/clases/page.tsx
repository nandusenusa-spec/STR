'use client'

import { useEffect, useState } from 'react'
import Image from 'next/image'
import { Header } from '@/components/header'
import { Footer } from '@/components/footer'
import { CartDrawer } from '@/components/cart-drawer'
import { Instagram, Phone, CheckCircle, Loader2 } from 'lucide-react'
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
      <main>
        {/* Header Section - ESPACIOS Style */}
        <div className="pt-32 px-4 sm:px-6 lg:px-8 pb-8 bg-white">
          <div className="max-w-7xl mx-auto">
            <div className="mb-8">
              <h1 className="text-5xl sm:text-7xl font-bold mb-2 uppercase tracking-wide text-black">
                CLASES
              </h1>
              <p className="text-gray-600 text-lg">Entrenamientos en tierra para surf, skate y SUP</p>
            </div>
          </div>
        </div>

        {/* Disciplines - ESPACIOS Style */}
        <section className="py-8 bg-white">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
              {disciplines.map((discipline) => (
                <div key={discipline.id} className="group">
                  <div className="h-full bg-white border border-black/10 overflow-hidden hover:border-black transition-colors">
                    {/* Image */}
                    <div className="relative h-48 overflow-hidden bg-gray-100">
                      <Image
                        src={discipline.image}
                        alt={discipline.title}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                      <span className="absolute bottom-3 right-3 px-2 py-1 bg-black text-white text-xs font-medium uppercase tracking-wider">
                        {discipline.id === 'surf' ? 'Todos los niveles' : discipline.id === 'skate' ? 'Intermedio' : 'Principiante'}
                      </span>
                    </div>

                    {/* Content */}
                    <div className="p-4 flex flex-col flex-1">
                      <h3 className="text-lg font-bold text-black mb-1 uppercase tracking-wide">
                        {discipline.title}
                      </h3>
                      <p className="text-sm text-gray-600 mb-4 line-clamp-2 flex-1">
                        {discipline.description}
                      </p>
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-gray-500">
                          12 miembros
                        </span>
                        <span className="text-xs px-2 py-1 bg-black text-white uppercase tracking-wider cursor-pointer hover:bg-gray-800 transition-colors">
                          Entrar →
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Subscription Form */}
        <section className="py-16 sm:py-24 bg-white">
          <div className="mx-auto max-w-xl px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="font-bold text-4xl sm:text-5xl mb-4 text-black uppercase tracking-wide">
                QUIERO INFO
              </h2>
              <p className="text-gray-600">
                Dejanos tu Instagram y WhatsApp para recibir informacion sobre horarios, 
                ubicaciones y novedades.
              </p>
            </div>

            {isSuccess ? (
              <div className="bg-green-50 border border-green-200 p-8 text-center">
                <CheckCircle className="h-12 w-12 text-green-600 mx-auto mb-4" />
                <h3 className="font-bold text-2xl mb-2 text-black">Listo!</h3>
                <p className="text-gray-600">
                  Te contactaremos por WhatsApp con toda la informacion.
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label htmlFor="instagram" className="block text-sm text-gray-700 mb-2 font-medium">
                    Instagram
                  </label>
                  <div className="relative">
                    <Instagram className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <input
                      type="text"
                      id="instagram"
                      value={instagram}
                      onChange={(e) => setInstagram(e.target.value)}
                      placeholder="@tuusuario"
                      required
                      className="w-full bg-white border border-black/20 py-3 pl-10 pr-4 text-black placeholder:text-gray-400 focus:outline-none focus:border-black transition-colors"
                    />
                  </div>
                </div>
                
                <div>
                  <label htmlFor="whatsapp" className="block text-sm text-gray-700 mb-2 font-medium">
                    WhatsApp
                  </label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <input
                      type="tel"
                      id="whatsapp"
                      value={whatsapp}
                      onChange={(e) => setWhatsapp(e.target.value)}
                      placeholder="+598 99 123 456"
                      required
                      className="w-full bg-white border border-black/20 py-3 pl-10 pr-4 text-black placeholder:text-gray-400 focus:outline-none focus:border-black transition-colors"
                    />
                  </div>
                </div>

                {error && (
                  <p className="text-red-600 text-sm">{error}</p>
                )}

                <button
                  type="submit"
                  disabled={isSubmitting || !instagram || !whatsapp}
                  className="w-full bg-black text-white hover:bg-gray-800 py-3 font-bold uppercase tracking-wider disabled:opacity-50 transition-colors"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="h-5 w-5 animate-spin mr-2 inline" />
                      Enviando...
                    </>
                  ) : (
                    'Enviar'
                  )}
                </button>
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
