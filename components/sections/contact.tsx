'use client'

import { Button } from '@/components/ui/button'
import { Instagram, Facebook, MessageCircle, MapPin, ArrowUpRight } from 'lucide-react'
import { AnimatedSection } from '@/components/ui/animated-section'

const WHATSAPP_NUMBER = '598099046165'

export function ContactSection() {
  return (
    <section id="contacto" className="py-24 sm:py-32 bg-foreground text-background relative section-divider">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
          {/* Left - Info */}
          <AnimatedSection animation="fade-right">
            <p className="text-sm font-medium tracking-[0.3em] text-accent mb-4">
              HABLEMOS
            </p>
            <h2 className="font-[var(--font-display)] text-5xl sm:text-6xl md:text-7xl tracking-tight mb-8">
              <span className="text-gradient">CONTACTO</span>
            </h2>
            
            <p className="text-background/70 text-lg leading-relaxed mb-12">
              ¿Tenés dudas sobre los entrenamientos? ¿Querés información sobre próximos viajes? 
              Contactanos por Instagram o WhatsApp.
            </p>

            <div className="space-y-4">
              {/* WhatsApp - Primary */}
              <a 
                href={`https://wa.me/${WHATSAPP_NUMBER}?text=Hola!%20Quiero%20info%20sobre%20STR%20Comunidad`}
                target="_blank" 
                rel="noopener noreferrer"
                className="flex items-center gap-4 group p-5 bg-green-600 hover:bg-green-500 transition-colors"
              >
                <div className="p-3 bg-white/20">
                  <MessageCircle className="h-6 w-6 text-white" />
                </div>
                <div className="flex-1">
                  <p className="font-bold text-white">WhatsApp</p>
                  <p className="text-white/80 text-sm">+598 099 046 165</p>
                </div>
                <ArrowUpRight className="h-5 w-5 text-white/60 group-hover:text-white group-hover:translate-x-1 group-hover:-translate-y-1 transition-all" />
              </a>

              {/* Instagram */}
              <a 
                href="https://www.instagram.com/comunidad_str/" 
                target="_blank" 
                rel="noopener noreferrer"
                className="flex items-center gap-4 group p-5 border border-background/20 hover:border-accent/50 transition-colors"
              >
                <div className="p-3 bg-gradient-to-br from-purple-500 via-pink-500 to-orange-500">
                  <Instagram className="h-6 w-6 text-white" />
                </div>
                <div className="flex-1">
                  <p className="font-medium">Instagram</p>
                  <p className="text-background/60 text-sm">@comunidad_str</p>
                </div>
                <ArrowUpRight className="h-5 w-5 text-background/40 group-hover:text-accent group-hover:translate-x-1 group-hover:-translate-y-1 transition-all" />
              </a>

              {/* Facebook */}
              <a 
                href="https://facebook.com/strcommunity" 
                target="_blank" 
                rel="noopener noreferrer"
                className="flex items-center gap-4 group p-5 border border-background/20 hover:border-accent/50 transition-colors"
              >
                <div className="p-3 bg-blue-600">
                  <Facebook className="h-6 w-6 text-white" />
                </div>
                <div className="flex-1">
                  <p className="font-medium">Facebook</p>
                  <p className="text-background/60 text-sm">STR Comunidad</p>
                </div>
                <ArrowUpRight className="h-5 w-5 text-background/40 group-hover:text-accent group-hover:translate-x-1 group-hover:-translate-y-1 transition-all" />
              </a>

              {/* Location */}
              <a 
                href="https://www.google.com/maps?daddr=3VQ8%2BJJW,+Rbla.+Pte.+Charles+De+Gaulle,+11300+Montevideo"
                target="_blank" 
                rel="noopener noreferrer"
                className="flex items-center gap-4 group p-5 border border-background/20 hover:border-accent/50 transition-colors"
              >
                <div className="p-3 bg-accent">
                  <MapPin className="h-6 w-6 text-foreground" />
                </div>
                <div className="flex-1">
                  <p className="font-medium">Punto de encuentro</p>
                  <p className="text-background/60 text-sm">Rbla. Pte. Charles De Gaulle, Montevideo</p>
                </div>
                <ArrowUpRight className="h-5 w-5 text-background/40 group-hover:text-accent group-hover:translate-x-1 group-hover:-translate-y-1 transition-all" />
              </a>
            </div>
          </AnimatedSection>

          {/* Right - CTA Card */}
          <AnimatedSection animation="fade-left" delay={200}>
            <div className="bg-background/5 border border-background/10 p-8 sm:p-12 h-full flex flex-col justify-center">
              <div className="mb-8">
                <span className="text-accent font-[var(--font-display)] text-6xl sm:text-8xl font-bold">24/7</span>
                <p className="text-background/60 mt-2">Respondemos lo antes posible</p>
              </div>

              <h3 className="font-[var(--font-display)] text-3xl sm:text-4xl mb-4">
                ESCRIBINOS POR WHATSAPP
              </h3>
              <p className="text-background/60 mb-8">
                Es la forma más rápida de contactarnos. Te respondemos a la brevedad con toda la info que necesites sobre clases, viajes o cualquier consulta.
              </p>

              <a 
                href={`https://wa.me/${WHATSAPP_NUMBER}?text=Hola!%20Quiero%20info%20sobre%20STR%20Comunidad`}
                target="_blank" 
                rel="noopener noreferrer"
              >
                <Button 
                  size="lg"
                  className="w-full bg-green-600 text-white hover:bg-green-500 py-6 font-bold tracking-wider"
                >
                  <MessageCircle className="mr-2 h-5 w-5" />
                  ABRIR WHATSAPP
                </Button>
              </a>

              <p className="text-center text-background/40 text-sm mt-4">
                +598 099 046 165
              </p>
            </div>
          </AnimatedSection>
        </div>
      </div>
    </section>
  )
}
