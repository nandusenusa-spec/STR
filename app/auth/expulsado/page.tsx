'use client'

import { useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { createClient } from '@/lib/supabase/client'
import { AlertCircle, Home } from 'lucide-react'

export default function ExpulsadoPage() {
  const supabase = createClient()

  useEffect(() => {
    // Sign out the user
    const signOut = async () => {
      await supabase.auth.signOut()
    }
    signOut()
  }, [supabase])

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 grid-bg opacity-20" />
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-destructive/10 rounded-full blur-[120px]" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-destructive/10 rounded-full blur-[120px]" />
      </div>

      <div className="relative w-full max-w-md">
        {/* Logo */}
        <Link href="/" className="flex items-center justify-center mb-8 group">
          <Image
            src="/logo.png"
            alt="Comunidad"
            width={64}
            height={64}
            className="h-16 w-16 object-contain transition-transform duration-300 group-hover:scale-110"
          />
        </Link>

        {/* Card */}
        <div className="relative rounded-2xl border border-white/10 bg-card/80 backdrop-blur-xl p-8">
          <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-destructive/5 via-transparent to-destructive/5" />

          <div className="relative">
            {/* Icon */}
            <div className="flex justify-center mb-6">
              <div className="p-4 rounded-full bg-destructive/20 border border-destructive/50">
                <AlertCircle className="w-8 h-8 text-destructive" />
              </div>
            </div>

            <h1 className="font-[var(--font-display)] text-3xl text-foreground mb-2 text-center">
              ACCESO REVOCADO
            </h1>
            <p className="text-muted-foreground text-center mb-8">
              Tu acceso a la comunidad ha sido temporalmente revocado
            </p>

            {/* Message */}
            <div className="bg-background/50 border border-border rounded-lg p-6 mb-8">
              <p className="text-sm text-muted-foreground leading-relaxed mb-4">
                Tu cuenta ha sido deshabilitada debido a una violación de nuestros términos de servicio o política de la comunidad.
              </p>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Si crees que esto es un error, por favor contacta a nuestro equipo de soporte.
              </p>
            </div>

            {/* Contact Info */}
            <div className="bg-card border border-border/50 rounded-lg p-4 mb-8 text-center">
              <p className="text-xs text-muted-foreground mb-2">SOPORTE</p>
              <p className="text-foreground font-medium">
                contacto@comunidadstr.com
              </p>
            </div>

            {/* Actions */}
            <div className="space-y-3">
              <Link
                href="/"
                className="flex items-center justify-center gap-2 w-full px-6 py-3 bg-border hover:bg-border/80 text-foreground rounded-lg transition-colors font-medium"
              >
                <Home className="w-4 h-4" />
                Ir al inicio
              </Link>
              <button
                onClick={() => window.location.href = '/auth/support'}
                className="w-full px-6 py-3 bg-destructive/20 hover:bg-destructive/30 text-destructive rounded-lg transition-colors font-medium border border-destructive/50"
              >
                Enviar apelación
              </button>
            </div>
          </div>
        </div>

        {/* Help text */}
        <p className="text-center text-xs text-muted-foreground mt-8">
          Tu sesión ha sido cerrada automáticamente por razones de seguridad
        </p>
      </div>
    </div>
  )
}
