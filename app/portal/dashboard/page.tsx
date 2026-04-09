'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { Button } from '@/components/ui/button'
import { 
  User, Calendar, MapPin, Trophy, Flame, LogOut, 
  Waves, Sparkles, Wind, ChevronRight, Star, Clock 
} from 'lucide-react'
import type { User as SupabaseUser } from '@supabase/supabase-js'

interface Trip {
  id: string
  title: string
  location: string
  start_date: string
  image_url: string | null
}

interface Schedule {
  id: string
  day_of_week: string
  start_time: string
  discipline: string
  location: string
}

export default function PortalDashboard() {
  const [user, setUser] = useState<SupabaseUser | null>(null)
  const [loading, setLoading] = useState(true)
  const [upcomingTrips, setUpcomingTrips] = useState<Trip[]>([])
  const [schedule, setSchedule] = useState<Schedule[]>([])
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    async function loadData() {
      const { data: { user } } = await supabase.auth.getUser()
      
      if (!user) {
        router.push('/portal')
        return
      }

      setUser(user)

      // Load upcoming trips
      const { data: trips } = await supabase
        .from('trips')
        .select('*')
        .gte('start_date', new Date().toISOString())
        .order('start_date', { ascending: true })
        .limit(3)

      if (trips) setUpcomingTrips(trips)

      // Load schedule
      const { data: scheduleData } = await supabase
        .from('training_schedule')
        .select('*')
        .eq('is_active', true)
        .order('day_of_week', { ascending: true })

      if (scheduleData) setSchedule(scheduleData)

      setLoading(false)
    }

    loadData()
  }, [router, supabase])

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/portal')
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-foreground flex items-center justify-center">
        <div className="animate-pulse text-background">Cargando...</div>
      </div>
    )
  }

  const userName = user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'Rider'
  const favoriteDiscipline = user?.user_metadata?.favorite_discipline || 'Surf'
  const DisciplineIcon = favoriteDiscipline === 'Surf' ? Waves : favoriteDiscipline === 'Skate' ? Sparkles : Wind

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-foreground text-background">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link href="/" className="flex items-center gap-3">
              <Image
                src="/images/logo.svg"
                alt="STR"
                width={40}
                height={40}
                className="invert"
              />
              <span className="font-[var(--font-display)] text-2xl">STR</span>
            </Link>
            <div className="flex items-center gap-4">
              <span className="text-sm text-background/70">Hola, {userName}</span>
              <button
                onClick={handleLogout}
                className="p-2 hover:bg-background/10 transition-colors"
              >
                <LogOut className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <div className="mb-8 p-8 bg-gradient-to-r from-foreground to-foreground/90 text-background relative overflow-hidden">
          <div className="absolute right-0 top-0 bottom-0 w-1/3 bg-gradient-to-l from-accent/20 to-transparent" />
          <div className="relative z-10">
            <div className="flex items-center gap-2 text-accent text-sm mb-2">
              <DisciplineIcon className="h-4 w-4" />
              <span>{favoriteDiscipline} Rider</span>
            </div>
            <h1 className="font-[var(--font-display)] text-4xl sm:text-5xl mb-2">
              BIENVENIDO, {userName.toUpperCase()}
            </h1>
            <p className="text-background/70">
              Seguí entrenando y sumá puntos para el ranking
            </p>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Stats */}
          <div className="lg:col-span-2 grid grid-cols-2 sm:grid-cols-4 gap-4">
            {[
              { icon: Flame, label: 'Sesiones', value: 0 },
              { icon: Trophy, label: 'Puntos', value: 0 },
              { icon: Star, label: 'Nivel', value: 'Nuevo' },
              { icon: MapPin, label: 'Viajes', value: 0 },
            ].map((stat) => (
              <div key={stat.label} className="p-6 bg-secondary/50 text-center">
                <stat.icon className="h-6 w-6 mx-auto mb-2 text-accent" />
                <div className="font-[var(--font-display)] text-2xl">{stat.value}</div>
                <div className="text-xs text-muted-foreground">{stat.label}</div>
              </div>
            ))}
          </div>

          {/* Quick Actions */}
          <div className="space-y-4">
            <a href="/#horarios" className="flex items-center justify-between p-4 bg-foreground text-background hover:bg-foreground/90 transition-colors group">
              <div className="flex items-center gap-3">
                <Calendar className="h-5 w-5" />
                <span>Ver horarios</span>
              </div>
              <ChevronRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
            </a>
            <a href="/#viajes" className="flex items-center justify-between p-4 bg-accent text-accent-foreground hover:bg-accent/90 transition-colors group">
              <div className="flex items-center gap-3">
                <MapPin className="h-5 w-5" />
                <span>Próximos viajes</span>
              </div>
              <ChevronRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
            </a>
          </div>
        </div>

        {/* Upcoming Schedule */}
        <section className="mt-12">
          <h2 className="font-[var(--font-display)] text-2xl mb-6 flex items-center gap-2">
            <Clock className="h-6 w-6 text-accent" />
            PRÓXIMOS ENTRENAMIENTOS
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {schedule.slice(0, 6).map((item) => {
              const Icon = item.discipline === 'Surf' ? Waves : item.discipline === 'Skate' ? Sparkles : Wind
              return (
                <div key={item.id} className="p-4 bg-secondary/30 border-l-4 border-accent">
                  <div className="flex items-center gap-2 text-accent text-sm mb-1">
                    <Icon className="h-4 w-4" />
                    <span>{item.discipline}</span>
                  </div>
                  <div className="font-bold">{item.day_of_week}</div>
                  <div className="text-muted-foreground text-sm">{item.start_time}hs</div>
                  <div className="text-xs text-muted-foreground mt-1">{item.location}</div>
                </div>
              )
            })}
          </div>
        </section>

        {/* Upcoming Trips */}
        {upcomingTrips.length > 0 && (
          <section className="mt-12">
            <h2 className="font-[var(--font-display)] text-2xl mb-6 flex items-center gap-2">
              <MapPin className="h-6 w-6 text-accent" />
              PRÓXIMOS VIAJES
            </h2>
            <div className="grid md:grid-cols-3 gap-6">
              {upcomingTrips.map((trip) => (
                <div key={trip.id} className="group overflow-hidden bg-secondary/30">
                  <div className="aspect-video relative overflow-hidden">
                    <Image
                      src={trip.image_url || '/images/trip-beach.jpg'}
                      alt={trip.title}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  </div>
                  <div className="p-4">
                    <h3 className="font-bold">{trip.title}</h3>
                    <p className="text-sm text-muted-foreground">{trip.location}</p>
                    <p className="text-xs text-accent mt-2">
                      {new Date(trip.start_date).toLocaleDateString('es-UY', { 
                        day: 'numeric', 
                        month: 'long' 
                      })}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}
      </main>
    </div>
  )
}
