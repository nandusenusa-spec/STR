'use client'

import { useEffect, useState } from 'react'
import { Megaphone, Plus, Trash2, Edit, Calendar } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Switch } from '@/components/ui/switch'
import { createClient } from '@/lib/supabase/client'

interface Promocion {
  id: string
  titulo: string
  mensaje: string
  tipo: 'popup' | 'banner'
  activo: boolean
  fechaInicio: string
  fechaFin: string
  color: string
}

const initialPromos: Promocion[] = [
  { 
    id: '1', 
    titulo: 'Descuento 20%', 
    mensaje: 'Inscribite este mes y obtene 20% de descuento en tu primer mes!', 
    tipo: 'popup', 
    activo: true,
    fechaInicio: '2024-01-01',
    fechaFin: '2024-01-31',
    color: 'cyan'
  },
  { 
    id: '2', 
    titulo: 'Nuevos horarios', 
    mensaje: 'Agregamos clases los sabados a la manana!', 
    tipo: 'banner', 
    activo: false,
    fechaInicio: '2024-02-01',
    fechaFin: '2024-02-28',
    color: 'magenta'
  },
]

export default function AdminPromocionesPage() {
  const [promos, setPromos] = useState<Promocion[]>(initialPromos)
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [formData, setFormData] = useState({ 
    titulo: '', 
    mensaje: '', 
    tipo: 'popup' as const, 
    fechaInicio: '', 
    fechaFin: '',
    color: 'cyan'
  })

  useEffect(() => {
    const load = async () => {
      const supabase = createClient()
      const { data } = await supabase
        .from('admin_promotions')
        .select('*')
        .order('created_at', { ascending: false })
      if (!data || data.length === 0) return
      setPromos(
        data.map((p) => ({
          id: p.id,
          titulo: p.titulo,
          mensaje: p.mensaje,
          tipo: p.tipo as 'popup' | 'banner',
          activo: !!p.activo,
          fechaInicio: p.fecha_inicio || '',
          fechaFin: p.fecha_fin || '',
          color: p.color || 'cyan',
        })),
      )
    }
    load()
  }, [])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const supabase = createClient()
    if (editingId) {
      setPromos(promos.map(p => p.id === editingId ? { ...p, ...formData, activo: promos.find(pr => pr.id === editingId)?.activo || false } : p))
      void supabase
        .from('admin_promotions')
        .update({
          titulo: formData.titulo,
          mensaje: formData.mensaje,
          tipo: formData.tipo,
          fecha_inicio: formData.fechaInicio,
          fecha_fin: formData.fechaFin,
          color: formData.color,
        })
        .eq('id', editingId)
      setEditingId(null)
    } else {
      const optimisticId = Date.now().toString()
      setPromos([...promos, { ...formData, id: optimisticId, activo: false }])
      void supabase
        .from('admin_promotions')
        .insert({
          titulo: formData.titulo,
          mensaje: formData.mensaje,
          tipo: formData.tipo,
          fecha_inicio: formData.fechaInicio,
          fecha_fin: formData.fechaFin,
          color: formData.color,
          activo: false,
        })
        .select('id')
        .single()
        .then(({ data }) => {
          if (!data?.id) return
          setPromos((prev) => prev.map((p) => (p.id === optimisticId ? { ...p, id: data.id } : p)))
        })
    }
    setFormData({ titulo: '', mensaje: '', tipo: 'popup', fechaInicio: '', fechaFin: '', color: 'cyan' })
    setShowForm(false)
  }

  const handleEdit = (promo: Promocion) => {
    setFormData({ 
      titulo: promo.titulo, 
      mensaje: promo.mensaje, 
      tipo: promo.tipo,
      fechaInicio: promo.fechaInicio,
      fechaFin: promo.fechaFin,
      color: promo.color
    })
    setEditingId(promo.id)
    setShowForm(true)
  }

  const handleDelete = (id: string) => {
    setPromos(promos.filter(p => p.id !== id))
    const supabase = createClient()
    void supabase.from('admin_promotions').delete().eq('id', id)
  }

  const toggleActivo = (id: string) => {
    const next = promos.map(p => p.id === id ? { ...p, activo: !p.activo } : p)
    setPromos(next)
    const changed = next.find((p) => p.id === id)
    if (changed) {
      const supabase = createClient()
      void supabase.from('admin_promotions').update({ activo: changed.activo }).eq('id', id)
    }
  }

  return (
    <div className="p-6 lg:p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Promociones</h1>
          <p className="text-muted-foreground mt-1">Gestiona popups y banners promocionales</p>
        </div>
        <Button 
          onClick={() => { setShowForm(!showForm); setEditingId(null); setFormData({ titulo: '', mensaje: '', tipo: 'popup', fechaInicio: '', fechaFin: '', color: 'cyan' }) }}
          className="bg-primary text-background hover:bg-primary/80"
        >
          <Plus className="w-4 h-4 mr-2" />
          Nueva Promocion
        </Button>
      </div>

      {showForm && (
        <Card className="mb-8 border-primary/30 bg-card/50">
          <CardHeader>
            <CardTitle>{editingId ? 'Editar Promocion' : 'Nueva Promocion'}</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  placeholder="Titulo de la promocion"
                  value={formData.titulo}
                  onChange={(e) => setFormData({ ...formData, titulo: e.target.value })}
                  required
                />
                <select
                  value={formData.tipo}
                  onChange={(e) => setFormData({ ...formData, tipo: e.target.value as 'popup' | 'banner' })}
                  className="px-3 py-2 rounded-md bg-background border border-input text-foreground"
                >
                  <option value="popup">Popup</option>
                  <option value="banner">Banner</option>
                </select>
              </div>
              <Textarea
                placeholder="Mensaje de la promocion..."
                value={formData.mensaje}
                onChange={(e) => setFormData({ ...formData, mensaje: e.target.value })}
                rows={3}
                required
              />
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="text-sm text-muted-foreground mb-1 block">Fecha inicio</label>
                  <Input
                    type="date"
                    value={formData.fechaInicio}
                    onChange={(e) => setFormData({ ...formData, fechaInicio: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <label className="text-sm text-muted-foreground mb-1 block">Fecha fin</label>
                  <Input
                    type="date"
                    value={formData.fechaFin}
                    onChange={(e) => setFormData({ ...formData, fechaFin: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <label className="text-sm text-muted-foreground mb-1 block">Color</label>
                  <select
                    value={formData.color}
                    onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                    className="w-full px-3 py-2 rounded-md bg-background border border-input text-foreground"
                  >
                    <option value="cyan">Cyan</option>
                    <option value="magenta">Magenta</option>
                    <option value="lime">Lima</option>
                  </select>
                </div>
              </div>
              <div className="flex gap-2">
                <Button type="submit" className="bg-primary text-background hover:bg-primary/80">
                  {editingId ? 'Guardar Cambios' : 'Crear Promocion'}
                </Button>
                <Button type="button" variant="outline" onClick={() => { setShowForm(false); setEditingId(null) }}>
                  Cancelar
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      <div className="grid gap-4">
        {promos.map((promo) => (
          <Card key={promo.id} className={`border-white/10 ${!promo.activo ? 'opacity-60' : ''}`}>
            <CardContent className="p-4">
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-4">
                  <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${
                    promo.color === 'cyan' ? 'bg-primary/20' :
                    promo.color === 'magenta' ? 'bg-primary/20' :
                    'bg-primary/20'
                  }`}>
                    <Megaphone className={`w-6 h-6 ${
                      promo.color === 'cyan' ? 'text-primary' :
                      promo.color === 'magenta' ? 'text-primary' :
                      'text-primary'
                    }`} />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-medium text-foreground">{promo.titulo}</h3>
                      <span className={`px-2 py-0.5 rounded text-xs ${
                        promo.tipo === 'popup' ? 'bg-primary/20 text-primary' : 'bg-primary/20 text-primary'
                      }`}>
                        {promo.tipo.toUpperCase()}
                      </span>
                      {promo.activo && (
                        <span className="px-2 py-0.5 rounded text-xs bg-primary/20 text-primary">
                          ACTIVO
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground mb-2">{promo.mensaje}</p>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <Calendar className="w-3 h-3" />
                      {promo.fechaInicio} - {promo.fechaFin}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-muted-foreground">Activo</span>
                    <Switch checked={promo.activo} onCheckedChange={() => toggleActivo(promo.id)} />
                  </div>
                  <Button size="icon" variant="ghost" onClick={() => handleEdit(promo)}>
                    <Edit className="w-4 h-4" />
                  </Button>
                  <Button size="icon" variant="ghost" className="text-destructive" onClick={() => handleDelete(promo.id)}>
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {promos.length === 0 && (
        <div className="text-center py-12 text-muted-foreground">
          <Megaphone className="w-12 h-12 mx-auto mb-4 opacity-50" />
          <p>No hay promociones. Crea la primera.</p>
        </div>
      )}
    </div>
  )
}
