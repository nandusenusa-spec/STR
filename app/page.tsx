'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { Play, Users, Video, MessageCircle, Calendar, ShoppingBag, ChevronRight, Zap, Trophy, Radio, MapPin, Plane } from 'lucide-react'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { LiveEventPopup } from '@/components/live-event-popup'
import { createClient } from '@/lib/supabase/client'
import { Header } from '@/components/header'
import { Footer } from '@/components/footer'

const fallbackLiveEvent = {
  id: '1',
  title: 'CLASE DE SKATE',
  type: 'clase' as const,
  discipline: 'skate' as const,
  location: 'Skate Park del Buceo',
  locationUrl: 'https://maps.app.goo.gl/u7Ki5hQf5vW9Gk1x7',
  coordinates: { lat: -34.9125, lng: -56.158306 },
  startTime: '10:00 AM',
  instructor: 'German Garcia',
  instructorAvatar: '/images/surf-action-1.jpg',
  attendees: [
    { id: '1', name: 'Sofia Mendez', username: 'sofi_surf', avatar: '/images/surf-action-2.jpg', instagram: 'sofi_surf', isLive: true },
    { id: '2', name: 'Lucas Perez', username: 'lucas_sk8', avatar: '/images/skate-group-2.jpg', instagram: 'lucas_sk8', isLive: true },
    { id: '3', name: 'Valentina Costa', username: 'vale_sup', avatar: '/images/surf-action-3.jpg', instagram: 'vale_sup', isLive: false },
    { id: '4', name: 'Mateo Silva', username: 'mateo_waves', avatar: '/images/surf-action-4.jpg', instagram: 'mateo_waves', isLive: true },
    { id: '5', name: 'Camila Ramos', username: 'cami_r', avatar: '/images/surf-group.jpg', isLive: false },
  ],
  maxAttendees: 10,
  image: '/images/hero-surf.jpg',
  isLive: true,
}

