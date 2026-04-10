'use client'

import { useEffect, useState } from 'react'
import { Users, Video, CreditCard, ShoppingBag, TrendingUp, Calendar } from 'lucide-react'

export default function PanelDashboard() {
  const [stats, setStats] = useState({
    totalMembers: 0,
    totalVideos: 0,
    totalOrders: 0,
    monthlyRevenue: 0,
  })

  useEffect(() => {
    // Simulated stats - replace with actual API calls
    setStats({
      totalMembers: 50,
      totalVideos: 120,
      totalOrders: 45,
      monthlyRevenue: 15000,
    })
  }, [])

  const statCards = [
    { label: 'Raiders', value: stats.totalMembers, icon: Users, color: 'bg-blue-500' },
    { label: 'Videos', value: stats.totalVideos, icon: Video, color: 'bg-green-500' },
    { label: 'Ordenes', value: stats.totalOrders, icon: ShoppingBag, color: 'bg-purple-500' },
    { label: 'Ingresos (USD)', value: `$${stats.monthlyRevenue.toLocaleString()}`, icon: CreditCard, color: 'bg-orange-500' },
  ]

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-black">Dashboard</h1>
        <p className="text-gray-600">Bienvenido al panel de administracion</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {statCards.map((stat) => {
          const Icon = stat.icon
          return (
            <div key={stat.label} className="bg-white p-6 border border-gray-200">
              <div className="flex items-center justify-between mb-4">
                <div className={`w-12 h-12 ${stat.color} flex items-center justify-center`}>
                  <Icon className="w-6 h-6 text-white" />
                </div>
                <TrendingUp className="w-4 h-4 text-green-500" />
              </div>
              <p className="text-2xl font-bold text-black">{stat.value}</p>
              <p className="text-sm text-gray-500">{stat.label}</p>
            </div>
          )
        })}
      </div>

      {/* Quick Actions */}
      <div className="bg-white p-6 border border-gray-200">
        <h2 className="text-lg font-bold text-black mb-4">Acciones rapidas</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <a href="/panel/videos" className="p-4 bg-gray-50 hover:bg-gray-100 transition-colors text-center">
            <Video className="w-6 h-6 mx-auto mb-2" />
            <span className="text-sm font-medium">Subir Video</span>
          </a>
          <a href="/panel/events" className="p-4 bg-gray-50 hover:bg-gray-100 transition-colors text-center">
            <Calendar className="w-6 h-6 mx-auto mb-2" />
            <span className="text-sm font-medium">Crear Evento</span>
          </a>
          <a href="/panel/products" className="p-4 bg-gray-50 hover:bg-gray-100 transition-colors text-center">
            <ShoppingBag className="w-6 h-6 mx-auto mb-2" />
            <span className="text-sm font-medium">Nuevo Producto</span>
          </a>
          <a href="/panel/subscriptions" className="p-4 bg-gray-50 hover:bg-gray-100 transition-colors text-center">
            <Users className="w-6 h-6 mx-auto mb-2" />
            <span className="text-sm font-medium">Ver Socios</span>
          </a>
        </div>
      </div>
    </div>
  )
}
