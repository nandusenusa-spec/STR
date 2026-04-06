'use client'

import React from "react"

import { useState } from 'react'
import useSWR, { mutate } from 'swr'
import { createClient } from '@/lib/supabase/client'
import type { Trip } from '@/lib/types'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Plus, Pencil, Trash2, X, Loader2, Users } from 'lucide-react'

async function fetchTrips(): Promise<Trip[]> {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('trips')
    .select('*')
    .order('start_date', { ascending: true })
  
  if (error) throw error
  return (data || []).map((row: Record<string, unknown>) => ({
    ...row,
    is_active: (row.is_active as boolean) ?? (row.active as boolean) ?? true,
  })) as Trip[]
}

const emptyTrip = {
  title: '',
  description: '',
  destination: '',
  start_date: '',
  end_date: '',
  price: 0,
  max_participants: 10,
  image_url: '',
  is_active: true,
}

export default function AdminTripsPage() {
  const { data: trips, isLoading } = useSWR('admin-trips', fetchTrips)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingTrip, setEditingTrip] = useState<Trip | null>(null)
  const [formData, setFormData] = useState(emptyTrip)
  const [isSaving, setIsSaving] = useState(false)

  const openNewModal = () => {
    setEditingTrip(null)
    setFormData(emptyTrip)
    setIsModalOpen(true)
  }

  const openEditModal = (trip: Trip) => {
    setEditingTrip(trip)
    setFormData({
      title: trip.title,
      description: trip.description || '',
      destination: trip.destination,
      start_date: trip.start_date,
      end_date: trip.end_date,
      price: trip.price,
      max_participants: trip.max_participants,
      image_url: trip.image_url || '',
      is_active: trip.is_active,
    })
    setIsModalOpen(true)
  }

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSaving(true)
    
    const supabase = createClient()
    
    try {
      const { is_active, ...rest } = formData
      const row = { ...rest, is_active, active: is_active }
      if (editingTrip) {
        await supabase.from('trips').update(row).eq('id', editingTrip.id)
      } else {
        await supabase.from('trips').insert({ ...row, current_participants: 0 })
      }
      
      mutate('admin-trips')
      mutate('trips')
      setIsModalOpen(false)
    } catch (error) {
      console.error('Error saving trip:', error)
    } finally {
      setIsSaving(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('¿Estás seguro de que querés eliminar este viaje?')) return
    
    const supabase = createClient()
    await supabase.from('trips').delete().eq('id', id)
    mutate('admin-trips')
    mutate('trips')
  }

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-[var(--font-display)] text-4xl mb-2">VIAJES</h1>
          <p className="text-muted-foreground">Gestiona los viajes de la comunidad</p>
        </div>
        <Button onClick={openNewModal}>
          <Plus className="mr-2 h-4 w-4" />
          NUEVO VIAJE
        </Button>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      ) : trips && trips.length > 0 ? (
        <div className="grid gap-6">
          {trips.map((trip) => (
            <div key={trip.id} className="bg-card border border-border p-6 flex gap-6">
              <div className="w-32 h-32 bg-muted flex-shrink-0">
                {trip.image_url ? (
                  <img 
                    src={trip.image_url || "/placeholder.svg"} 
                    alt={trip.title}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-foreground flex items-center justify-center">
                    <span className="font-[var(--font-display)] text-xl text-background/20">
                      {trip.destination.slice(0, 3).toUpperCase()}
                    </span>
                  </div>
                )}
              </div>
              
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h3 className="font-[var(--font-display)] text-2xl">{trip.title}</h3>
                    <p className="text-muted-foreground">{trip.destination}</p>
                  </div>
                  <span className={`inline-block px-2 py-1 text-xs font-medium ${
                    trip.is_active ? 'bg-green-500/10 text-green-500' : 'bg-muted text-muted-foreground'
                  }`}>
                    {trip.is_active ? 'Activo' : 'Inactivo'}
                  </span>
                </div>
                
                <div className="mt-4 flex flex-wrap gap-6 text-sm">
                  <div>
                    <p className="text-muted-foreground">Fechas</p>
                    <p>{new Date(trip.start_date).toLocaleDateString('es-AR')} - {new Date(trip.end_date).toLocaleDateString('es-AR')}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Precio</p>
                    <p className="font-medium">${trip.price.toLocaleString('es-AR')}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Participantes</p>
                    <p className="flex items-center gap-1">
                      <Users className="h-4 w-4" />
                      {trip.current_participants} / {trip.max_participants}
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="flex flex-col gap-2">
                <button
                  onClick={() => openEditModal(trip)}
                  className="p-2 hover:bg-muted transition-colors"
                  aria-label="Editar"
                >
                  <Pencil className="h-4 w-4" />
                </button>
                <button
                  onClick={() => handleDelete(trip.id)}
                  className="p-2 hover:bg-destructive/10 text-destructive transition-colors"
                  aria-label="Eliminar"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-card border border-border p-12 text-center">
          <p className="text-muted-foreground mb-4">No hay viajes todavía</p>
          <Button onClick={openNewModal}>
            <Plus className="mr-2 h-4 w-4" />
            CREAR PRIMER VIAJE
          </Button>
        </div>
      )}

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-foreground/80 backdrop-blur-sm" onClick={() => setIsModalOpen(false)} />
          
          <div className="relative bg-background w-full max-w-lg p-8 border border-border max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setIsModalOpen(false)}
              className="absolute top-4 right-4 p-2 hover:bg-muted transition-colors"
            >
              <X className="h-5 w-5" />
            </button>

            <h2 className="font-[var(--font-display)] text-2xl mb-6">
              {editingTrip ? 'EDITAR VIAJE' : 'NUEVO VIAJE'}
            </h2>

            <form onSubmit={handleSave} className="space-y-4">
              <div>
                <Label htmlFor="title">Título</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                  required
                  className="mt-1"
                />
              </div>

              <div>
                <Label htmlFor="destination">Destino</Label>
                <Input
                  id="destination"
                  value={formData.destination}
                  onChange={(e) => setFormData(prev => ({ ...prev, destination: e.target.value }))}
                  required
                  className="mt-1"
                  placeholder="Ej: Mar del Plata, Argentina"
                />
              </div>

              <div>
                <Label htmlFor="description">Descripción</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  className="mt-1"
                  rows={3}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="start_date">Fecha inicio</Label>
                  <Input
                    id="start_date"
                    type="date"
                    value={formData.start_date}
                    onChange={(e) => setFormData(prev => ({ ...prev, start_date: e.target.value }))}
                    required
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="end_date">Fecha fin</Label>
                  <Input
                    id="end_date"
                    type="date"
                    value={formData.end_date}
                    onChange={(e) => setFormData(prev => ({ ...prev, end_date: e.target.value }))}
                    required
                    className="mt-1"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="price">Precio (ARS)</Label>
                  <Input
                    id="price"
                    type="number"
                    min="0"
                    value={formData.price}
                    onChange={(e) => setFormData(prev => ({ ...prev, price: Number(e.target.value) }))}
                    required
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="max_participants">Máx. participantes</Label>
                  <Input
                    id="max_participants"
                    type="number"
                    min="1"
                    value={formData.max_participants}
                    onChange={(e) => setFormData(prev => ({ ...prev, max_participants: Number(e.target.value) }))}
                    required
                    className="mt-1"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="image_url">URL de Imagen</Label>
                <Input
                  id="image_url"
                  type="url"
                  value={formData.image_url}
                  onChange={(e) => setFormData(prev => ({ ...prev, image_url: e.target.value }))}
                  className="mt-1"
                  placeholder="https://..."
                />
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="is_active"
                  checked={formData.is_active}
                  onChange={(e) => setFormData(prev => ({ ...prev, is_active: e.target.checked }))}
                  className="h-4 w-4"
                />
                <Label htmlFor="is_active">Viaje activo</Label>
              </div>

              <div className="pt-4 flex gap-4">
                <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)} className="flex-1">
                  CANCELAR
                </Button>
                <Button type="submit" disabled={isSaving} className="flex-1">
                  {isSaving ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    'GUARDAR'
                  )}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
