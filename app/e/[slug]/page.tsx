'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { ArrowLeft, Users, Calendar, MessageCircle } from 'lucide-react'
import { Header } from '@/components/header'
import { Footer } from '@/components/footer'
import { SpaceJoinButton } from '@/components/spaces/space-join-button'

export default function EspacioDetailPage({ params }: { params: { slug: string } }) {
  const [space, setSpace] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isMember, setIsMember] = useState(false)

  useEffect(() => {
    // Fetch space details
    const fetchSpace = async () => {
      try {
        // TODO: Replace with actual API call to fetch space by slug
        setSpace({
          id: '1',
          name: 'Iniciación Surf',
          slug: params.slug,
          description: 'Aprende los fundamentos del surf en nuestras clases iniciales',
          fullDescription: 'En este espacio nos enfocamos en enseñar los principios básicos del surf. Cubrimos: postura, remar, pop-up, giros básicos y seguridad acuática.',
          members: 24,
          image: 'https://images.unsplash.com/photo-1502933691298-84fc14542831?w=1200&h=600&fit=crop',
          level: 'Principiante',
          createdAt: '2024-01-15',
          schedule: 'Lunes y miércoles, 10:00-12:00',
          location: 'Playa Pocitos',
          instructor: 'Juan García',
          updates: [
            { id: 1, date: '2024-04-05', title: 'Nueva clase de iniciación', content: 'Comenzamos nuevas clases el próximo lunes.' },
            { id: 2, date: '2024-04-02', title: 'Evento especial', content: 'Tendremos una sesión de práctica libre en la playa.' },
          ]
        })
        setIsMember(false) // TODO: Check if current user is member
      } catch (error) {
        console.error('Error fetching space:', error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchSpace()
  }, [params.slug])

  if (isLoading) {
    return (
      <main className="min-h-screen bg-background">
        <Header />
        <div className="pt-32 px-4 sm:px-6 lg:px-8 pb-12 max-w-7xl mx-auto">
          <p className="text-muted-foreground">Cargando...</p>
        </div>
        <Footer />
      </main>
    )
  }

  if (!space) {
    return (
      <main className="min-h-screen bg-background">
        <Header />
        <div className="pt-32 px-4 sm:px-6 lg:px-8 pb-12 max-w-7xl mx-auto">
          <p className="text-muted-foreground text-lg">Espacio no encontrado</p>
        </div>
        <Footer />
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-background">
      <Header />
      
      <div className="pt-24 pb-12">
        {/* Hero Image */}
        <div className="relative h-80 overflow-hidden">
          <img
            src={space.image}
            alt={space.name}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-background/0 via-background/20 to-background" />
        </div>

        {/* Content */}
        <div className="px-4 sm:px-6 lg:px-8 -mt-16 relative z-10">
          <div className="max-w-4xl mx-auto">
            {/* Back button */}
            <Link
              href="/espacios"
              className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors mb-6"
            >
              <ArrowLeft className="w-4 h-4" />
              Volver a espacios
            </Link>

            {/* Header card */}
            <div className="bg-card border border-border rounded-lg p-6 sm:p-8 mb-8">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-4">
                <div>
                  <h1 className="text-4xl sm:text-5xl font-[var(--font-display)] font-bold mb-2">
                    {space.name}
                  </h1>
                  <div className="flex items-center gap-2">
                    <span className="px-3 py-1 bg-primary text-background text-xs font-medium rounded-full">
                      {space.level}
                    </span>
                    <span className="text-sm text-muted-foreground">
                      {space.members} miembros
                    </span>
                  </div>
                </div>
                <SpaceJoinButton
                  spaceId={space.id}
                  isMember={isMember}
                  onJoin={() => setIsMember(true)}
                />
              </div>
              <p className="text-muted-foreground">{space.description}</p>
            </div>

            {/* Info Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
              <div className="bg-card border border-border rounded-lg p-4 flex gap-3">
                <Calendar className="w-5 h-5 text-primary flex-shrink-0 mt-1" />
                <div>
                  <p className="text-xs text-muted-foreground mb-1">HORARIO</p>
                  <p className="text-foreground font-medium">{space.schedule}</p>
                </div>
              </div>
              <div className="bg-card border border-border rounded-lg p-4 flex gap-3">
                <Users className="w-5 h-5 text-primary flex-shrink-0 mt-1" />
                <div>
                  <p className="text-xs text-muted-foreground mb-1">INSTRUCTOR</p>
                  <p className="text-foreground font-medium">{space.instructor}</p>
                </div>
              </div>
            </div>

            {/* Full Description */}
            <div className="bg-card border border-border rounded-lg p-6 sm:p-8 mb-8">
              <h2 className="text-2xl font-[var(--font-display)] font-bold mb-4">
                Sobre este espacio
              </h2>
              <p className="text-muted-foreground leading-relaxed mb-6">
                {space.fullDescription}
              </p>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-muted-foreground mb-1">UBICACIÓN</p>
                  <p className="text-foreground font-medium">{space.location}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground mb-1">CREADO</p>
                  <p className="text-foreground font-medium">
                    {new Date(space.createdAt).toLocaleDateString('es-UY')}
                  </p>
                </div>
              </div>
            </div>

            {/* Updates */}
            {isMember && (
              <div className="bg-card border border-border rounded-lg p-6 sm:p-8">
                <div className="flex items-center gap-2 mb-6">
                  <MessageCircle className="w-5 h-5 text-primary" />
                  <h2 className="text-2xl font-[var(--font-display)] font-bold">
                    Actualizaciones
                  </h2>
                </div>
                <div className="space-y-4">
                  {space.updates.map((update) => (
                    <div key={update.id} className="border-l-2 border-primary pl-4 py-2">
                      <p className="text-xs text-muted-foreground mb-1">
                        {new Date(update.date).toLocaleDateString('es-UY')}
                      </p>
                      <h3 className="font-medium text-foreground mb-1">{update.title}</h3>
                      <p className="text-sm text-muted-foreground">{update.content}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <Footer />
    </main>
  )
}
