'use client'

import { Waves, Sparkles, Wind } from 'lucide-react'
import Image from 'next/image'
import { AnimatedSection, StaggeredContainer } from '@/components/ui/animated-section'

const disciplines = [
  {
    id: 'surf',
    title: 'SURF',
    description: 'Entrena los movimientos fundamentales del surf en tierra. Pop-ups, postura, equilibrio y transiciones para que llegues al agua preparado.',
    icon: Waves,
    stats: ['Pop-up drills', 'Balance training', 'Wave reading'],
    image: '/images/hero-surf.jpg',
  },
  {
    id: 'skate',
    title: 'SKATE',
    description: 'Mejora tu técnica de skateboard con ejercicios específicos. Carving, pumping y maniobras que mejoran tu surf y tu flow en la calle.',
    icon: Sparkles,
    stats: ['Carving', 'Pumping', 'Tricks'],
    image: '/images/discipline-skate.jpg',
  },
  {
    id: 'sup',
    title: 'SUP',
    description: 'Stand Up Paddle para todos los niveles. Remada, equilibrio y core training que complementa perfectamente tu entrenamiento.',
    icon: Wind,
    stats: ['Core strength', 'Paddle technique', 'Balance'],
    image: '/images/discipline-sup.jpg',
  },
]

export function DisciplinesSection() {
  return (
    <section id="disciplinas" className="py-24 sm:py-32 bg-background relative overflow-hidden section-divider">
      {/* Background decoration */}
      <div className="absolute -right-40 top-1/2 -translate-y-1/2 font-[var(--font-display)] text-[20rem] text-foreground/[0.02] leading-none pointer-events-none">
        STR
      </div>

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 relative">
        {/* Header */}
        <AnimatedSection className="mb-16">
          <p className="text-sm font-medium tracking-[0.3em] text-accent mb-4">
            LO QUE HACEMOS
          </p>
          <h2 className="font-[var(--font-display)] text-5xl sm:text-6xl md:text-7xl tracking-tight text-foreground">
            NUESTRAS
            <br />
            <span className="text-gradient">DISCIPLINAS</span>
          </h2>
        </AnimatedSection>

        {/* Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-1">
          {disciplines.map((discipline, index) => (
            <AnimatedSection 
              key={discipline.id}
              animation="fade-up"
              delay={index * 150}
              className="bg-secondary/30 group hover:bg-foreground transition-all duration-500 overflow-hidden"
            >
              <div className="relative h-48 overflow-hidden">
                <Image
                  src={discipline.image || "/placeholder.svg"}
                  alt={discipline.title}
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-foreground/30 group-hover:bg-foreground/50 transition-colors" />
                <span className="absolute bottom-4 left-4 font-[var(--font-display)] text-6xl text-background/80">
                  0{index + 1}
                </span>
              </div>
              
              <div className="p-8 sm:p-10">
                <discipline.icon className="h-8 w-8 text-accent mb-4" />
              
                <h3 className="font-[var(--font-display)] text-4xl sm:text-5xl text-foreground group-hover:text-background mb-4 transition-colors">
                  {discipline.title}
                </h3>
              
                <p className="text-muted-foreground group-hover:text-background/70 mb-8 leading-relaxed transition-colors">
                  {discipline.description}
                </p>
              
                <ul className="space-y-2">
                  {discipline.stats.map((stat) => (
                    <li key={stat} className="text-sm font-medium text-foreground group-hover:text-background transition-colors flex items-center gap-2">
                      <span className="w-1.5 h-1.5 bg-accent" />
                      {stat}
                    </li>
                  ))}
                </ul>
              </div>
            </AnimatedSection>
          ))}
        </div>
      </div>
    </section>
  )
}
