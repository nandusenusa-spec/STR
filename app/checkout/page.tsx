'use client'

import React from "react"

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useCartStore } from '@/lib/cart-store'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { ArrowLeft, Loader2, ShoppingBag, CreditCard } from 'lucide-react'

export default function CheckoutPage() {
  const router = useRouter()
  const { items, getTotalPrice, clearCart } = useCartStore()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [mounted, setMounted] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
  })

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4">
        <ShoppingBag className="h-16 w-16 text-muted-foreground/30 mb-4" />
        <h1 className="font-[var(--font-display)] text-4xl text-foreground mb-2">
          CARRITO VACÍO
        </h1>
        <p className="text-muted-foreground mb-8">
          No tenés productos en tu carrito
        </p>
        <Link href="/#tienda">
          <Button>
            <ArrowLeft className="mr-2 h-4 w-4" />
            VOLVER A LA TIENDA
          </Button>
        </Link>
      </div>
    )
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      const response = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          items: items.map(item => ({
            product_id: item.product.id,
            name: item.product.name,
            price: item.product.price,
            quantity: item.quantity,
          })),
          customer: formData,
          total: getTotalPrice(),
        }),
      })

      const data = await response.json()

      if (data.init_point) {
        // Redirect to Mercado Pago
        clearCart()
        window.location.href = data.init_point
      } else {
        throw new Error('No se pudo crear la preferencia de pago')
      }
    } catch (error) {
      console.error('Checkout error:', error)
      alert('Hubo un error al procesar tu compra. Intentá nuevamente.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <Link href="/" className="font-[var(--font-display)] text-3xl">
              STR
            </Link>
            <Link href="/#tienda" className="text-sm text-muted-foreground hover:text-foreground transition-colors flex items-center gap-2">
              <ArrowLeft className="h-4 w-4" />
              Volver a la tienda
            </Link>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12">
        <h1 className="font-[var(--font-display)] text-4xl sm:text-5xl mb-12">
          CHECKOUT
        </h1>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Form */}
          <div>
            <h2 className="font-semibold text-lg mb-6 flex items-center gap-2">
              <span className="w-8 h-8 bg-foreground text-background flex items-center justify-center text-sm font-bold">1</span>
              Datos de contacto
            </h2>
            
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <Label htmlFor="name">Nombre completo</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  required
                  className="mt-1"
                  placeholder="Tu nombre"
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
                  placeholder="tu@email.com"
                />
              </div>

              <div>
                <Label htmlFor="phone">Teléfono</Label>
                <Input
                  id="phone"
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                  className="mt-1"
                  placeholder="+54 11 1234 5678"
                />
              </div>

              <div className="pt-6 border-t border-border">
                <h2 className="font-semibold text-lg mb-6 flex items-center gap-2">
                  <span className="w-8 h-8 bg-foreground text-background flex items-center justify-center text-sm font-bold">2</span>
                  Pago
                </h2>
                
                <div className="p-6 bg-secondary mb-6">
                  <div className="flex items-center gap-3 mb-4">
                    <CreditCard className="h-6 w-6 text-accent" />
                    <span className="font-medium">Mercado Pago</span>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Serás redirigido a Mercado Pago para completar tu compra de forma segura.
                  </p>
                </div>
              </div>

              <Button
                type="submit"
                className="w-full py-6 text-base font-semibold"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    PROCESANDO...
                  </>
                ) : (
                  <>
                    PAGAR ${getTotalPrice().toLocaleString('es-AR')}
                  </>
                )}
              </Button>
            </form>
          </div>

          {/* Order Summary */}
          <div>
            <div className="bg-secondary p-6 lg:p-8 sticky top-8">
              <h2 className="font-[var(--font-display)] text-2xl mb-6">
                RESUMEN
              </h2>

              <div className="space-y-4 mb-6">
                {items.map((item) => (
                  <div key={item.product.id} className="flex gap-4">
                    <div className="w-16 h-16 bg-muted flex-shrink-0">
                      {item.product.image_url ? (
                        <img
                          src={item.product.image_url || "/placeholder.svg"}
                          alt={item.product.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full bg-foreground flex items-center justify-center">
                          <span className="font-[var(--font-display)] text-xs text-background/30">STR</span>
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-medium text-sm truncate">{item.product.name}</h3>
                      <p className="text-muted-foreground text-sm">Cantidad: {item.quantity}</p>
                    </div>
                    <p className="font-medium text-sm">
                      ${(item.product.price * item.quantity).toLocaleString('es-AR')}
                    </p>
                  </div>
                ))}
              </div>

              <div className="border-t border-border pt-6 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span>${getTotalPrice().toLocaleString('es-AR')}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Envío</span>
                  <span>A coordinar</span>
                </div>
                <div className="flex justify-between font-[var(--font-display)] text-2xl pt-4 border-t border-border">
                  <span>TOTAL</span>
                  <span>${getTotalPrice().toLocaleString('es-AR')}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
