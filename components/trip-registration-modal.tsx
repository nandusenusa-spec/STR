'use client'

import React from "react"

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { Trip } from '@/lib/types'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { X, CheckCircle, Loader2 } from 'lucide-react'
import { mutate } from 'swr'

interface TripRegistrationModalProps {
  trip: Trip
  onClose: () => void
}

export function TripRegistrationModal({ trip, onClose }: TripRegistrationModalProps) {
  const [formData, setFormData] = useState({
    full_name: '',
    email: '',
    phone: '',
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setError(null)

    try {
      const supabase = createClient()
      
      const { error: insertError } = await supabase.from('trip_registrations').insert({
        trip_id: trip.id,
        full_name: formData.full_name,
        email: formData.email,
        phone: formData.phone?.trim() || null,
      })

      if (insertError) throw insertError

      setIsSuccess(true)
      mutate('trips')
    } catch (err) {
      setError('Hubo un error al procesar tu inscripción. Intentá nuevamente.')
      console.error(err)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-foreground/80 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative bg-background w-full max-w-md p-8 border border-border">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 hover:bg-secondary transition-colors"
          aria-label="Cerrar"
        >
          <X className="h-5 w-5" />
        </button>

        {isSuccess ? (
          <div className="text-center py-8">
            <CheckCircle className="h-16 w-16 text-accent mx-auto mb-6" />
            <h3 className="font-[var(--font-display)] text-3xl mb-4">
              ¡INSCRIPCIÓN EXITOSA!
            </h3>
            <p className="text-muted-foreground mb-6">
              Te enviamos un email con los detalles del viaje a {formData.email}
            </p>
            <Button onClick={onClose} className="w-full">
              CERRAR
            </Button>
          </div>
        ) : (
          <>
            <h3 className="font-[var(--font-display)] text-3xl mb-2">
              INSCRIPCIÓN
            </h3>
            <p className="text-muted-foreground mb-6">
              {trip.title} - ${trip.price.toLocaleString('es-AR')}
            </p>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="full_name">Nombre completo</Label>
                <Input
                  id="full_name"
                  value={formData.full_name}
                  onChange={(e) => setFormData(prev => ({ ...prev, full_name: e.target.value }))}
                  required
                  className="mt-1"
                />
              </div>

              <div>
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                  required
                  className="mt-1"
                />
              </div>

              <div>
                <Label htmlFor="phone">Teléfono (opcional)</Label>
                <Input
                  id="phone"
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                  className="mt-1"
                />
              </div>

              {error && (
                <p className="text-destructive text-sm">{error}</p>
              )}

              <Button 
                type="submit" 
                className="w-full" 
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    PROCESANDO...
                  </>
                ) : (
                  'CONFIRMAR INSCRIPCIÓN'
                )}
              </Button>
            </form>

            <p className="text-xs text-muted-foreground mt-4 text-center">
              Te contactaremos para coordinar el pago y los detalles del viaje.
            </p>
          </>
        )}
      </div>
    </div>
  )
}
