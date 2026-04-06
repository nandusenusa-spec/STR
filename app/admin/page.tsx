import { createClient } from '@/lib/supabase/server'
import { Package, Plane, ShoppingCart, Users, Instagram, ArrowRight } from 'lucide-react'
import Link from 'next/link'

export const dynamic = 'force-dynamic'

async function getStats() {
  const supabase = await createClient()
  
  const [products, trips, orders, registrations, subscriptions] = await Promise.all([
    supabase.from('products').select('id', { count: 'exact' }).eq('is_active', true),
    supabase.from('trips').select('id', { count: 'exact' }).eq('active', true),
    supabase.from('orders').select('id', { count: 'exact' }),
    supabase.from('trip_registrations').select('id', { count: 'exact' }),
    supabase.from('subscriptions').select('id', { count: 'exact' }).eq('status', 'pending'),
  ])

  return {
    products: products.count || 0,
    trips: trips.count || 0,
    orders: orders.count || 0,
    registrations: registrations.count || 0,
    pendingSubscriptions: subscriptions.count || 0,
  }
}

async function getRecentOrders() {
  const supabase = await createClient()
  
  const { data } = await supabase
    .from('orders')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(5)
  
  return data || []
}

export default async function AdminDashboard() {
  const stats = await getStats()
  const recentOrders = await getRecentOrders()

  const statCards = [
    { label: 'Productos Activos', value: stats.products, icon: Package, color: 'bg-blue-500' },
    { label: 'Viajes Activos', value: stats.trips, icon: Plane, color: 'bg-teal-500' },
    { label: 'Pedidos Totales', value: stats.orders, icon: ShoppingCart, color: 'bg-orange-500' },
    { label: 'Inscripciones Viajes', value: stats.registrations, icon: Users, color: 'bg-accent' },
  ]

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="font-[var(--font-display)] text-4xl mb-2">DASHBOARD</h1>
        <p className="text-muted-foreground">Resumen general de STR Comunidad</p>
      </div>

      {/* Pending Subscriptions Alert */}
      {stats.pendingSubscriptions > 0 && (
        <Link 
          href="/admin/subscriptions"
          className="flex items-center justify-between bg-yellow-500/10 border border-yellow-500/30 p-4 mb-8 hover:bg-yellow-500/20 transition-colors group"
        >
          <div className="flex items-center gap-3">
            <Instagram className="h-5 w-5 text-yellow-500" />
            <span className="font-medium text-yellow-500">
              {stats.pendingSubscriptions} suscripciones pendientes de aprobar
            </span>
          </div>
          <ArrowRight className="h-5 w-5 text-yellow-500 group-hover:translate-x-1 transition-transform" />
        </Link>
      )}

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
        {statCards.map((stat) => (
          <div key={stat.label} className="bg-card border border-border p-6">
            <div className="flex items-center gap-4">
              <div className={`p-3 ${stat.color}`}>
                <stat.icon className="h-6 w-6 text-background" />
              </div>
              <div>
                <p className="text-3xl font-[var(--font-display)]">{stat.value}</p>
                <p className="text-sm text-muted-foreground">{stat.label}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Recent Orders */}
      <div>
        <h2 className="font-[var(--font-display)] text-2xl mb-6">PEDIDOS RECIENTES</h2>
        
        {recentOrders.length === 0 ? (
          <div className="bg-card border border-border p-8 text-center">
            <p className="text-muted-foreground">No hay pedidos todavía</p>
          </div>
        ) : (
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
                </tr>
              </thead>
              <tbody>
                {recentOrders.map((order) => (
                  <tr key={order.id} className="border-t border-border">
                    <td className="p-4 text-sm font-mono">{order.id.slice(0, 8)}</td>
                    <td className="p-4 text-sm">{order.customer_name}</td>
                    <td className="p-4 text-sm text-muted-foreground">{order.customer_email}</td>
                    <td className="p-4 text-sm font-medium">${order.total.toLocaleString('es-AR')}</td>
                    <td className="p-4">
                      <span className={`inline-block px-2 py-1 text-xs font-medium ${
                        order.status === 'paid' ? 'bg-green-500/10 text-green-500' :
                        order.status === 'pending' ? 'bg-yellow-500/10 text-yellow-500' :
                        'bg-muted text-muted-foreground'
                      }`}>
                        {order.status === 'paid' ? 'Pagado' :
                         order.status === 'pending' ? 'Pendiente' :
                         order.status === 'shipped' ? 'Enviado' :
                         order.status === 'delivered' ? 'Entregado' :
                         order.status === 'cancelled' ? 'Cancelado' : order.status}
                      </span>
                    </td>
                    <td className="p-4 text-sm text-muted-foreground">
                      {new Date(order.created_at).toLocaleDateString('es-AR')}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
