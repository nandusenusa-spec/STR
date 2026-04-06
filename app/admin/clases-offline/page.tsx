'use client'

import { useEffect, useState } from 'react'
import { GraduationCap, Plus, Trash2, Edit, MapPin, Clock, Users, Calendar } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { createClient } from '@/lib/supabase/client'

interface ClaseOffline {
  id: string
  titulo: string
  descripcion: string
  tipo: 'Surf' | 'Skate' | 'Fitness'
  lugar: string
  dia: string
  hora: string
  duracion: string
  capacidad: number
  precio: number
  activo: boolean
}

const initialClases: ClaseOffline[] = [
  { 
    id: '1', 
    titulo: 'Surf Principiantes', 
    descripcion: 'Clase para quienes recien empiezan. Incluye tabla y traje.',
    tipo: 'Surf',
    lugar: 'Playa La Barra',
    dia: 'Sabados',
    hora: '09:00',
    duracion: '2 horas',
    capacidad: 8,
    precio: 1500,
    activo: true
  },
  { 
    id: '2', 
    titulo: 'Skate Tecnica', 
    descripcion: 'Mejora tu tecnica de skate con ejercicios avanzados.',
    tipo: 'Skate',
    lugar: 'Skatepark Montevideo',
    dia: 'Domingos',
    hora: '10:00',
    duracion: '1.5 horas',
    capacidad: 10,
    precio: 1200,
    activo: true
  },
  { 
    id: '3', 
    titulo: 'Funcional Surf', 
    descripcion: 'Entrenamiento funcional especifico para surfistas.',
    tipo: 'Fitness',
    lugar: 'Gimnasio Central',
    dia: 'Martes y Jueves',
    hora: '19:00',
    duracion: '1 hora',
    capacidad: 15,
    precio: 800,
    activo: false
  },
]

