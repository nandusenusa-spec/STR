'use client'

import { useEffect, useState } from 'react'
import { Trophy, Flame, TrendingUp, Medal, Star, Waves, Sparkles, Wind } from 'lucide-react'
import { AnimatedSection, AnimatedCounter } from '@/components/ui/animated-section'
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'
import { Button } from '@/components/ui/button'

interface RankingUser {
  id: string
  full_name: string
  nickname: string | null
  total_points: number
  total_sessions: number
  level: string
  favorite_discipline: string | null
}

const disciplineIcons: Record<string, typeof Waves> = {
  'Surf': Waves,
  'Skate': Sparkles,
  'SUP': Wind,
}

const levelColors: Record<string, string> = {
  'Principiante': 'bg-emerald-500',
  'Intermedio': 'bg-blue-500',
  'Avanzado': 'bg-purple-500',
}

export function RankingSection() {
  const [rankings, setRankings] = useState<RankingUser[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchRankings() {
      const supabase = createClient()
      const { data } = await supabase
        .from('demo_rankings')
        .select('*')
        .order('total_points', { ascending: false })
        .limit(8)

      if (data) {
        setRankings(data)
      }
      setLoading(false)
    }
    fetchRankings()
  }, [])

  const getMedalColor = (index: number) => {
    switch (index) {
      case 0: return 'from-yellow-400 to-amber-600'
      case 1: return 'from-gray-300 to-gray-500'
      case 2: return 'from-orange-400 to-orange-700'
      default: return 'from-background/20 to-background/10'
    }
  }

  return (
    <section id="ranking" className="py-24 bg-background relative overflow-hidden section-divider">
      {/* Background decoration */}
      <div className="absolute top-0 right-0 w-1/2 h-1/2 bg-gradient-to-bl from-accent/5 to-transparent pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-1/3 h-1/3 bg-gradient-to-tr from-foreground/5 to-transparent pointer-events-none" />

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 relative">
        {/* Section Header */}
        <AnimatedSection className="text-center mb-16">
          <div className="inline-flex items-center gap-2 bg-accent/10 text-accent px-4 py-2 mb-6">
            <Flame className="h-4 w-4" />
            <span className="text-xs font-bold tracking-wider">TOP RIDERS</span>
          </div>
          <h2 className="font-[var(--font-display)] text-5xl sm:text-6xl md:text-7xl mb-4">
            RANKING
          </h2>
          <p className="text-muted-foreground max-w-xl mx-auto">
            Los riders más comprometidos de la comunidad. Sumá puntos entrenando y escalá posiciones.
          </p>
        </AnimatedSection>

        {/* Stats Cards */}
        <AnimatedSection delay={200} className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-16">
          {[
            { label: 'Riders Activos', value: 127, icon: TrendingUp },
            { label: 'Sesiones este mes', value: 342, icon: Flame },
            { label: 'Puntos totales', value: 48500, icon: Star },
            { label: 'Viajes completados', value: 23, icon: Trophy },
          ].map((stat, index) => (
            <div
              key={stat.label}
              className="bg-secondary/50 p-6 text-center group hover:bg-foreground hover:text-background transition-colors duration-300"
            >
              <stat.icon className="h-6 w-6 mx-auto mb-3 text-accent group-hover:scale-110 transition-transform" />
              <div className="font-[var(--font-display)] text-3xl sm:text-4xl mb-1">
                <AnimatedCounter end={stat.value} />
              </div>
              <div className="text-xs text-muted-foreground group-hover:text-background/70 tracking-wide">
                {stat.label.toUpperCase()}
              </div>
            </div>
          ))}
        </AnimatedSection>

        {/* Ranking List */}
        <div className="grid lg:grid-cols-2 gap-8">
          {/* Top 3 Featured */}
          <AnimatedSection animation="fade-right" className="space-y-4">
            <h3 className="font-[var(--font-display)] text-2xl mb-6 flex items-center gap-2">
              <Trophy className="h-6 w-6 text-accent" />
              PODIO
            </h3>
            {loading ? (
              <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="h-24 bg-secondary/50 animate-pulse" />
                ))}
              </div>
            ) : (
              rankings.slice(0, 3).map((user, index) => {
                const Icon = disciplineIcons[user.favorite_discipline || 'Surf'] || Waves
                return (
                  <div
                    key={user.id}
                    className={`relative p-6 bg-gradient-to-r ${
                      index === 0 ? 'from-yellow-500/10 to-transparent border-l-4 border-yellow-500' :
                      index === 1 ? 'from-gray-400/10 to-transparent border-l-4 border-gray-400' :
                      'from-orange-500/10 to-transparent border-l-4 border-orange-600'
                    } group hover:translate-x-2 transition-transform duration-300`}
                  >
                    <div className="flex items-center gap-4">
                      {/* Rank Medal */}
                      <div className={`w-12 h-12 bg-gradient-to-br ${getMedalColor(index)} flex items-center justify-center text-white font-bold text-xl`}>
                        {index + 1}
                      </div>
                      
                      {/* User Info */}
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-lg">{user.full_name}</span>
                          {user.nickname && (
                            <span className="text-muted-foreground">"{user.nickname}"</span>
                          )}
                        </div>
                        <div className="flex items-center gap-3 mt-1">
                          <span className={`text-xs px-2 py-0.5 text-white ${levelColors[user.level] || 'bg-gray-500'}`}>
                            {user.level}
                          </span>
                          <span className="text-xs text-muted-foreground flex items-center gap-1">
                            <Icon className="h-3 w-3" />
                            {user.favorite_discipline}
                          </span>
                        </div>
                      </div>

                      {/* Points */}
                      <div className="text-right">
                        <div className="font-[var(--font-display)] text-3xl text-accent">
                          {user.total_points.toLocaleString()}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {user.total_sessions} sesiones
                        </div>
                      </div>
                    </div>
                  </div>
                )
              })
            )}
          </AnimatedSection>

          {/* Rest of ranking */}
          <AnimatedSection animation="fade-left" className="space-y-4">
            <h3 className="font-[var(--font-display)] text-2xl mb-6 flex items-center gap-2">
              <Medal className="h-6 w-6 text-muted-foreground" />
              SIGUIENTES
            </h3>
            {loading ? (
              <div className="space-y-3">
                {[1, 2, 3, 4, 5].map((i) => (
                  <div key={i} className="h-16 bg-secondary/50 animate-pulse" />
                ))}
              </div>
            ) : (
              rankings.slice(3).map((user, index) => {
                const Icon = disciplineIcons[user.favorite_discipline || 'Surf'] || Waves
                return (
                  <div
                    key={user.id}
                    className="flex items-center gap-4 p-4 bg-secondary/30 hover:bg-secondary/60 transition-colors group"
                  >
                    <div className="w-8 h-8 bg-foreground/10 flex items-center justify-center text-muted-foreground font-bold">
                      {index + 4}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-medium truncate">
                        {user.full_name}
                        {user.nickname && <span className="text-muted-foreground ml-1">"{user.nickname}"</span>}
                      </div>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <Icon className="h-3 w-3" />
                        {user.favorite_discipline}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-bold">{user.total_points.toLocaleString()}</div>
                      <div className="text-xs text-muted-foreground">{user.total_sessions} ses.</div>
                    </div>
                  </div>
                )
              })
            )}
          </AnimatedSection>
        </div>

        {/* CTA */}
        <AnimatedSection delay={400} className="mt-16 text-center">
          <p className="text-muted-foreground mb-6">
            Unite a la comunidad y empezá a sumar puntos
          </p>
          <Link href="/portal">
            <Button size="lg" className="magnetic-btn bg-foreground text-background hover:bg-foreground/90 px-10 py-6 font-bold tracking-wider">
              CREAR MI PERFIL
            </Button>
          </Link>
        </AnimatedSection>
      </div>
    </section>
  )
}
