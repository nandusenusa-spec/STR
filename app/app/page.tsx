import { createClient } from '@/lib/supabase/server'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import Image from 'next/image'
import { 
  Users, 
  MessageSquare, 
  Calendar, 
  ImageIcon, 
  Store, 
  ChevronRight,
  Trophy,
  Zap,
  Waves,
  Camera,
  MapPin,
  Plus,
  Share2,
  ExternalLink,
} from 'lucide-react'

export const metadata = {
  title: 'Dashboard | STR Community',
  description: 'Bienvenido a la comunidad STR',
}

export const dynamic = 'force-dynamic'

export default async function AppDashboard() {
  const supabase = await createClient()
  
  const {
    data: { user },
  } = await supabase.auth.getUser()

  // Verificar si el perfil está completo
  let profileComplete = false
  let displayName = user?.email?.split('@')[0] || 'ATLETA'
  if (user) {
    const [{ data: profile }, { data: userProfile }] = await Promise.all([
      supabase
        .from('surfer_biometrics')
        .select('height_cm, weight_kg, favorite_spot')
        .eq('user_id', user.id)
        .single(),
      supabase
        .from('user_profiles')
        .select('full_name')
        .eq('id', user.id)
        .maybeSingle(),
    ])
    
    profileComplete = !!(profile?.height_cm && profile?.weight_kg && profile?.favorite_spot)
    displayName = (userProfile?.full_name || displayName).toUpperCase()
  }

  const sections = [
    {
      icon: Zap,
      title: 'MANIOBRAS',
      description: 'Aprende y desbloquea nuevas tecnicas',
      href: '/app/maneuvers',
      color: 'from-primary to-cyan-600',
      badge: 'NUEVO',
    },
    {
      icon: MessageSquare,
      title: 'CHAT EN VIVO',
      description: 'Conecta con la comunidad en tiempo real',
      href: '/app/chat',
      color: 'from-primary to-pink-600',
      live: true,
    },
    {
      icon: Users,
      title: 'FOROS',
      description: 'Discusiones sobre gear, tecnica y mas',
      href: '/app/forums',
      color: 'from-muted to-purple-600',
    },
    {
      icon: Calendar,
      title: 'EVENTOS',
      description: 'Clases, viajes y meetups',
      href: '/app/events',
      color: 'from-primary to-green-600',
    },
    {
      icon: ImageIcon,
      title: 'FEED SOCIAL',
      description: 'Comparte tus mejores momentos',
      href: '/app/feed',
      color: 'from-primary to-orange-600',
    },
    {
      icon: Store,
      title: 'SHOP',
      description: 'Productos, cursos y reservas',
      href: '/app/shop',
      color: 'from-primary to-primary',
    },
  ]

  return (
    <div className="flex-1 space-y-8 p-6 lg:p-8">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div className="space-y-1">
          <h1 className="font-[var(--font-display)] text-4xl lg:text-5xl tracking-tight">
            HOLA, <span className="text-primary ">{displayName}</span>
          </h1>
          <p className="text-muted-foreground">
            Tu espacio para conectar, aprender y crecer con la comunidad
          </p>
        </div>
      </div>

      {/* Main Grid: Story + Wave Report + Webcams + Map */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
        
        {/* Historia del Admin - Vertical Story */}
        <div className="lg:row-span-2">
          <Card className="h-full border-primary/30 bg-gradient-to-b from-primary/10 to-background overflow-hidden">
            <div className="relative aspect-[9/16] lg:h-full min-h-[400px]">
              <Image
                src="/images/hero-surf.jpg"
                alt="Story del evento"
                fill
                className="object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent" />
              
              {/* Story indicator */}
              <div className="absolute top-3 left-3 right-3">
                <div className="h-1 bg-white/30 rounded-full overflow-hidden">
                  <div className="h-full w-1/3 bg-primary rounded-full" />
                </div>
              </div>

              {/* Admin badge */}
              <div className="absolute top-6 left-3 flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary to-primary flex items-center justify-center text-xs font-bold">
                  STR
                </div>
                <span className="text-xs font-medium text-white drop-shadow-lg">COMUNIDAD</span>
              </div>

              {/* Content */}
              <div className="absolute bottom-0 left-0 right-0 p-4">
                <span className="inline-block px-2 py-1 rounded bg-primary/80 text-xs font-bold text-white mb-2">EVENTO</span>
                <h3 className="font-[var(--font-display)] text-lg text-white drop-shadow-lg">Clase de Surf este Sabado</h3>
                <p className="text-sm text-white/80">Playa Verde - 8:00 AM</p>
              </div>
            </div>
          </Card>
        </div>

        {/* Posteo de la Ola Hoy */}
        <div className="lg:col-span-2">
          <Card className="border-primary/30 bg-card h-full">
            <CardContent className="p-5">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Waves className="w-5 h-5 text-primary" />
                  <h3 className="font-[var(--font-display)] text-lg">REPORTE DE OLAS</h3>
                </div>
                <Link href="/app/feed" className="text-primary text-xs hover:underline">Ver todos</Link>
              </div>
              
              {/* Wave report cards */}
              <div className="space-y-3 mb-4">
                <div className="flex items-center gap-3 p-3 rounded-lg bg-secondary/50">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-cyan-600 flex items-center justify-center">
                    <Waves className="w-5 h-5 text-background" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium">Playa Verde</p>
                    <p className="text-xs text-muted-foreground">1.2m - Viento offshore - Buenas condiciones</p>
                  </div>
                  <span className="px-2 py-1 rounded bg-primary/20 text-primary text-xs font-bold">BUENO</span>
                </div>
                <div className="flex items-center gap-3 p-3 rounded-lg bg-secondary/50">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-pink-600 flex items-center justify-center">
                    <Waves className="w-5 h-5 text-background" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium">Punta Ballena</p>
                    <p className="text-xs text-muted-foreground">0.8m - Viento cruzado - Regular</p>
                  </div>
                  <span className="px-2 py-1 rounded bg-primary/20 text-primary text-xs font-bold">REGULAR</span>
                </div>
              </div>

              {/* CTA compartir ola */}
              <Button asChild variant="outline" className="w-full border-primary/50 text-primary hover:bg-primary hover:text-background gap-2">
                <Link href="/app/feed?action=wave-report">
                  <Share2 className="w-4 h-4" />
                  Compartir como esta la ola
                </Link>
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Webcams */}
        <div>
          <Card className="border-border bg-card h-full">
            <CardContent className="p-5">
              <div className="flex items-center gap-2 mb-4">
                <Camera className="w-5 h-5 text-primary" />
                <h3 className="font-[var(--font-display)] text-lg">WEBCAMS</h3>
              </div>
              <div className="space-y-3">
                {[
                  { name: 'Playa Verde', status: 'live' },
                  { name: 'Punta del Este', status: 'live' },
                  { name: 'La Barra', status: 'offline' },
                ].map((cam, i) => (
                  <a key={i} href="#" className="flex items-center gap-2 p-2 rounded-lg bg-secondary/50 hover:bg-secondary transition-colors">
                    <div className="w-12 h-8 rounded bg-background/50 flex items-center justify-center">
                      <Camera className="w-4 h-4 text-muted-foreground" />
                    </div>
                    <div className="flex-1">
                      <p className="text-xs font-medium">{cam.name}</p>
                    </div>
                    {cam.status === 'live' ? (
                      <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                    ) : (
                      <span className="w-2 h-2 rounded-full bg-muted-foreground" />
                    )}
                    <ExternalLink className="w-3 h-3 text-muted-foreground" />
                  </a>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Mapa de Clase Actual */}
        <div className="lg:col-span-2">
          <Card className="border-primary/30 bg-card h-full">
            <CardContent className="p-5">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <MapPin className="w-5 h-5 text-primary" />
                  <h3 className="font-[var(--font-display)] text-lg">CLASE EN CURSO</h3>
                </div>
                <span className="flex items-center gap-1 px-2 py-1 rounded-full bg-primary/20 text-primary text-xs">
                  <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
                  AHORA
                </span>
              </div>
              
              {/* Map placeholder */}
              <div className="relative aspect-[16/9] rounded-lg overflow-hidden bg-secondary/50 mb-3">
                <iframe
                  src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3271.8366!2d-54.9408!3d-34.9558!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zMzTCsDU3JzIxLjAiUyA1NMKwNTYnMjcuMCJX!5e0!3m2!1sen!2sus!4v1234567890"
                  className="absolute inset-0 w-full h-full border-0"
                  allowFullScreen
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                />
                <div className="absolute bottom-2 left-2 px-2 py-1 rounded bg-background/90 text-xs">
                  <span className="font-medium">Playa Verde</span> - Instructor: Pablo
                </div>
              </div>

              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">8 alumnos en clase</span>
                <Link href="/app/events" className="text-primary hover:underline text-xs">Ver horarios</Link>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Quick action - Postear maniobra */}
        <div>
          <Card className="border-primary/30 bg-gradient-to-br from-primary/10 to-background h-full">
            <CardContent className="p-5 flex flex-col justify-center h-full">
              <div className="text-center">
                <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center mx-auto mb-3">
                  <Zap className="w-6 h-6 text-primary" />
                </div>
                <h3 className="font-[var(--font-display)] text-sm mb-2">COMPARTE TU MANIOBRA</h3>
                <p className="text-xs text-muted-foreground mb-4">Sube un video de tu progreso al feed</p>
                <Button asChild size="sm" className="bg-primary text-background hover:bg-primary/90 gap-1">
                  <Link href="/app/feed?action=post-maneuver">
                    <Plus className="w-3 h-3" />
                    Postear
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Main Sections Grid */}
      <div>
        <h2 className="font-[var(--font-display)] text-2xl mb-6">EXPLORA</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {sections.map((section, i) => {
            const Icon = section.icon
            return (
              <Link key={i} href={section.href} className="group">
                <Card className="cursor-pointer transition-all duration-300  hover-lift border-border hover:border-primary/50 bg-card h-full">
                  <CardContent className="p-5">
                    <div className="flex items-start justify-between mb-4">
                      <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${section.color} flex items-center justify-center`}>
                        <Icon className="w-6 h-6 text-background" />
                      </div>
                      <div className="flex items-center gap-2">
                        {section.live && (
                          <span className="flex items-center gap-1 px-2 py-1 rounded-full bg-destructive/20 text-destructive text-xs">
                            <span className="w-1.5 h-1.5 rounded-full bg-destructive animate-pulse" />
                            LIVE
                          </span>
                        )}
                        {section.badge && (
                          <span className="px-2 py-1 rounded-full bg-primary/20 text-primary text-xs font-bold">
                            {section.badge}
                          </span>
                        )}
                        <ChevronRight className="w-5 h-5 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all" />
                      </div>
                    </div>
                    <h3 className="font-[var(--font-display)] text-xl text-foreground mb-1">{section.title}</h3>
                    <p className="text-sm text-muted-foreground">{section.description}</p>
                  </CardContent>
                </Card>
              </Link>
            )
          })}
        </div>
      </div>

      {/* CTA Banner - solo si el perfil no está completo */}
      {!profileComplete && (
        <Card className="relative overflow-hidden border-primary/30 bg-gradient-to-r from-primary/10 via-primary/10 to-primary/10">
          <div className="absolute inset-0 grid-bg opacity-20" />
          <CardContent className="relative p-6 lg:p-8">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-primary to-primary flex items-center justify-center ">
                  <Trophy className="w-7 h-7 text-background" />
                </div>
                <div>
                  <h3 className="font-[var(--font-display)] text-xl lg:text-2xl">COMPLETA TU PERFIL</h3>
                  <p className="text-sm text-muted-foreground">Desbloquea todas las funciones de la comunidad</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Button asChild className="bg-gradient-to-r from-primary to-primary text-background font-bold ">
                  <Link href="/app/profile">
                    <Zap className="w-4 h-4 mr-2" />
                    Completar perfil
                  </Link>
                </Button>
                <Button variant="outline" asChild className="border-primary text-primary hover:bg-primary hover:text-background">
                  <Link href="/app/chat?channel=general">Ir al chat</Link>
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
