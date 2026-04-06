'use client'

import { MapPin, Navigation, ExternalLink } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { AnimatedSection } from '@/components/ui/animated-section'

// Ubicación: Rbla. Pte. Charles De Gaulle, 11300 Montevideo
const LOCATION = {
  name: 'Rbla. Pte. Charles De Gaulle',
  address: 'Rbla. Pte. Charles De Gaulle, 11300 Montevideo',
  lat: -34.8851,
  lng: -56.0734,
  googleMapsUrl: 'https://www.google.com/maps?s=web&rlz=1C1FKPE_esUS954US954&lqi=ChJza2F0ZSBwYXJrIHVydWd1YXlItbai7uWAgIAIWh4QABABGAAYARgCIhJza2F0ZSBwYXJrIHVydWd1YXmSAQ9za2F0ZWJvYXJkX3BhcmvgAQA&phdesc=kmjQd-e69yA&vet=12ahUKEwj6vqjjvLmSAxW1VTABHUwFLowQ1YkKegQIIBAB..i&cs=1&um=1&ie=UTF-8&fb=1&gl=us&sa=X&geocode=KcH9G25BgZ-VMc311SvzLHfN&daddr=3VQ8%2BJJW,+Rbla.+Pte.+Charles+De+Gaulle,+11300+Montevideo,+Departamento+de+Montevideo,+Uruguay'
}

export function LocationSection() {
  return (
    <section id="ubicacion" className="py-24 sm:py-32 bg-background relative section-divider">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <AnimatedSection className="mb-16">
          <p className="text-sm font-medium tracking-[0.3em] text-accent mb-4">
            MONTEVIDEO, URUGUAY
          </p>
          <h2 className="font-[var(--font-display)] text-4xl sm:text-5xl md:text-6xl tracking-tight text-foreground">
            PUNTO DE
            <span className="text-accent"> ENCUENTRO</span>
          </h2>
        </AnimatedSection>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Map */}
          <AnimatedSection className="aspect-video lg:aspect-auto lg:h-[450px] bg-foreground relative overflow-hidden">
            <iframe
              src={`https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3271.7!2d${LOCATION.lng}!3d${LOCATION.lat}!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zMzTCsDUzJzA2LjQiUyA1NsKwMDQnMjQuMiJX!5e0!3m2!1ses!2suy!4v1`}
              width="100%"
              height="100%"
              style={{ border: 0, filter: 'grayscale(100%) contrast(1.1)' }}
              allowFullScreen
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              title="Ubicación STR Comunidad"
            />
          </AnimatedSection>

          {/* Location Info */}
          <AnimatedSection delay={0.2} className="flex flex-col justify-center">
            <div className="bg-secondary p-8">
              <div className="flex items-start gap-4 mb-6">
                <div className="p-3 bg-accent">
                  <MapPin className="h-6 w-6 text-foreground" />
                </div>
                <div>
                  <h3 className="font-[var(--font-display)] text-2xl sm:text-3xl text-foreground mb-2">
                    Skatepark Rambla
                  </h3>
                  <p className="text-muted-foreground">
                    {LOCATION.address}
                  </p>
                </div>
              </div>

              <div className="space-y-4 mb-8">
                <div className="flex items-center gap-3 text-muted-foreground">
                  <div className="w-2 h-2 bg-accent" />
                  <span>Clases de Surf, Skate y SUP</span>
                </div>
                <div className="flex items-center gap-3 text-muted-foreground">
                  <div className="w-2 h-2 bg-accent" />
                  <span>Entrenamientos grupales</span>
                </div>
                <div className="flex items-center gap-3 text-muted-foreground">
                  <div className="w-2 h-2 bg-accent" />
                  <span>Frente a la costa</span>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-3">
                <a
                  href={LOCATION.googleMapsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1"
                >
                  <Button className="w-full bg-foreground text-background hover:bg-foreground/90">
                    <Navigation className="mr-2 h-4 w-4" />
                    CÓMO LLEGAR
                  </Button>
                </a>
                <a
                  href={LOCATION.googleMapsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1"
                >
                  <Button variant="outline" className="w-full bg-transparent">
                    <ExternalLink className="mr-2 h-4 w-4" />
                    VER EN MAPS
                  </Button>
                </a>
              </div>
            </div>

            <div className="mt-6 p-6 border border-border">
              <p className="text-sm text-muted-foreground">
                El punto de encuentro puede variar según la actividad. 
                Te confirmaremos la ubicación exacta al inscribirte a las clases.
              </p>
            </div>
          </AnimatedSection>
        </div>
      </div>
    </section>
  )
}
