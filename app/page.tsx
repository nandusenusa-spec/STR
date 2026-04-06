'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { Play, Users, Video, MessageCircle, Calendar, ShoppingBag, ChevronRight, Zap, Trophy, Radio, MapPin, Clock } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { LiveEventPopup } from '@/components/live-event-popup'
import { createClient } from '@/lib/supabase/client'

const fallbackLiveEvent = {
  id: '1',
  title: 'CLASE DE SURF',
  type: 'clase' as const,
  discipline: 'surf' as const,
  location: 'Playa Pocitos, Montevideo',
  locationUrl: 'https://maps.google.com/?q=-34.9125,-56.1583',
  coordinates: { lat: -34.9125, lng: -56.1583 },
  startTime: '9:00 AM',
  instructor: 'Martin Rodriguez',
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
          startTime: new Date(event.start_date).toLocaleTimeString('es-UY', { hour: '2-digit', minute: '2-digit' }),
          image: event.image_url || prev.image,
          maxAttendees: event.max_participants || prev.maxAttendees,
        }))
      }

      setStats({
        members: members ? `${members}+` : '500+',
        videos: videos ? `${videos}` : '120',
        chat: '24/7',
      })
    }
    load()
  }, [])

  return (
    <div className="min-h-screen bg-background overflow-x-hidden">
      {/* Animated background elements */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-neon-cyan/5 rounded-full blur-[150px] animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-neon-magenta/5 rounded-full blur-[150px] animate-pulse" style={{ animationDelay: '1s' }} />
        <div className="absolute top-1/2 right-1/3 w-64 h-64 bg-neon-lime/5 rounded-full blur-[100px] animate-pulse" style={{ animationDelay: '2s' }} />
      </div>

      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-background/60 backdrop-blur-2xl border-b border-white/5">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            <Link href="/" className="flex items-center gap-3 group">
              <Image
                src="/logo.png"
                alt="Comunidad"
                width={40}
                height={40}
                className="h-10 w-10 object-contain"
              />
              <span className="font-[var(--font-display)] text-2xl tracking-wider hidden sm:block bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent group-hover:from-neon-cyan group-hover:to-neon-magenta transition-all duration-500">COMUNIDAD</span>
            </Link>
            
            <nav className="hidden md:flex items-center gap-8">
              {[
                { label: 'COMUNIDAD', href: '/app', color: 'hover:text-neon-cyan' },
                { label: 'FEED', href: '/app/feed', color: 'hover:text-neon-magenta' },
                { label: 'EVENTOS', href: '/app/events', color: 'hover:text-neon-lime' },
                { label: 'SHOP', href: '/tienda', color: 'hover:text-neon-orange' },
              ].map((item) => (
                <Link key={item.label} href={item.href} className={`text-sm text-muted-foreground ${item.color} transition-colors relative group`}>
                  {item.label}
                  <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-current transition-all group-hover:w-full" />
                </Link>
              ))}
            </nav>

            <div className="flex items-center gap-2 sm:gap-3 flex-wrap justify-end">
              <Link href="/socios" className="hidden sm:inline-flex">
                <Button variant="outline" size="sm" className="border-neon-lime/40 text-neon-lime hover:bg-neon-lime/10">
                  Ser socio
                </Button>
              </Link>
              <Link href="/auth/login">
                <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground">
                  Ingresar
                </Button>
              </Link>
              <Link href="/auth/sign-up">
                <Button size="sm" className="relative overflow-hidden bg-gradient-to-r from-neon-cyan to-neon-magenta text-background font-bold hover:opacity-90 glow-cyan group">
                  <span className="relative z-10">Unirse</span>
                  <div className="absolute inset-0 bg-gradient-to-r from-neon-magenta to-neon-cyan opacity-0 group-hover:opacity-100 transition-opacity" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      <main>
        {/* Hero Section */}
        <section className="relative min-h-screen flex items-center justify-center overflow-hidden pt-16">
          {/* Video Background - supports both vertical (9:16) and horizontal */}
          <div className="absolute inset-0 flex items-center justify-center">
            <video
              autoPlay
              muted
              loop
              playsInline
              className="absolute h-full w-auto max-w-none object-cover opacity-40 sm:w-full sm:h-full sm:object-cover"
              poster="/images/hero-surf.jpg"
              style={{ minWidth: '100%', minHeight: '100%' }}
            >
              <source src="https://videos.pexels.com/video-files/1409899/1409899-uhd_2560_1440_25fps.mp4" type="video/mp4" />
            </video>
            <div className="absolute inset-0 bg-gradient-to-t from-background via-background/80 to-background/40" />
            <div className="absolute inset-0 grid-bg opacity-40" />
            <div className="absolute inset-0 bg-[repeating-linear-gradient(0deg,transparent,transparent_2px,rgba(0,0,0,0.1)_2px,rgba(0,0,0,0.1)_4px)] pointer-events-none" />
          </div>

          <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center">
            {/* Live Event Banner - Clickable */}
            <button 
              onClick={() => setShowEventPopup(true)}
              className="inline-flex items-center gap-3 px-5 py-3 rounded-full bg-destructive/20 border border-destructive/50 mb-8 hover:bg-destructive/30 hover:border-destructive transition-all group cursor-pointer animate-entry-banner"
            >
              <span className="relative flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-destructive opacity-75" />
                <span className="relative inline-flex rounded-full h-3 w-3 bg-destructive" />
              </span>
              <span className="text-sm font-mono text-destructive">CLASE EN VIVO</span>
              <div className="flex -space-x-2">
                {liveEvent.attendees.slice(0, 3).map((a, i) => (
                  <Avatar key={i} className="w-6 h-6 border-2 border-background">
                    <AvatarImage src={a.avatar} />
                    <AvatarFallback>{a.name[0]}</AvatarFallback>
                  </Avatar>
                ))}
              </div>
              <span className="text-xs text-muted-foreground">+{liveEvent.attendees.length - 3} asistiendo</span>
              <ChevronRight className="w-4 h-4 text-destructive group-hover:translate-x-1 transition-transform" />
            </button>

            <h1 className="font-[var(--font-display)] text-[3.5rem] sm:text-9xl lg:text-[12rem] leading-[0.85] tracking-tight mb-6">
              <span className="block text-glow-cyan text-neon-cyan drop-shadow-[0_0_30px_rgba(0,255,255,0.5)] animate-entry-title animate-entry-delay-1">SURF</span>
              <span className="block text-glow-magenta text-neon-magenta drop-shadow-[0_0_30px_rgba(255,0,255,0.5)] animate-entry-title animate-entry-delay-2">SKATE</span>
              <span className="block text-glow-lime text-neon-lime drop-shadow-[0_0_30px_rgba(0,255,0,0.5)] animate-entry-title animate-entry-delay-3">COMUNIDAD</span>
            </h1>

            <p className="text-base sm:text-2xl text-muted-foreground max-w-2xl mx-auto mb-8 leading-relaxed animate-entry-subtitle px-2">
              La comunidad de action sports de Uruguay.
              <span className="text-foreground font-medium"> Clases en vivo, videos, chat y viajes.</span>
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 animate-entry-buttons w-full px-4">
              <Link href="/app" className="w-full sm:w-auto">
                <Button size="lg" className="relative overflow-hidden bg-gradient-to-r from-neon-cyan via-neon-magenta to-neon-lime text-background font-bold text-base sm:text-lg px-6 py-5 group w-full sm:w-auto">
                  <span className="relative z-10 flex items-center justify-center">
                    <Play className="w-5 h-5 mr-2" />
                    ENTRAR A LA COMUNIDAD
                  </span>
                  <div className="absolute inset-0 bg-gradient-to-r from-neon-lime via-neon-cyan to-neon-magenta opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                </Button>
              </Link>
              <button
                onClick={() => setShowEventPopup(true)}
                className="flex items-center justify-center gap-2 px-6 py-4 rounded-full border border-destructive/50 text-destructive hover:bg-destructive/10 transition-colors w-full sm:w-auto"
              >
                <Radio className="w-5 h-5 animate-pulse" />
                <span className="font-medium">Ver clase en vivo</span>
              </button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-4 mt-16 max-w-3xl mx-auto">
              {[
                { value: stats.members, label: 'Miembros', color: 'text-neon-cyan', shadow: 'drop-shadow-[0_0_10px_rgba(0,255,255,0.5)]' },
                { value: stats.videos, label: 'Videos', color: 'text-neon-magenta', shadow: 'drop-shadow-[0_0_10px_rgba(255,0,255,0.5)]' },
                { value: stats.chat, label: 'Chat Activo', color: 'text-neon-lime', shadow: 'drop-shadow-[0_0_10px_rgba(0,255,0,0.5)]' },
              ].map((stat, i) => (
                <div key={i} className="text-center group">
                  <div className={`font-[var(--font-display)] text-3xl sm:text-6xl ${stat.color} ${stat.shadow} group-hover:scale-110 transition-transform`}>{stat.value}</div>
                  <div className="text-xs sm:text-sm text-muted-foreground mt-2 uppercase tracking-widest">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Scroll indicator */}
          <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 text-muted-foreground">
            <span className="text-xs tracking-[0.3em] font-mono">SCROLL</span>
            <div className="w-px h-16 bg-gradient-to-b from-neon-cyan via-neon-magenta to-transparent" />
          </div>
        </section>

        {/* Live Activity Strip */}
        <section className="py-6 border-y border-white/5 bg-card/30 backdrop-blur-sm overflow-hidden">
          <div className="flex animate-marquee whitespace-nowrap">
            {[...Array(10)].map((_, i) => (
              <div key={i} className="flex items-center gap-8 mx-8">
                <span className="flex items-center gap-2 text-sm">
                  <span className="w-2 h-2 rounded-full bg-neon-cyan animate-pulse" />
                  <span className="text-muted-foreground">@sofi_surf</span>
                  <span className="text-neon-cyan">subio una foto</span>
                </span>
                <span className="flex items-center gap-2 text-sm">
                  <span className="w-2 h-2 rounded-full bg-neon-magenta animate-pulse" />
                  <span className="text-muted-foreground">@lucas_sk8</span>
                  <span className="text-neon-magenta">se unio al chat</span>
                </span>
                <span className="flex items-center gap-2 text-sm">
                  <span className="w-2 h-2 rounded-full bg-destructive animate-pulse" />
                  <span className="text-muted-foreground">Clase de surf</span>
                  <span className="text-destructive">EN VIVO</span>
                </span>
              </div>
            ))}
          </div>
        </section>

        {/* Features Grid */}
        <section id="features" className="py-16 sm:py-32 relative">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-neon-cyan/10 border border-neon-cyan/30 mb-6">
                <Zap className="w-4 h-4 text-neon-cyan" />
                <span className="text-xs sm:text-sm font-mono text-neon-cyan">PLATAFORMA TODO-EN-UNO</span>
              </div>
              <h2 className="font-[var(--font-display)] text-4xl sm:text-7xl text-foreground mb-4">
                NIVEL <span className="text-neon-magenta text-glow-magenta">SIGUIENTE</span>
              </h2>
              <p className="text-muted-foreground text-base sm:text-xl max-w-2xl mx-auto px-2">
                Chat en vivo, clases en video, eventos y una comunidad que comparte tu pasion
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {[
                {
                  icon: MessageCircle,
                  title: 'CHAT EN VIVO',
                  description: 'Canales por disciplina. Habla con otros surfers, skaters y paddlers en tiempo real.',
                  color: 'from-neon-cyan to-cyan-600',
                  borderColor: 'hover:border-neon-cyan/50',
                  href: '/app/chat',
                },
                {
                  icon: Video,
                  title: 'VIDEO CLASES',
                  description: 'Aprende tecnicas, trucos y maniobras con nuestros videos exclusivos.',
                  color: 'from-neon-magenta to-pink-600',
                  borderColor: 'hover:border-neon-magenta/50',
                  href: '/app/feed',
                },
                {
                  icon: Radio,
                  title: 'LIVES',
                  description: 'Sesiones en vivo desde la playa, el skatepark o el rio.',
                  color: 'from-destructive to-red-600',
                  borderColor: 'hover:border-destructive/50',
                  href: '/app',
                },
                {
                  icon: Calendar,
                  title: 'EVENTOS',
                  description: 'Clases presenciales, viajes grupales y meetups de la comunidad.',
                  color: 'from-neon-lime to-green-600',
                  borderColor: 'hover:border-neon-lime/50',
                  href: '/app/events',
                },
                {
                  icon: Users,
                  title: 'COMUNIDAD',
                  description: 'Conecta con otros atletas, comparte tus sesiones y crece juntos.',
                  color: 'from-neon-orange to-orange-600',
                  borderColor: 'hover:border-neon-orange/50',
                  href: '/app/members',
                },
                {
                  icon: ShoppingBag,
                  title: 'SHOP',
                  description: 'Merch oficial, cursos premium y reservas de viajes.',
                  color: 'from-neon-purple to-purple-600',
                  borderColor: 'hover:border-neon-purple/50',
                  href: '/tienda',
                },
              ].map((feature, i) => (
                <Link 
                  key={i} 
                  href={feature.href}
                  className={`group relative p-5 sm:p-8 rounded-2xl bg-card/50 border border-white/5 ${feature.borderColor} transition-all duration-500 hover:-translate-y-2 overflow-hidden`}
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-white/[0.02] to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                  <div className={`w-12 h-12 sm:w-16 sm:h-16 rounded-2xl bg-gradient-to-br ${feature.color} flex items-center justify-center mb-4 sm:mb-6 group-hover:scale-110 transition-transform`}>
                    <feature.icon className="w-6 h-6 sm:w-8 sm:h-8 text-background" />
                  </div>
                  <h3 className="font-[var(--font-display)] text-2xl sm:text-3xl text-foreground mb-2 sm:mb-3">{feature.title}</h3>
                  <p className="text-sm sm:text-base text-muted-foreground">{feature.description}</p>
                  <ChevronRight className="absolute top-5 right-5 sm:top-8 sm:right-8 w-5 h-5 text-muted-foreground/30 group-hover:text-foreground group-hover:translate-x-2 transition-all" />
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* Live Now Section */}
        <section className="py-24 bg-gradient-to-b from-background via-card/50 to-background relative overflow-hidden">
          <div className="absolute inset-0 grid-bg opacity-20" />
          
          <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col lg:flex-row items-start gap-12">
              {/* Left - Live preview */}
              <div className="flex-1 w-full">
                <div className="flex items-center gap-3 mb-6">
                  <span className="relative flex h-4 w-4">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-destructive opacity-75" />
                    <span className="relative inline-flex rounded-full h-4 w-4 bg-destructive" />
                  </span>
                  <span className="font-[var(--font-display)] text-3xl text-destructive">EN VIVO AHORA</span>
                </div>
                
                <button
                  onClick={() => setShowEventPopup(true)}
                  className="relative w-full aspect-video rounded-2xl overflow-hidden border-2 border-destructive/30 hover:border-destructive transition-colors group cursor-pointer"
                >
                  <Image
                    src="/images/hero-surf.jpg"
                    alt="Live class"
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-700"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-background via-background/30 to-transparent" />
                  
                  {/* Play button overlay */}
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-20 h-20 rounded-full bg-destructive/90 flex items-center justify-center group-hover:scale-110 transition-transform glow-pink">
                      <Play className="w-8 h-8 text-white ml-1" />
                    </div>
                  </div>
                  
                  {/* Bottom info */}
                  <div className="absolute bottom-0 left-0 right-0 p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-[var(--font-display)] text-3xl text-foreground">CLASE DE SURF</h3>
                        <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <MapPin className="w-4 h-4" />
                            Playa Pocitos
                          </span>
                          <span className="flex items-center gap-1">
                            <Users className="w-4 h-4" />
                            5 asistiendo
                          </span>
                        </div>
                      </div>
                      <div className="flex -space-x-3">
                        {liveEvent.attendees.slice(0, 4).map((a, i) => (
                          <Avatar key={i} className="w-10 h-10 border-2 border-background">
                            <AvatarImage src={a.avatar} />
                            <AvatarFallback>{a.name[0]}</AvatarFallback>
                          </Avatar>
                        ))}
                      </div>
                    </div>
                  </div>
                </button>
              </div>
              
              {/* Right - Attendees list */}
              <div className="w-full lg:w-80">
                <h3 className="font-[var(--font-display)] text-2xl mb-6">ASISTIENDO</h3>
                <div className="space-y-3">
                  {liveEvent.attendees.map((attendee) => (
                    <div 
                      key={attendee.id}
                      className="flex items-center gap-3 p-3 rounded-xl bg-card/50 border border-white/5 hover:border-neon-cyan/30 transition-colors group"
                    >
                      <div className="relative">
                        <Avatar className="w-12 h-12">
                          <AvatarImage src={attendee.avatar} />
                          <AvatarFallback>{attendee.name[0]}</AvatarFallback>
                        </Avatar>
                        {attendee.isLive && (
                          <span className="absolute -bottom-0.5 -right-0.5 w-4 h-4 rounded-full bg-destructive border-2 border-background flex items-center justify-center">
                            <Radio className="w-2 h-2 text-white" />
                          </span>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium truncate">{attendee.name}</p>
                        <p className="text-sm text-muted-foreground">@{attendee.username}</p>
                      </div>
                      <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        {attendee.instagram && (
                          <a
                            href={`https://instagram.com/${attendee.instagram}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center hover:opacity-80 transition-opacity"
                          >
                            <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 24 24">
                              <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                            </svg>
                          </a>
                        )}
                        <button className="w-8 h-8 rounded-lg bg-neon-cyan flex items-center justify-center hover:opacity-80 transition-opacity">
                          <MessageCircle className="w-4 h-4 text-background" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="py-16 sm:py-32 relative overflow-hidden">
          <div className="absolute inset-0">
            <div className="absolute inset-0 bg-gradient-to-r from-neon-cyan/10 via-neon-magenta/10 to-neon-lime/10" />
            <div className="absolute inset-0 grid-bg opacity-30" />
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-neon-magenta/10 rounded-full blur-[200px]" />
          </div>
          
          <div className="relative mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 text-center">
            <div className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-neon-lime/10 border border-neon-lime/30 mb-10">
              <Zap className="w-5 h-5 text-neon-lime" />
              <span className="font-mono text-neon-lime tracking-wider">ACCESO GRATUITO</span>
            </div>

            <h2 className="font-[var(--font-display)] text-4xl sm:text-8xl text-foreground mb-6 leading-[0.9]">
              READY TO<br/>
              <span className="bg-gradient-to-r from-neon-cyan via-neon-magenta to-neon-lime bg-clip-text text-transparent">LEVEL UP?</span>
            </h2>
            <p className="text-base sm:text-xl text-muted-foreground mb-10 max-w-2xl mx-auto px-2">
              Accede a chat en vivo, videos exclusivos, eventos y conecta con cientos de atletas
            </p>

            <Link href="/auth/sign-up" className="block w-full sm:w-auto px-4">
              <Button size="lg" className="relative overflow-hidden bg-gradient-to-r from-neon-cyan via-neon-magenta to-neon-lime text-background font-bold text-lg sm:text-2xl px-8 py-6 sm:px-14 sm:py-10 rounded-2xl group w-full sm:w-auto">
                <span className="relative z-10 flex items-center justify-center font-[var(--font-display)] tracking-wider">
                  <Trophy className="w-5 h-5 sm:w-7 sm:h-7 mr-3" />
                  UNIRME AHORA
                </span>
                <div className="absolute inset-0 bg-gradient-to-r from-neon-lime via-neon-cyan to-neon-magenta opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              </Button>
            </Link>

            <p className="text-sm text-muted-foreground mt-8">
              Ya tienes cuenta? <Link href="/auth/login" className="text-neon-cyan hover:underline font-medium">Ingresa aqui</Link>
            </p>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="py-16 border-t border-white/5">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-8">
            <div className="flex items-center gap-4">
              <Image
                src="/logo.png"
                alt="Comunidad"
                width={48}
                height={48}
                className="h-12 w-12 object-contain"
              />
              <div>
                <span className="font-[var(--font-display)] text-xl">COMUNIDAD</span>
                <p className="text-sm text-muted-foreground">Montevideo, Uruguay</p>
              </div>
            </div>
            
            <div className="flex items-center gap-6 text-sm text-muted-foreground flex-wrap justify-center">
              <Link href="/app" className="hover:text-neon-cyan transition-colors">Comunidad</Link>
              <Link href="/tienda" className="hover:text-neon-magenta transition-colors">Shop</Link>
              <a href="https://instagram.com/comunidad_str" target="_blank" rel="noopener noreferrer" className="hover:text-neon-lime transition-colors">Instagram</a>
              <a href="https://wa.me/59899123456" target="_blank" rel="noopener noreferrer" className="hover:text-neon-orange transition-colors">WhatsApp</a>
              <Link href="/admin" className="hover:text-white transition-colors opacity-50 hover:opacity-100">Admin</Link>
            </div>
          </div>
        </div>
      </footer>

      {/* Live Event Popup */}
      <LiveEventPopup 
        isOpen={showEventPopup} 
        onClose={() => setShowEventPopup(false)} 
        event={liveEvent}
      />
    </div>
  )
}
