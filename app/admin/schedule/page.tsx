'use client'

import React from "react"

import { useState } from 'react'
import useSWR, { mutate } from 'swr'
import { createClient } from '@/lib/supabase/client'
import type { TrainingSchedule } from '@/lib/types'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Plus, Pencil, Trash2, X, Loader2 } from 'lucide-react'

const dayNames = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado']
const disciplines = ['surf', 'skate', 'sup'] as const

async function fetchSchedule(): Promise<TrainingSchedule[]> {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('training_schedule')
    .select('*')
    .order('day_of_week')
    .order('start_time')
  
  if (error) throw error
  return (data || []).map((row: Record<string, unknown>) => ({
    ...row,
    is_active: (row.is_active as boolean) ?? (row.active as boolean) ?? true,
    instructor: (row.instructor as string) ?? '',
  })) as TrainingSchedule[]
}

const emptySchedule = {
  day_of_week: 1,
  start_time: '09:00',
  end_time: '10:30',
  discipline: 'surf' as const,
  location: '',
  location_lat: null as number | null,
  location_lng: null as number | null,
  instructor: '',
  is_active: true,
}

export default function AdminSchedulePage() {
  const { data: schedule, isLoading } = useSWR('admin-schedule', fetchSchedule)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingItem, setEditingItem] = useState<TrainingSchedule | null>(null)
  const [formData, setFormData] = useState(emptySchedule)
  const [isSaving, setIsSaving] = useState(false)

  const openNewModal = () => {
    setEditingItem(null)
    setFormData(emptySchedule)
    setIsModalOpen(true)
  }

  const openEditModal = (item: TrainingSchedule) => {
    setEditingItem(item)
    setFormData({
      day_of_week: item.day_of_week,
      start_time: item.start_time,
      end_time: item.end_time,
      'surf' | 'skate' | 'sup',
      location: item.location,
      location_lat: item.location_lat,
      location_lng: item.location_lng,
      instructor: item.instructor || '',
      is_active: item.is_active,
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
      if (editingItem) {
        await supabase.from('training_schedule').update(row).eq('id', editingItem.id)
      } else {
        await supabase.from('training_schedule').insert(row)
      }
      
      mutate('admin-schedule')
      mutate('training-schedule')
      mutate('locations')
      setIsModalOpen(false)
    } catch (error) {
      console.error('Error saving schedule:', error)
    } finally {
      setIsSaving(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('¿Estás seguro de que querés eliminar este horario?')) return
    
    const supabase = createClient()
    await supabase.from('training_schedule').delete().eq('id', id)
    mutate('admin-schedule')
    mutate('training-schedule')
    mutate('locations')
  }

  // Group by day
  const scheduleByDay = schedule?.reduce((acc, item) => {
    const day = item.day_of_week
    if (!acc[day]) acc[day] = []
    acc[day].push(item)
    return acc
  }, {} as Record<number, TrainingSchedule[]>) || {}

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-[var(--font-display)] text-4xl mb-2">HORARIOS</h1>
          <p className="text-muted-foreground">Gestiona los horarios de entrenamiento</p>
        </div>
        <Button onClick={openNewModal}>
          <Plus className="mr-2 h-4 w-4" />
          NUEVO HORARIO
        </Button>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      ) : schedule && schedule.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6, 0].map((dayIndex) => {
            const daySchedule = scheduleByDay[dayIndex] || []
            return (
              <div key={dayIndex} className="bg-card border border-border">
                <div className="p-4 bg-muted border-b border-border">
                  <h3 className="font-[var(--font-display)] text-xl">{dayNames[dayIndex]}</h3>
                </div>
                
                <div className="p-4">
                  {daySchedule.length === 0 ? (
                    <p className="text-muted-foreground text-sm">Sin clases</p>
                  ) : (
                    <div className="space-y-3">
                      {daySchedule.map((item) => (
                        <div 
                          key={item.id} 
                          className={`p-3 border-l-4 ${
                            item.discipline === 'surf' ? 'border-l-blue-500 bg-blue-500/5' :
                            item.discipline === 'skate' ? 'border-l-orange-500 bg-orange-500/5' :
                            'border-l-teal-500 bg-teal-500/5'
                          } ${!item.is_active ? 'opacity-50' : ''}`}
                        >
                          <div className="flex items-start justify-between">
                            <div>
                              <p className="font-semibold uppercase text-sm">{item.discipline}</p>
                              <p className="text-sm text-muted-foreground">
                                {item.start_time.slice(0, 5)} - {item.end_time.slice(0, 5)}
                              </p>
                              <p className="text-sm text-muted-foreground">{item.location}</p>
                            </div>
                            <div className="flex gap-1">
                              <button
                                onClick={() => openEditModal(item)}
                                className="p-1 hover:bg-muted transition-colors"
                              >
                                <Pencil className="h-3 w-3" />
                              </button>
                              <button
                                onClick={() => handleDelete(item.id)}
                                className="p-1 hover:bg-destructive/10 text-destructive transition-colors"
                              >
                                <Trash2 className="h-3 w-3" />
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      ) : (
        <div className="bg-card border border-border p-12 text-center">
          <p className="text-muted-foreground mb-4">No hay horarios configurados</p>
          <Button onClick={openNewModal}>
            <Plus className="mr-2 h-4 w-4" />
            CREAR PRIMER HORARIO
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
              {editingItem ? 'EDITAR HORARIO' : 'NUEVO HORARIO'}
            </h2>

            <form onSubmit={handleSave} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="day_of_week">Día</Label>
                  <select
                    id="day_of_week"
                    value={formData.day_of_week}
                    onChange={(e) => setFormData(prev => ({ ...prev, day_of_week: Number(e.target.value) }))}
                    className="mt-1 w-full h-10 px-3 border border-input bg-background"
                    required
                  >
                    {[1, 2, 3, 4, 5, 6, 0].map((day) => (
                      <option key={day} value={day}>{dayNames[day]}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <Label htmlFor="discipline">Disciplina</Label>
                  <select
                    id="discipline"
                    value={formData.discipline}
                    onChange={(e) => setFormData(prev => ({ ...prev, discipline: e.target.value as typeof formData.discipline }))}
                    className="mt-1 w-full h-10 px-3 border border-input bg-background"
                    required
                  >
                    {disciplines.map((d) => (
                      <option key={d} value={d}>{d.toUpperCase()}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="start_time">Hora inicio</Label>
                  <Input
                    id="start_time"
                    type="time"
                    value={formData.start_time}
                    onChange={(e) => setFormData(prev => ({ ...prev, start_time: e.target.value }))}
                    required
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="end_time">Hora fin</Label>
                  <Input
                    id="end_time"
                    type="time"
                    value={formData.end_time}
                    onChange={(e) => setFormData(prev => ({ ...prev, end_time: e.target.value }))}
                    required
                    className="mt-1"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="location">Ubicación</Label>
                <Input
                  id="location"
                  value={formData.location}
                  onChange={(e) => setFormData(prev => ({ ...prev, location: e.target.value }))}
                  required
                  className="mt-1"
                  placeholder="Ej: Parque Centenario"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="location_lat">Latitud (opcional)</Label>
                  <Input
                    id="location_lat"
                    type="number"
                    step="any"
                    value={formData.location_lat || ''}
                    onChange={(e) => setFormData(prev => ({ ...prev, location_lat: e.target.value ? Number(e.target.value) : null }))}
                    className="mt-1"
                    placeholder="-34.6037"
                  />
                </div>
                <div>
                  <Label htmlFor="location_lng">Longitud (opcional)</Label>
                  <Input
                    id="location_lng"
                    type="number"
                    step="any"
                    value={formData.location_lng || ''}
                    onChange={(e) => setFormData(prev => ({ ...prev, location_lng: e.target.value ? Number(e.target.value) : null }))}
                    className="mt-1"
                    placeholder="-58.3816"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="instructor">Instructor (opcional)</Label>
                <Input
                  id="instructor"
                  value={formData.instructor}
                  onChange={(e) => setFormData(prev => ({ ...prev, instructor: e.target.value }))}
                  className="mt-1"
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
                <Label htmlFor="is_active">Horario activo</Label>
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
