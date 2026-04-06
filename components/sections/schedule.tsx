'use client'

import React from "react"
import { useState } from 'react'
import { Instagram, Phone, CheckCircle, Loader2, Calendar } from 'lucide-react'
import { AnimatedSection } from '@/components/ui/animated-section'
import { Button } from '@/components/ui/button'

export function ScheduleSection() {
  const [instagram, setInstagram] = useState('')
  const [whatsapp, setWhatsapp] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)
  const [error, setError] = useState('')

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
    <section id="horarios" className="py-24 sm:py-32 bg-foreground text-background relative overflow-hidden section-divider">
      {/* Background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-20 -right-20 w-96 h-96 bg-accent/5 rounded-full blur-3xl" />
        <div className="absolute -bottom-20 -left-20 w-96 h-96 bg-accent/5 rounded-full blur-3xl" />
      </div>

      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 relative">
        {/* Header */}
        <AnimatedSection className="text-center mb-12">
          <div className="inline-flex items-center gap-2 bg-accent/10 px-4 py-2 rounded-full mb-6">
            <Calendar className="h-4 w-4 text-accent" />
            <span className="text-sm font-medium text-accent">MARZO 2026</span>
          </div>
          
          <h2 className="font-[var(--font-display)] text-4xl sm:text-5xl md:text-6xl tracking-tight mb-6">
            LAS CLASES
            <br />
            <span className="text-accent">COMIENZAN PRONTO</span>
          </h2>
          
          <p className="text-lg text-background/70 max-w-2xl mx-auto">
            Dejanos tu Instagram y WhatsApp para recibir más información sobre horarios, 
            ubicaciones y novedades de la comunidad.
          </p>
        </AnimatedSection>

        {/* Subscription Form */}
        <AnimatedSection delay={0.2}>
          {isSuccess ? (
            <div className="bg-green-500/10 border border-green-500/30 p-8 text-center">
              <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
              <h3 className="font-[var(--font-display)] text-2xl mb-2">Te registraste correctamente</h3>
              <p className="text-background/70">
                Te contactaremos por WhatsApp con toda la información.
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="bg-background/5 border border-background/10 p-6 sm:p-8">
              <div className="grid gap-4 sm:grid-cols-2 mb-6">
                <div>
                  <label htmlFor="instagram" className="block text-sm font-medium text-background/70 mb-2">
                    Instagram *
                  </label>
                  <div className="relative">
                    <Instagram className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-background/40" />
                    <input
                      type="text"
                      id="instagram"
                      value={instagram}
                      onChange={(e) => setInstagram(e.target.value)}
                      placeholder="@tuusuario"
                      required
                      className="w-full bg-background/10 border border-background/20 py-3 pl-10 pr-4 text-background placeholder:text-background/40 focus:outline-none focus:border-accent transition-colors"
                    />
                  </div>
                </div>
                
                <div>
                  <label htmlFor="whatsapp" className="block text-sm font-medium text-background/70 mb-2">
                    WhatsApp *
                  </label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-background/40" />
                    <input
                      type="tel"
                      id="whatsapp"
                      value={whatsapp}
                      onChange={(e) => setWhatsapp(e.target.value)}
                      placeholder="+598 99 123 456"
                      required
                      className="w-full bg-background/10 border border-background/20 py-3 pl-10 pr-4 text-background placeholder:text-background/40 focus:outline-none focus:border-accent transition-colors"
                    />
                  </div>
                </div>
              </div>

              {error && (
                <p className="text-red-400 text-sm mb-4">{error}</p>
              )}

              <Button
                type="submit"
                disabled={isSubmitting || !instagram || !whatsapp}
                className="w-full bg-background text-foreground hover:bg-background/90 py-6 text-base font-semibold rounded-full"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="h-5 w-5 animate-spin mr-2" />
                    Enviando...
                  </>
                ) : (
                  'QUIERO INFO'
                )}
              </Button>

              <p className="text-xs text-background/50 text-center mt-4">
                Te contactaremos por WhatsApp con información sobre clases y novedades.
              </p>
            </form>
          )}
        </AnimatedSection>

        {/* Info cards */}
        <AnimatedSection delay={0.3} className="grid sm:grid-cols-3 gap-4 mt-8">
          <div className="bg-background/5 border border-background/10 p-4 text-center">
            <p className="font-[var(--font-display)] text-2xl text-accent mb-1">SURF</p>
            <p className="text-sm text-background/60">Movimientos en tierra</p>
          </div>
          <div className="bg-background/5 border border-background/10 p-4 text-center">
            <p className="font-[var(--font-display)] text-2xl text-accent mb-1">SKATE</p>
            <p className="text-sm text-background/60">Técnica y equilibrio</p>
          </div>
          <div className="bg-background/5 border border-background/10 p-4 text-center">
            <p className="font-[var(--font-display)] text-2xl text-accent mb-1">SUP</p>
            <p className="text-sm text-background/60">Stand Up Paddle</p>
          </div>
        </AnimatedSection>
      </div>
    </section>
  )
}
