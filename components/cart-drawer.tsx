'use client'

import { useCartStore } from '@/lib/cart-store'
import { Button } from '@/components/ui/button'
import { X, Plus, Minus, ShoppingBag, Trash2 } from 'lucide-react'
import Link from 'next/link'

export function CartDrawer() {
  const { items, isOpen, setCartOpen, updateQuantity, removeItem, getTotalPrice, clearCart } = useCartStore()

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-foreground/80 backdrop-blur-sm"
        onClick={() => setCartOpen(false)}
      />

      {/* Drawer */}
      <div className="absolute right-0 top-0 h-full w-full max-w-md bg-background border-l border-border flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-border">
          <div className="flex items-center gap-3">
            <ShoppingBag className="h-5 w-5" />
            <h2 className="font-[var(--font-display)] text-2xl">CARRITO</h2>
          </div>
          <button
            onClick={() => setCartOpen(false)}
            className="p-2 hover:bg-secondary transition-colors"
            aria-label="Cerrar carrito"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Items */}
        <div className="flex-1 overflow-y-auto p-6">
          {items.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center">
              <ShoppingBag className="h-16 w-16 text-muted-foreground/30 mb-4" />
              <p className="font-[var(--font-display)] text-2xl text-muted-foreground mb-2">
                CARRITO VACÍO
              </p>
              <p className="text-muted-foreground text-sm mb-6">
                Agregá productos de nuestra tienda
              </p>
              <Button onClick={() => setCartOpen(false)} variant="outline">
                VER TIENDA
              </Button>
            </div>
          ) : (
            <div className="space-y-6">
              {items.map((item) => (
                <div key={item.product.id} className="flex gap-4">
                  {/* Product Image */}
                  <div className="w-20 h-20 bg-secondary flex-shrink-0">
                    {item.product.image_url ? (
                      <img 
                        src={item.product.image_url || "/placeholder.svg"} 
                        alt={item.product.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-foreground">
                        <span className="font-[var(--font-display)] text-sm text-background/30">STR</span>
                      </div>
                    )}
                  </div>

                  {/* Product Info */}
                  <div className="flex-1 min-w-0">
                    <h3 className="font-medium text-foreground truncate">
                      {item.product.name}
                    </h3>
                    <p className="text-muted-foreground text-sm">
                      ${item.product.price.toLocaleString('es-AR')}
                    </p>

                    {/* Quantity Controls */}
                    <div className="flex items-center gap-2 mt-2">
                      <button
                        onClick={() => updateQuantity(item.product.id, item.quantity - 1)}
                        className="p-1 border border-border hover:bg-secondary transition-colors"
                        aria-label="Reducir cantidad"
                      >
                        <Minus className="h-3 w-3" />
                      </button>
                      <span className="w-8 text-center text-sm font-medium">
                        {item.quantity}
                      </span>
                      <button
                        onClick={() => updateQuantity(item.product.id, item.quantity + 1)}
                        className="p-1 border border-border hover:bg-secondary transition-colors"
                        aria-label="Aumentar cantidad"
                      >
                        <Plus className="h-3 w-3" />
                      </button>
                      <button
                        onClick={() => removeItem(item.product.id)}
                        className="p-1 ml-auto text-muted-foreground hover:text-destructive transition-colors"
                        aria-label="Eliminar producto"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        {items.length > 0 && (
          <div className="p-6 border-t border-border space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Subtotal</span>
              <span className="font-[var(--font-display)] text-2xl">
                ${getTotalPrice().toLocaleString('es-AR')}
              </span>
            </div>
            
            <Link href="/checkout" onClick={() => setCartOpen(false)}>
              <Button className="w-full py-6 font-semibold tracking-wide">
                FINALIZAR COMPRA
              </Button>
            </Link>
            
            <button
              onClick={clearCart}
              className="w-full text-center text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              Vaciar carrito
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