export default function HomePage() {
  const [showEventPopup, setShowEventPopup] = useState(false)
  const [liveEvent, setLiveEvent] = useState(fallbackLiveEvent)
  const [stats, setStats] = useState({
    members: '500+',
    videos: '120',
    chat: '24/7',
  })

  useEffect(() => {
    const load = async () => {
      const supabase = createClient()
      const [{ data: event }, { count: members }, { count: videos }] = await Promise.all([
        supabase
          .from('events')
          .select('*')
          .eq('event_type', 'class')
          .gte('start_date', new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString())
          .order('start_date', { ascending: true })
          .limit(1)
          .maybeSingle(),
        supabase.from('user_profiles').select('id', { count: 'exact', head: true }),
        supabase.from('social_posts').select('id', { count: 'exact', head: true }),
      ])

      if (event) {
        setLiveEvent((prev) => ({
          ...prev,
          id: event.id,
          title: event.title || prev.title,
          type: (event.event_type === 'trip' ? 'viaje' : event.event_type === 'meetup' ? 'meetup' : 'clase') as 'clase' | 'viaje' | 'meetup',
          discipline: (event.discipline || 'surf') as 'surf' | 'skate' | 'sup',
          location: event.location || prev.location,
          locationUrl: event.location_url || prev.locationUrl,
          coordinates: event.coordinates || prev.coordinates,
          startTime: new Date(event.start_date).toLocaleTimeString('es-UY', { hour: '2-digit', minute: '2-digit' }),
          instructor: event.instructor || prev.instructor,
          image: event.image_url || prev.image,
          maxAttendees: event.max_participants || prev.maxAttendees,
        }))
      }

      setStats({
        members: members ? `${members}` : '50',
        videos: videos ? `${videos}` : '120',
        chat: '24/7',
      })
    }
    load()
  }, [])

  return (
    <div className="min-h-screen bg-white text-black">
      {/* Header */}
      <Header />

      <main className="pt-16">
        {/* Hero Section - Nike Style */}
        <section className="relative min-h-[90vh] flex items-center overflow-hidden">
          {/* Background Video */}
          <div className="absolute inset-0">
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
            <div className="absolute inset-0 bg-black/40" />
          </div>

          <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 w-full">
            <div className="max-w-3xl">
              {/* Live indicator */}
              <button 
                onClick={() => setShowEventPopup(true)}
                className="inline-flex items-center gap-3 px-4 py-2 bg-white text-black mb-8 hover:bg-gray-100 transition-colors"
              >
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full bg-red-600 opacity-75" />
                  <span className="relative inline-flex h-2 w-2 bg-red-600" />
                </span>
                <span className="text-xs font-medium uppercase tracking-wider">Clase en vivo ahora</span>
                <ChevronRight className="w-4 h-4" />
              </button>

              <h1 className="text-white text-6xl sm:text-8xl lg:text-9xl font-black uppercase leading-[0.9] tracking-tight">
                SURF<br />
                SKATE<br />
                COMUNIDAD
              </h1>

              <p className="text-white/90 text-lg sm:text-xl mt-8 max-w-xl leading-relaxed">
                La comunidad de action sports de Uruguay. Clases en vivo, videos exclusivos, chat y viajes.
              </p>

              <div className="flex flex-col sm:flex-row gap-4 mt-10">
                <Link 
                  href="/socios"
                  className="inline-flex items-center justify-center px-8 py-4 bg-white text-black font-medium uppercase tracking-wider hover:bg-gray-100 transition-colors"
                >
                  Unirme ahora
                </Link>
                <Link 
                  href="/tienda"
                  className="inline-flex items-center justify-center px-8 py-4 bg-transparent border-2 border-white text-white font-medium uppercase tracking-wider hover:bg-white hover:text-black transition-colors"
                >
                  Ver tienda
                </Link>
              </div>
            </div>
          </div>

          {/* Scroll indicator */}
          <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 text-white">
            <div className="w-px h-12 bg-white/50" />
          </div>
        </section>

        {/* Stats Bar */}
        <section className="bg-black text-white py-8">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-3 gap-8">
              {[
                { value: stats.members, label: 'Raiders' },
                { value: stats.videos, label: 'Videos' },
                { value: stats.chat, label: 'Chat Activo' },
              ].map((stat, i) => (
                <div key={i} className="text-center">
                  <div className="text-4xl sm:text-5xl font-black">{stat.value}</div>
                  <div className="text-xs sm:text-sm text-white/60 mt-1 uppercase tracking-widest">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Features Grid - Clean Nike Style */}
        <section className="py-20 sm:py-32 bg-white">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="mb-16">
              <h2 className="text-4xl sm:text-6xl font-black uppercase">
                Todo en un<br />solo lugar
              </h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-px bg-black">
              {[
                {
                  icon: MessageCircle,
                  title: 'CHAT EN VIVO',
                  description: 'Canales por disciplina. Conecta con surfers, skaters y paddlers.',
                  href: '/socios',
                },
                {
                  icon: Video,
                  title: 'VIDEO CLASES',
                  description: 'Aprende tecnicas y maniobras con videos exclusivos.',
                  href: '/socios',
                },
                {
                  icon: Radio,
                  title: 'LIVES',
                  description: 'Sesiones en vivo desde la playa y el skatepark.',
                  href: '/socios',
                },
                {
                  icon: Calendar,
                  title: 'EVENTOS',
                  description: 'Clases presenciales, viajes y meetups.',
                  href: '/socios',
                },
                {
                  icon: Users,
                  title: 'COMUNIDAD',
                  description: 'Conecta con otros atletas y crece junto a ellos.',
                  href: '/socios',
                },
                {
                  icon: ShoppingBag,
                  title: 'SHOP',
                  description: 'Merch oficial, cursos premium y reservas.',
                  href: '/tienda',
                },
              ].map((feature, i) => (
                <Link 
                  key={i} 
                  href={feature.href}
                  className="group bg-white p-8 sm:p-12 hover:bg-gray-50 transition-colors"
                >
                  <feature.icon className="w-8 h-8 text-black mb-6" strokeWidth={1.5} />
                  <h3 className="text-xl font-bold uppercase mb-3">{feature.title}</h3>
                  <p className="text-gray-600 text-sm leading-relaxed">{feature.description}</p>
                  <div className="mt-6 flex items-center gap-2 text-sm font-medium uppercase tracking-wider group-hover:gap-4 transition-all">
                    <span>Ver mas</span>
                    <ChevronRight className="w-4 h-4" />
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* Live Now Section */}
        <section className="py-20 sm:py-32 bg-gray-100">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col lg:flex-row gap-12">
              {/* Left - Live preview */}
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-6 h-6 bg-black flex items-center justify-center">
                    <Plane className="w-4 h-4 text-white" />
                  </div>
                  <span className="text-sm font-medium uppercase tracking-wider">Proximo viaje</span>
                </div>
                
                <button
                  onClick={() => setShowEventPopup(true)}
                  className="relative w-full aspect-video overflow-hidden group"
                >
                  <Image
                    src="/images/hero-surf.jpg"
                    alt="Live class"
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-700"
                  />
                  <div className="absolute inset-0 bg-black/20 group-hover:bg-black/30 transition-colors" />
                  
                  {/* Play button */}
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-20 h-20 bg-white flex items-center justify-center group-hover:scale-110 transition-transform">
                      <Play className="w-8 h-8 text-black ml-1" />
                    </div>
                  </div>
                  
                  {/* Bottom info */}
                  <div className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-black/80 to-transparent">
                    <h3 className="text-white text-2xl sm:text-3xl font-black uppercase">{liveEvent.title}</h3>
                    <div className="flex items-center gap-4 mt-2 text-sm text-white/80">
                      <span className="flex items-center gap-1">
                        <MapPin className="w-4 h-4" />
                        {liveEvent.location}
                      </span>
                      <span className="flex items-center gap-1">
                        <Users className="w-4 h-4" />
                        {liveEvent.attendees.length} asistiendo
                      </span>
                    </div>
                  </div>
                </button>
              </div>
              
              {/* Right - Attendees */}
              <div className="lg:w-80">
                <h3 className="text-sm font-medium uppercase tracking-wider mb-4">Confirmados</h3>
                <p className="text-xs text-gray-600 mb-6">
                  Quedan pocos lugares, no te quedes afuera
                </p>
                <div className="space-y-2">
                  {liveEvent.attendees.map((attendee) => (
                    <div 
                      key={attendee.id}
                      className="flex items-center gap-3 p-3 bg-white hover:bg-gray-50 transition-colors"
                    >
                      <div className="relative">
                        <Avatar className="w-10 h-10">
                          <AvatarImage src={attendee.avatar} />
                          <AvatarFallback className="bg-gray-200 text-black">{attendee.name[0]}</AvatarFallback>
                        </Avatar>
                        {attendee.isLive && (
                          <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-red-600 border-2 border-white" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm truncate">{attendee.name}</p>
                        <p className="text-xs text-gray-500">@{attendee.username}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20 sm:py-32 bg-black text-white">
          <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 text-center">
            <p className="text-sm uppercase tracking-widest text-white/60 mb-4">Acceso gratuito</p>
            <h2 className="text-4xl sm:text-6xl font-black uppercase mb-6">
              Ready to<br />level up?
            </h2>
            <p className="text-lg text-white/80 mb-10 max-w-xl mx-auto">
              Accede a chat en vivo, videos exclusivos, eventos y conecta con cientos de atletas.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link 
                href="/socios"
                className="inline-flex items-center justify-center px-10 py-4 bg-white text-black font-medium uppercase tracking-wider hover:bg-gray-100 transition-colors"
              >
                <Trophy className="w-5 h-5 mr-2" />
                Unirme ahora
              </Link>
              <Link 
                href="/auth/login"
                className="inline-flex items-center justify-center px-10 py-4 border-2 border-white text-white font-medium uppercase tracking-wider hover:bg-white hover:text-black transition-colors"
              >
                Ya tengo cuenta
              </Link>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <Footer />

      {/* Live Event Popup */}
      <LiveEventPopup 
        isOpen={showEventPopup} 
        onClose={() => setShowEventPopup(false)} 
        event={liveEvent}
      />
    </div>
  )
}
