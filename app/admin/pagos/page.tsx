'use client'

import { useEffect, useMemo, useState } from 'react'
import { Check, X, Search } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent } from '@/components/ui/card'
import { createClient } from '@/lib/supabase/client'

interface Alumno {
  id: string
  nombre: string
  email: string
  plan: string
  monto: number
  estado: 'pagado' | 'pendiente' | 'vencido'
  fechaPago: string
  proximoPago: string
}

export default function AdminPagosPage() {
  const [alumnos, setAlumnos] = useState<Alumno[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [filterEstado, setFilterEstado] = useState<string>('todos')

  useEffect(() => {
    const load = async () => {
      const supabase = createClient()
      const { data } = await supabase
        .from('orders')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(300)

      const mapped: Alumno[] = (data || []).map((o: Record<string, unknown>) => {
        const status = String(o.status || 'pending')
        const estado =
          status === 'paid' ? 'pagado' : status === 'pending' ? 'pendiente' : 'vencido'
        const created = String(o.created_at || new Date().toISOString())
        const createdAt = new Date(created)
        const next = new Date(createdAt.getTime() + 30 * 24 * 60 * 60 * 1000)
        return {
          id: String(o.id),
          nombre: String(o.customer_name || 'Cliente'),
          email: String(o.customer_email || ''),
          plan: 'Mensual',
          monto: Number(o.total || 0),
          estado,
          fechaPago: estado === 'pagado' ? createdAt.toLocaleDateString('es-UY') : '-',
          proximoPago: next.toLocaleDateString('es-UY'),
        }
      })
      setAlumnos(mapped)
      setLoading(false)
    }
    load()
  }, [])

  const filteredAlumnos = useMemo(() => alumnos.filter(a => {
    const matchSearch = a.nombre.toLowerCase().includes(search.toLowerCase()) || 
                       a.email.toLowerCase().includes(search.toLowerCase())
    const matchFilter = filterEstado === 'todos' || a.estado === filterEstado
    return matchSearch && matchFilter
  }), [alumnos, search, filterEstado])

  const togglePago = async (id: string) => {
    const current = alumnos.find((a) => a.id === id)
    if (!current) return
    const nextEstado = current.estado === 'pagado' ? 'pendiente' : 'pagado'
    const supabase = createClient()
    await supabase
      .from('orders')
      .update({ status: nextEstado === 'pagado' ? 'paid' : 'pending' })
      .eq('id', id)

    setAlumnos(alumnos.map(a => {
      if (a.id === id) {
        return {
          ...a,
          estado: nextEstado,
          fechaPago: nextEstado === 'pagado' ? new Date().toLocaleDateString('es-UY') : '-',
        }
      }
      return a
    }))
  }

  const stats = {
    total: alumnos.length,
    pagados: alumnos.filter(a => a.estado === 'pagado').length,
    pendientes: alumnos.filter(a => a.estado === 'pendiente').length,
    vencidos: alumnos.filter(a => a.estado === 'vencido').length,
    ingresos: alumnos.filter(a => a.estado === 'pagado').reduce((acc, a) => acc + a.monto, 0)
  }

  return (
    <div className="p-6 lg:p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground">Pagos de Alumnos</h1>
        <p className="text-muted-foreground mt-1">Gestiona los pagos y suscripciones</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
        <Card className="border-white/10">
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold text-foreground">{stats.total}</p>
            <p className="text-xs text-muted-foreground">Total Alumnos</p>
          </CardContent>
        </Card>
        <Card className="border-neon-lime/30 bg-neon-lime/5">
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold text-neon-lime">{stats.pagados}</p>
            <p className="text-xs text-muted-foreground">Pagados</p>
          </CardContent>
        </Card>
        <Card className="border-yellow-500/30 bg-yellow-500/5">
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold text-yellow-500">{stats.pendientes}</p>
            <p className="text-xs text-muted-foreground">Pendientes</p>
          </CardContent>
        </Card>
        <Card className="border-destructive/30 bg-destructive/5">
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold text-destructive">{stats.vencidos}</p>
            <p className="text-xs text-muted-foreground">Vencidos</p>
          </CardContent>
        </Card>
        <Card className="border-neon-cyan/30 bg-neon-cyan/5">
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold text-neon-cyan">${stats.ingresos.toLocaleString()}</p>
            <p className="text-xs text-muted-foreground">Ingresos</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Buscar por nombre o email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10"
          />
        </div>
        <div className="flex gap-2">
          <Button 
            variant={filterEstado === 'todos' ? 'default' : 'outline'} 
            size="sm"
            onClick={() => setFilterEstado('todos')}
          >
            Todos
          </Button>
          <Button 
            variant={filterEstado === 'pagado' ? 'default' : 'outline'} 
            size="sm"
            onClick={() => setFilterEstado('pagado')}
            className={filterEstado === 'pagado' ? 'bg-neon-lime text-background' : ''}
          >
            Pagados
          </Button>
          <Button 
            variant={filterEstado === 'pendiente' ? 'default' : 'outline'} 
            size="sm"
            onClick={() => setFilterEstado('pendiente')}
            className={filterEstado === 'pendiente' ? 'bg-yellow-500 text-background' : ''}
          >
            Pendientes
          </Button>
          <Button 
            variant={filterEstado === 'vencido' ? 'default' : 'outline'} 
            size="sm"
            onClick={() => setFilterEstado('vencido')}
            className={filterEstado === 'vencido' ? 'bg-destructive text-background' : ''}
          >
            Vencidos
          </Button>
        </div>
      </div>

      {/* Table */}
      <Card className="border-white/10">
        <CardContent className="p-0">
          {loading && <div className="p-4 text-sm text-muted-foreground">Cargando pagos...</div>}
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-white/10">
                  <th className="text-left p-4 text-sm font-medium text-muted-foreground">Alumno</th>
                  <th className="text-left p-4 text-sm font-medium text-muted-foreground">Plan</th>
                  <th className="text-left p-4 text-sm font-medium text-muted-foreground">Monto</th>
                  <th className="text-left p-4 text-sm font-medium text-muted-foreground">Estado</th>
                  <th className="text-left p-4 text-sm font-medium text-muted-foreground">Ultimo Pago</th>
                  <th className="text-left p-4 text-sm font-medium text-muted-foreground">Proximo</th>
                  <th className="text-right p-4 text-sm font-medium text-muted-foreground">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {filteredAlumnos.map((alumno) => (
                  <tr key={alumno.id} className="border-b border-white/5 hover:bg-white/5">
                    <td className="p-4">
                      <div>
                        <p className="font-medium text-foreground">{alumno.nombre}</p>
                        <p className="text-sm text-muted-foreground">{alumno.email}</p>
                      </div>
                    </td>
                    <td className="p-4 text-foreground">{alumno.plan}</td>
                    <td className="p-4 text-foreground">${alumno.monto.toLocaleString()}</td>
                    <td className="p-4">
                      <span className={`px-2 py-1 rounded text-xs font-medium ${
                        alumno.estado === 'pagado' ? 'bg-neon-lime/20 text-neon-lime' :
                        alumno.estado === 'pendiente' ? 'bg-yellow-500/20 text-yellow-500' :
                        'bg-destructive/20 text-destructive'
                      }`}>
                        {alumno.estado.charAt(0).toUpperCase() + alumno.estado.slice(1)}
                      </span>
                    </td>
                    <td className="p-4 text-muted-foreground">{alumno.fechaPago}</td>
                    <td className="p-4 text-muted-foreground">{alumno.proximoPago}</td>
                    <td className="p-4 text-right">
                      <Button 
                        size="sm" 
                        variant={alumno.estado === 'pagado' ? 'outline' : 'default'}
                        onClick={() => togglePago(alumno.id)}
                        className={alumno.estado !== 'pagado' ? 'bg-neon-lime text-background hover:bg-neon-lime/80' : ''}
                      >
                        {alumno.estado === 'pagado' ? (
                          <><X className="w-4 h-4 mr-1" /> Desmarcar</>
                        ) : (
                          <><Check className="w-4 h-4 mr-1" /> Marcar Pagado</>
                        )}
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
