'use client'

import { useState } from 'react'
import useSWR, { mutate } from 'swr'
import { createClient } from '@/lib/supabase/client'
import type { Order } from '@/lib/types'
import { Button } from '@/components/ui/button'
import { Loader2, Eye, X } from 'lucide-react'

interface OrderWithItems extends Order {
  order_items: {
    id: string
    quantity: number
    price: number
    products: {
      name: string
      image_url: string | null
    }
  }[]
}

async function fetchOrders(): Promise<OrderWithItems[]> {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('orders')
    .select(`
      *,
      order_items (
        id,
        quantity,
        price,
        products (
          name,
          image_url
        )
      )
    `)
    .order('created_at', { ascending: false })
  
  if (error) throw error
  return data || []
}

const statusOptions = [
  { value: 'pending', label: 'Pendiente' },
  { value: 'paid', label: 'Pagado' },
  { value: 'shipped', label: 'Enviado' },
  { value: 'delivered', label: 'Entregado' },
  { value: 'cancelled', label: 'Cancelado' },
]

export default function AdminOrdersPage() {
  const { data: orders, isLoading } = useSWR('admin-orders', fetchOrders)
  const [selectedOrder, setSelectedOrder] = useState<OrderWithItems | null>(null)
  const [isUpdating, setIsUpdating] = useState(false)

  const updateOrderStatus = async (orderId: string, status: string) => {
    setIsUpdating(true)
    const supabase = createClient()
    
    try {
      await supabase
        .from('orders')
        .update({ status })
        .eq('id', orderId)
      
      mutate('admin-orders')
    } catch (error) {
      console.error('Error updating order:', error)
    } finally {
      setIsUpdating(false)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'paid': return 'bg-green-500/10 text-green-500'
      case 'pending': return 'bg-yellow-500/10 text-yellow-500'
      case 'shipped': return 'bg-blue-500/10 text-blue-500'
      case 'delivered': return 'bg-teal-500/10 text-teal-500'
      case 'cancelled': return 'bg-red-500/10 text-red-500'
      default: return 'bg-muted text-muted-foreground'
    }
  }

  const getStatusLabel = (status: string) => {
    return statusOptions.find(s => s.value === status)?.label || status
  }

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="font-[var(--font-display)] text-4xl mb-2">PEDIDOS</h1>
        <p className="text-muted-foreground">Gestiona los pedidos de la tienda</p>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      ) : orders && orders.length > 0 ? (
        <div className="bg-card border border-border overflow-hidden">
          <table className="w-full">
            <thead className="bg-muted">
              <tr>
                <th className="text-left p-4 text-sm font-semibold">ID</th>
                <th className="text-left p-4 text-sm font-semibold">Cliente</th>
                <th className="text-left p-4 text-sm font-semibold">Email</th>
                <th className="text-left p-4 text-sm font-semibold">Total</th>
                <th className="text-left p-4 text-sm font-semibold">Estado</th>
                <th className="text-left p-4 text-sm font-semibold">Fecha</th>
                <th className="text-left p-4 text-sm font-semibold">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((order) => (
                <tr key={order.id} className="border-t border-border">
                  <td className="p-4 text-sm font-mono">{order.id.slice(0, 8)}</td>
                  <td className="p-4 text-sm">{order.customer_name}</td>
                  <td className="p-4 text-sm text-muted-foreground">{order.customer_email}</td>
                  <td className="p-4 text-sm font-medium">${order.total.toLocaleString('es-AR')}</td>
                  <td className="p-4">
                    <select
                      value={order.status}
                      onChange={(e) => updateOrderStatus(order.id, e.target.value)}
                      disabled={isUpdating}
                      className={`px-2 py-1 text-xs font-medium border-0 cursor-pointer ${getStatusColor(order.status)}`}
                    >
                      {statusOptions.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  </td>
                  <td className="p-4 text-sm text-muted-foreground">
                    {new Date(order.created_at).toLocaleDateString('es-AR')}
                  </td>
                  <td className="p-4">
                    <button
                      onClick={() => setSelectedOrder(order)}
                      className="p-2 hover:bg-muted transition-colors"
                      aria-label="Ver detalles"
                    >
                      <Eye className="h-4 w-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="bg-card border border-border p-12 text-center">
          <p className="text-muted-foreground">No hay pedidos todavía</p>
        </div>
      )}

      {/* Order Details Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-foreground/80 backdrop-blur-sm" onClick={() => setSelectedOrder(null)} />
          
          <div className="relative bg-background w-full max-w-lg p-8 border border-border max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setSelectedOrder(null)}
              className="absolute top-4 right-4 p-2 hover:bg-muted transition-colors"
            >
              <X className="h-5 w-5" />
            </button>

            <h2 className="font-[var(--font-display)] text-2xl mb-6">
              PEDIDO #{selectedOrder.id.slice(0, 8)}
            </h2>

            <div className="space-y-6">
              {/* Customer Info */}
              <div>
                <h3 className="text-sm font-semibold text-muted-foreground mb-2">CLIENTE</h3>
                <p className="font-medium">{selectedOrder.customer_name}</p>
                <p className="text-muted-foreground">{selectedOrder.customer_email}</p>
                {selectedOrder.customer_phone && (
                  <p className="text-muted-foreground">{selectedOrder.customer_phone}</p>
                )}
              </div>

              {/* Order Items */}
              <div>
                <h3 className="text-sm font-semibold text-muted-foreground mb-2">PRODUCTOS</h3>
                <div className="space-y-3">
                  {selectedOrder.order_items?.map((item) => (
                    <div key={item.id} className="flex gap-4 items-center">
                      <div className="w-12 h-12 bg-muted flex-shrink-0">
                        {item.products?.image_url ? (
                          <img 
                            src={item.products.image_url || "/placeholder.svg"} 
                            alt={item.products.name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full bg-foreground flex items-center justify-center">
                            <span className="text-xs text-background/30">STR</span>
                          </div>
                        )}
                      </div>
                      <div className="flex-1">
                        <p className="font-medium">{item.products?.name}</p>
                        <p className="text-sm text-muted-foreground">
                          {item.quantity} x ${item.price.toLocaleString('es-AR')}
                        </p>
                      </div>
                      <p className="font-medium">
                        ${(item.quantity * item.price).toLocaleString('es-AR')}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Total */}
              <div className="pt-4 border-t border-border flex justify-between items-center">
                <span className="font-semibold">TOTAL</span>
                <span className="font-[var(--font-display)] text-2xl">
                  ${selectedOrder.total.toLocaleString('es-AR')}
                </span>
              </div>

              {/* Status */}
              <div className="pt-4 border-t border-border">
                <h3 className="text-sm font-semibold text-muted-foreground mb-2">ESTADO</h3>
                <select
                  value={selectedOrder.status}
                  onChange={(e) => {
                    updateOrderStatus(selectedOrder.id, e.target.value)
                    setSelectedOrder({ ...selectedOrder, status: e.target.value as Order['status'] })
                  }}
                  disabled={isUpdating}
                  className="w-full h-10 px-3 border border-input bg-background"
                >
                  {statusOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Date */}
              <div className="pt-4 border-t border-border">
                <p className="text-sm text-muted-foreground">
                  Pedido realizado el {new Date(selectedOrder.created_at).toLocaleString('es-AR')}
                </p>
              </div>
            </div>

            <Button onClick={() => setSelectedOrder(null)} className="w-full mt-6">
              CERRAR
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