export default function AdminClasesOfflinePage() {
  const [clases, setClases] = useState<ClaseOffline[]>(initialClases)
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [formData, setFormData] = useState<Omit<ClaseOffline, 'id' | 'activo'>>({
    titulo: '',
    descripcion: '',
    tipo: 'Surf',
    lugar: '',
    dia: '',
    hora: '',
    duracion: '',
    capacidad: 8,
    precio: 0
  })

  useEffect(() => {
    const load = async () => {
      const supabase = createClient()
      const { data } = await supabase
        .from('admin_offline_classes')
        .select('*')
        .order('created_at', { ascending: false })
      if (!data || data.length === 0) return
      setClases(
        data.map((c) => ({
          id: c.id,
          titulo: c.titulo,
          descripcion: c.descripcion || '',
          tipo: (c.tipo as 'Surf' | 'Skate' | 'Fitness') || 'Surf',
          lugar: c.lugar || '',
          dia: c.dia || '',
          hora: c.hora || '',
          duracion: c.duracion || '',
          capacidad: Number(c.capacidad || 0),
          precio: Number(c.precio || 0),
          activo: !!c.activo,
        })),
      )
    }
    load()
  }, [])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const supabase = createClient()
    if (editingId) {
      setClases(clases.map(c => c.id === editingId ? { ...c, ...formData } : c))
      void supabase.from('admin_offline_classes').update({ ...formData }).eq('id', editingId)
      setEditingId(null)
    } else {
      const optimisticId = Date.now().toString()
      setClases([...clases, { ...formData, id: optimisticId, activo: true }])
      void supabase
        .from('admin_offline_classes')
        .insert({ ...formData, activo: true })
        .select('id')
        .single()
        .then(({ data }) => {
          if (!data?.id) return
          setClases((prev) => prev.map((c) => (c.id === optimisticId ? { ...c, id: data.id } : c)))
        })
    }
    setFormData({
      titulo: '',
      descripcion: '',
      tipo: 'Surf',
      lugar: '',
      dia: '',
      hora: '',
      duracion: '',
      capacidad: 8,
      precio: 0
    })
    setShowForm(false)
  }

  const handleEdit = (clase: ClaseOffline) => {
    setFormData({
      titulo: clase.titulo,
      descripcion: clase.descripcion,
      tipo: clase.tipo,
      lugar: clase.lugar,
      dia: clase.dia,
      hora: clase.hora,
      duracion: clase.duracion,
      capacidad: clase.capacidad,
      precio: clase.precio
    })
    setEditingId(clase.id)
    setShowForm(true)
  }

  const handleDelete = (id: string) => {
    setClases(clases.filter(c => c.id !== id))
    const supabase = createClient()
    void supabase.from('admin_offline_classes').delete().eq('id', id)
  }

  const toggleActivo = (id: string) => {
    const next = clases.map(c => c.id === id ? { ...c, activo: !c.activo } : c)
    setClases(next)
    const changed = next.find((c) => c.id === id)
    if (changed) {
      const supabase = createClient()
      void supabase.from('admin_offline_classes').update({ activo: changed.activo }).eq('id', id)
    }
  }

  const getColorByType = (tipo: string) => {
    switch (tipo) {
      case 'Surf': return { bg: 'bg-neon-cyan/20', text: 'text-neon-cyan', border: 'border-neon-cyan/30' }
      case 'Skate': return { bg: 'bg-neon-magenta/20', text: 'text-neon-magenta', border: 'border-neon-magenta/30' }
      case 'Fitness': return { bg: 'bg-neon-lime/20', text: 'text-neon-lime', border: 'border-neon-lime/30' }
      default: return { bg: 'bg-white/20', text: 'text-white', border: 'border-white/30' }
    }
  }

  return (
    <div className="p-6 lg:p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Clases Offline</h1>
          <p className="text-muted-foreground mt-1">Gestiona las clases presenciales</p>
        </div>
        <Button 
          onClick={() => { 
            setShowForm(!showForm); 
            setEditingId(null); 
            setFormData({
              titulo: '',
              descripcion: '',
              tipo: 'Surf',
              lugar: '',
              dia: '',
              hora: '',
              duracion: '',
              capacidad: 8,
              precio: 0
            })
          }}
          className="bg-neon-lime text-background hover:bg-neon-lime/80"
        >
          <Plus className="w-4 h-4 mr-2" />
          Nueva Clase
        </Button>
      </div>

      {showForm && (
        <Card className="mb-8 border-neon-lime/30 bg-card/50">
          <CardHeader>
            <CardTitle>{editingId ? 'Editar Clase' : 'Nueva Clase'}</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  placeholder="Titulo de la clase"
                  value={formData.titulo}
                  onChange={(e) => setFormData({ ...formData, titulo: e.target.value })}
                  required
                />
                <select
                  value={formData.tipo}
                  onChange={(e) => setFormData({ ...formData, tipo: e.target.value as 'Surf' | 'Skate' | 'Fitness' })}
                  className="px-3 py-2 rounded-md bg-background border border-input text-foreground"
                >
                  <option value="Surf">Surf</option>
                  <option value="Skate">Skate</option>
                  <option value="Fitness">Fitness</option>
                </select>
              </div>
              <Textarea
                placeholder="Descripcion de la clase..."
                value={formData.descripcion}
                onChange={(e) => setFormData({ ...formData, descripcion: e.target.value })}
                rows={2}
              />
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Input
                  placeholder="Lugar"
                  value={formData.lugar}
                  onChange={(e) => setFormData({ ...formData, lugar: e.target.value })}
                  required
                />
                <Input
                  placeholder="Dia/s (ej: Sabados)"
                  value={formData.dia}
                  onChange={(e) => setFormData({ ...formData, dia: e.target.value })}
                  required
                />
                <Input
                  type="time"
                  value={formData.hora}
                  onChange={(e) => setFormData({ ...formData, hora: e.target.value })}
                  required
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Input
                  placeholder="Duracion (ej: 2 horas)"
                  value={formData.duracion}
                  onChange={(e) => setFormData({ ...formData, duracion: e.target.value })}
                  required
                />
                <Input
                  type="number"
                  placeholder="Capacidad"
                  value={formData.capacidad}
                  onChange={(e) => setFormData({ ...formData, capacidad: parseInt(e.target.value) })}
                  min={1}
                  required
                />
                <Input
                  type="number"
                  placeholder="Precio"
                  value={formData.precio}
                  onChange={(e) => setFormData({ ...formData, precio: parseInt(e.target.value) })}
                  min={0}
                  required
                />
              </div>
              <div className="flex gap-2">
                <Button type="submit" className="bg-neon-cyan text-background hover:bg-neon-cyan/80">
                  {editingId ? 'Guardar Cambios' : 'Crear Clase'}
                </Button>
                <Button type="button" variant="outline" onClick={() => { setShowForm(false); setEditingId(null) }}>
                  Cancelar
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {clases.map((clase) => {
          const colors = getColorByType(clase.tipo)
          return (
            <Card key={clase.id} className={`${colors.border} ${!clase.activo ? 'opacity-50' : ''}`}>
              <CardContent className="p-5">
                <div className="flex items-start justify-between mb-3">
                  <div className={`w-10 h-10 rounded-lg ${colors.bg} flex items-center justify-center`}>
                    <GraduationCap className={`w-5 h-5 ${colors.text}`} />
                  </div>
                  <div className="flex gap-1">
                    <Button size="icon" variant="ghost" className="h-8 w-8" onClick={() => handleEdit(clase)}>
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button size="icon" variant="ghost" className="h-8 w-8 text-destructive" onClick={() => handleDelete(clase.id)}>
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
                
                <div className="flex items-center gap-2 mb-2">
                  <span className={`px-2 py-0.5 rounded text-xs ${colors.bg} ${colors.text}`}>
                    {clase.tipo}
                  </span>
                  {!clase.activo && (
                    <span className="px-2 py-0.5 rounded text-xs bg-destructive/20 text-destructive">
                      INACTIVO
                    </span>
                  )}
                </div>
                
                <h3 className="font-semibold text-foreground mb-1">{clase.titulo}</h3>
                <p className="text-sm text-muted-foreground mb-3 line-clamp-2">{clase.descripcion}</p>
                
                <div className="space-y-1 text-sm text-muted-foreground">
                  <div className="flex items-center gap-2">
                    <MapPin className="w-3 h-3" />
                    {clase.lugar}
                  </div>
                  <div className="flex items-center gap-2">
                    <Calendar className="w-3 h-3" />
                    {clase.dia} - {clase.hora}
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="w-3 h-3" />
                    {clase.duracion}
                  </div>
                  <div className="flex items-center gap-2">
                    <Users className="w-3 h-3" />
                    {clase.capacidad} personas max
                  </div>
                </div>
                
                <div className="mt-4 pt-3 border-t border-white/10 flex items-center justify-between">
                  <span className={`text-xl font-bold ${colors.text}`}>${clase.precio.toLocaleString()}</span>
                  <Button 
                    size="sm" 
                    variant={clase.activo ? 'outline' : 'default'}
                    onClick={() => toggleActivo(clase.id)}
                    className={!clase.activo ? 'bg-neon-lime text-background' : ''}
                  >
                    {clase.activo ? 'Desactivar' : 'Activar'}
                  </Button>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {clases.length === 0 && (
        <div className="text-center py-12 text-muted-foreground">
          <GraduationCap className="w-12 h-12 mx-auto mb-4 opacity-50" />
          <p>No hay clases. Crea la primera.</p>
        </div>
      )}
    </div>
  )
}
