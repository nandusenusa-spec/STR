'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { 
  Instagram, 
  Phone, 
  Check, 
  X, 
  ExternalLink, 
  Loader2,
  Filter,
  Users,
  Plane,
  Calendar
} from 'lucide-react'
import Link from 'next/link'

interface Subscription {
  id: string
  instagram_username: string
  whatsapp_phone: string
  subscription_type: string
  status: 'pending' | 'approved' | 'rejected'
  created_at: string
}

const typeLabels: Record<string, string> = {
  newsletter: 'Clases',
  trip_nicaragua: 'Nicaragua',
  trip_peru: 'Perú',
}

const statusColors: Record<string, string> = {
  pending: 'bg-yellow-500/10 text-yellow-500 border-yellow-500/30',
  approved: 'bg-green-500/10 text-green-500 border-green-500/30',
  rejected: 'bg-red-500/10 text-red-500 border-red-500/30',
}

export default function AdminSubscriptionsPage() {
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('pending')
  const [typeFilter, setTypeFilter] = useState<string>('all')
  const [updating, setUpdating] = useState<string | null>(null)

  const supabase = createClient()

  useEffect(() => {
    fetchSubscriptions()
  }, [filter, typeFilter])

  async function fetchSubscriptions() {
    setLoading(true)
    
    let query = supabase
      .from('subscriptions')
      .select('*')
      .order('created_at', { ascending: false })

    if (filter !== 'all') {
      query = query.eq('status', filter)
    }

    if (typeFilter !== 'all') {
      query = query.eq('subscription_type', typeFilter)
    }

    const { data, error } = await query

    if (error) {
      console.error('Error fetching subscriptions:', error)
    } else {
      setSubscriptions(
        (data || []).map((s: Subscription & { phone?: string }) => ({
          ...s,
          whatsapp_phone: s.whatsapp_phone ?? s.phone ?? '',
        })),
      )
    }
    
    setLoading(false)
  }

  async function updateStatus(id: string, status: 'approved' | 'rejected') {
    setUpdating(id)
    
    const { error } = await supabase
      .from('subscriptions')
      .update({ status })
      .eq('id', id)

    if (error) {
      console.error('Error updating status:', error)
    } else {
      setSubscriptions(prev => 
        prev.map(sub => sub.id === id ? { ...sub, status } : sub)
      )
    }
    
    setUpdating(null)
  }

  const pendingCount = subscriptions.filter(s => s.status === 'pending').length

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-foreground text-background">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link href="/admin" className="font-[var(--font-display)] text-2xl">
                STR <span className="text-accent">ADMIN</span>
              </Link>
              <span className="text-background/50">/</span>
              <span className="text-background/70">Suscripciones</span>
            </div>
            <Link href="/" className="text-sm text-background/60 hover:text-background">
              Volver al sitio
            </Link>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
          <div className="bg-foreground text-background p-4 rounded-lg">
            <div className="flex items-center gap-3">
              <Users className="h-5 w-5 text-accent" />
              <div>
                <p className="text-2xl font-bold">{subscriptions.length}</p>
                <p className="text-sm text-background/60">Total</p>
              </div>
            </div>
          </div>
          <div className="bg-yellow-500/10 border border-yellow-500/30 p-4 rounded-lg">
            <div className="flex items-center gap-3">
              <Filter className="h-5 w-5 text-yellow-500" />
              <div>
                <p className="text-2xl font-bold text-yellow-500">{pendingCount}</p>
                <p className="text-sm text-muted-foreground">Pendientes</p>
              </div>
            </div>
          </div>
          <div className="bg-accent/10 border border-accent/30 p-4 rounded-lg">
            <div className="flex items-center gap-3">
              <Plane className="h-5 w-5 text-accent" />
              <div>
                <p className="text-2xl font-bold text-accent">
                  {subscriptions.filter(s => s.subscription_type.includes('trip')).length}
                </p>
                <p className="text-sm text-muted-foreground">Viajes</p>
              </div>
            </div>
          </div>
          <div className="bg-green-500/10 border border-green-500/30 p-4 rounded-lg">
            <div className="flex items-center gap-3">
              <Calendar className="h-5 w-5 text-green-500" />
              <div>
                <p className="text-2xl font-bold text-green-500">
                  {subscriptions.filter(s => s.subscription_type === 'newsletter').length}
                </p>
                <p className="text-sm text-muted-foreground">Clases</p>
              </div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-4 mb-6">
          <div className="flex gap-2">
            <span className="text-sm text-muted-foreground self-center mr-2">Estado:</span>
            {(['all', 'pending', 'approved', 'rejected'] as const).map((status) => (
              <Button
                key={status}
                variant={filter === status ? 'default' : 'outline'}
                size="sm"
                onClick={() => setFilter(status)}
                className={filter === status ? 'bg-foreground text-background' : 'bg-transparent'}
              >
                {status === 'all' ? 'Todos' : status === 'pending' ? 'Pendientes' : status === 'approved' ? 'Aprobados' : 'Rechazados'}
              </Button>
            ))}
          </div>
          
          <div className="flex gap-2">
            <span className="text-sm text-muted-foreground self-center mr-2">Tipo:</span>
            {(['all', 'newsletter', 'trip_nicaragua', 'trip_peru'] as const).map((type) => (
              <Button
                key={type}
                variant={typeFilter === type ? 'default' : 'outline'}
                size="sm"
                onClick={() => setTypeFilter(type)}
                className={typeFilter === type ? 'bg-foreground text-background' : 'bg-transparent'}
              >
                {type === 'all' ? 'Todos' : typeLabels[type]}
              </Button>
            ))}
          </div>
        </div>

        {/* Subscriptions List */}
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-accent" />
          </div>
        ) : subscriptions.length === 0 ? (
          <div className="text-center py-12 bg-muted/30 rounded-lg">
            <p className="text-muted-foreground">No hay suscripciones</p>
          </div>
        ) : (
          <div className="space-y-3">
            {subscriptions.map((sub) => (
              <div 
                key={sub.id} 
                className="bg-card border border-border rounded-lg p-4 flex flex-col sm:flex-row sm:items-center gap-4"
              >
                {/* User Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 mb-2">
                    <a
                      href={`https://instagram.com/${sub.instagram_username}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 text-foreground hover:text-accent transition-colors group"
                    >
                      <Instagram className="h-4 w-4" />
                      <span className="font-medium">@{sub.instagram_username}</span>
                      <ExternalLink className="h-3 w-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                    </a>
                  </div>
                  
                  <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
                    <a
                      href={`https://wa.me/${sub.whatsapp_phone.replace(/\D/g, '')}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1 hover:text-green-500 transition-colors"
                    >
                      <Phone className="h-3 w-3" />
                      {sub.whatsapp_phone}
                    </a>
                    <span>•</span>
                    <span>{new Date(sub.created_at).toLocaleDateString('es-UY')}</span>
                  </div>
                </div>

                {/* Type Badge */}
                <div className="flex items-center gap-3">
                  <span className="px-3 py-1 bg-accent/10 text-accent text-xs font-medium rounded-full">
                    {typeLabels[sub.subscription_type] || sub.subscription_type}
                  </span>
                  
                  {/* Status Badge */}
                  <span className={`px-3 py-1 text-xs font-medium rounded-full border ${statusColors[sub.status]}`}>
                    {sub.status === 'pending' ? 'Pendiente' : sub.status === 'approved' ? 'Aprobado' : 'Rechazado'}
                  </span>
                </div>

                {/* Actions */}
                {sub.status === 'pending' && (
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      onClick={() => updateStatus(sub.id, 'approved')}
                      disabled={updating === sub.id}
                      className="bg-green-500 hover:bg-green-600 text-white"
                    >
                      {updating === sub.id ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <>
                          <Check className="h-4 w-4 mr-1" />
                          Aprobar
                        </>
                      )}
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => updateStatus(sub.id, 'rejected')}
                      disabled={updating === sub.id}
                      className="border-red-500/30 text-red-500 hover:bg-red-500/10 bg-transparent"
                    >
                      <X className="h-4 w-4 mr-1" />
                      Rechazar
                    </Button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  )
}
