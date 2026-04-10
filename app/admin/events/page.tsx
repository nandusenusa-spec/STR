'use client'

import { useState } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Save, Edit2, X, Plus, Trash2, Calendar, MapPin, Users, User } from 'lucide-react'

export default function AdminEventsPage() {
  const [events, setEvents] = useState([
    {
      id: 1,
      title: 'Clase de Surf',
      description: 'Clase grupal para principiantes',
      date: '2024-04-06',
      time: '08:00',
      location: 'Playa Pocitos',
      capacity: 10,
      type: 'Surf',
      price: 50,
      instructor: 'Germán García',
    },
    {
      id: 2,
      title: 'Skate Session',
      description: 'Sesion libre en el skatepark',
      date: '2024-04-07',
      time: '17:00',
      location: 'Skatepark Central',
      capacity: 20,
      type: 'Skate',
      price: 0,
      instructor: 'Diego Ottonello',
    },
    {
      id: 3,
      title: 'SUP Yoga',
      description: 'Yoga sobre tabla de SUP',
      date: '2024-04-08',
      time: '07:00',
      location: 'Laguna del Sauce',
      capacity: 8,
      type: 'SUP',
      price: 35,
      instructor: 'Germán García',
    },
  ])

  const [editingId, setEditingId] = useState<number | null>(null)
  const [editForm, setEditForm] = useState<any>({})
  const [showNewForm, setShowNewForm] = useState(false)
  const [newEvent, setNewEvent] = useState({
    title: '',
    description: '',
    date: '',
    time: '',
    location: '',
    capacity: 10,
    type: 'Surf',
    price: 0,
    instructor: '',
  })

  const typeColors: Record<string, string> = {
    Surf: 'bg-neon-cyan',
    Skate: 'bg-neon-magenta',
    SUP: 'bg-neon-lime',
  }

  const startEdit = (event: any) => {
    setEditingId(event.id)
    setEditForm(event)
  }

  const saveEdit = () => {
    setEvents(events.map(e => e.id === editingId ? editForm : e))
    setEditingId(null)
  }

  const cancelEdit = () => {
    setEditingId(null)
    setEditForm({})
  }

  const createEvent = () => {
    const id = Math.max(...events.map(e => e.id)) + 1
    setEvents([...events, { ...newEvent, id }])
    setNewEvent({ title: '', description: '', date: '', time: '', location: '', capacity: 10, type: 'Surf', price: 0, instructor: '' })
    setShowNewForm(false)
  }

  const deleteEvent = (id: number) => {
    setEvents(events.filter(e => e.id !== id))
  }

  return (
    <div className="min-h-screen bg-background p-4 sm:p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="font-[var(--font-display)] text-4xl text-neon-lime mb-2">
          Gestion de Eventos
        </h1>
        <p className="text-muted-foreground mb-8">Crea y administra clases, meetups y eventos de la comunidad</p>

        {/* Boton crear evento */}
        <Button
          onClick={() => setShowNewForm(true)}
          className="w-full mb-6 bg-neon-lime text-background hover:bg-neon-lime/90 gap-2"
        >
          <Plus className="w-4 h-4" />
          Crear Nuevo Evento
        </Button>

        {/* Formulario nuevo evento */}
        {showNewForm && (
          <Card className="p-6 border-neon-lime/50 bg-card/50 mb-6">
            <h3 className="font-[var(--font-display)] text-xl text-neon-lime mb-4">Nuevo Evento</h3>
            <div className="space-y-4">
              <div>
                <label className="text-xs text-muted-foreground block mb-2">Titulo</label>
                <Input
                  placeholder="Ej: Clase de Surf Avanzado"
                  value={newEvent.title}
                  onChange={(e) => setNewEvent({ ...newEvent, title: e.target.value })}
                  className="bg-background border-white/10"
                />
              </div>

              <div>
                <label className="text-xs text-muted-foreground block mb-2">Descripcion</label>
                <textarea
                  placeholder="Describe el evento..."
                  value={newEvent.description}
                  onChange={(e) => setNewEvent({ ...newEvent, description: e.target.value })}
                  className="w-full px-3 py-2 rounded border border-white/10 bg-background text-foreground text-sm resize-none h-20"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs text-muted-foreground block mb-2">Fecha</label>
                  <Input
                    type="date"
                    value={newEvent.date}
                    onChange={(e) => setNewEvent({ ...newEvent, date: e.target.value })}
                    className="bg-background border-white/10"
                  />
                </div>
                <div>
                  <label className="text-xs text-muted-foreground block mb-2">Hora</label>
                  <Input
                    type="time"
                    value={newEvent.time}
                    onChange={(e) => setNewEvent({ ...newEvent, time: e.target.value })}
                    className="bg-background border-white/10"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs text-muted-foreground block mb-2">Ubicacion</label>
                <Input
                  placeholder="Ej: Playa Pocitos"
                  value={newEvent.location}
                  onChange={(e) => setNewEvent({ ...newEvent, location: e.target.value })}
                  className="bg-background border-white/10"
                />
              </div>

              <div>
                <label className="text-xs text-muted-foreground block mb-2">Instructor</label>
                <Input
                  placeholder="Nombre del instructor"
                  value={newEvent.instructor}
                  onChange={(e) => setNewEvent({ ...newEvent, instructor: e.target.value })}
                  className="bg-background border-white/10"
                />
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="text-xs text-muted-foreground block mb-2">Tipo</label>
                  <select
                    value={newEvent.type}
                    onChange={(e) => setNewEvent({ ...newEvent, type: e.target.value })}
                    className="w-full px-3 py-2 rounded border border-white/10 bg-background text-foreground text-sm"
                  >
                    <option value="Surf">Surf</option>
                    <option value="Skate">Skate</option>
                    <option value="SUP">SUP</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs text-muted-foreground block mb-2">Capacidad</label>
                  <Input
                    type="number"
                    min={1}
                    value={newEvent.capacity}
                    onChange={(e) => setNewEvent({ ...newEvent, capacity: parseInt(e.target.value) })}
                    className="bg-background border-white/10"
                  />
                </div>
                <div>
                  <label className="text-xs text-muted-foreground block mb-2">Precio (USD)</label>
                  <Input
                    type="number"
                    min={0}
                    value={newEvent.price}
                    onChange={(e) => setNewEvent({ ...newEvent, price: parseInt(e.target.value) })}
                    className="bg-background border-white/10"
                  />
                </div>
              </div>

              <div className="flex gap-2">
                <Button
                  onClick={createEvent}
                  className="flex-1 bg-neon-lime text-background hover:bg-neon-lime/90 gap-2"
                  disabled={!newEvent.title || !newEvent.date || !newEvent.time}
                >
                  <Save className="w-4 h-4" />
                  Crear Evento
                </Button>
                <Button onClick={() => setShowNewForm(false)} variant="outline" className="flex-1">
                  <X className="w-4 h-4" />
                  Cancelar
                </Button>
              </div>
            </div>
          </Card>
        )}

        {/* Lista de eventos */}
        <div className="space-y-4">
          {events.map((event) => (
            <Card key={event.id} className="p-5 border-white/10 bg-card/50">
              {editingId === event.id ? (
                // Modo edicion
                <div className="space-y-4">
                  <div>
                    <label className="text-xs text-muted-foreground block mb-2">Titulo</label>
                    <Input
                      value={editForm.title}
                      onChange={(e) => setEditForm({ ...editForm, title: e.target.value })}
                      className="bg-background border-white/10"
                    />
                  </div>

                  <div>
                    <label className="text-xs text-muted-foreground block mb-2">Descripcion</label>
                    <textarea
                      value={editForm.description}
                      onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                      className="w-full px-3 py-2 rounded border border-white/10 bg-background text-foreground text-sm resize-none h-20"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs text-muted-foreground block mb-2">Fecha</label>
                      <Input
                        type="date"
                        value={editForm.date}
                        onChange={(e) => setEditForm({ ...editForm, date: e.target.value })}
                        className="bg-background border-white/10"
                      />
                    </div>
                    <div>
                      <label className="text-xs text-muted-foreground block mb-2">Hora</label>
                      <Input
                        type="time"
                        value={editForm.time}
                        onChange={(e) => setEditForm({ ...editForm, time: e.target.value })}
                        className="bg-background border-white/10"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-xs text-muted-foreground block mb-2">Ubicacion</label>
                    <Input
                      value={editForm.location}
                      onChange={(e) => setEditForm({ ...editForm, location: e.target.value })}
                      className="bg-background border-white/10"
                    />
                  </div>

                  <div>
                    <label className="text-xs text-muted-foreground block mb-2">Instructor</label>
                    <Input
                      value={editForm.instructor ?? ''}
                      onChange={(e) => setEditForm({ ...editForm, instructor: e.target.value })}
                      className="bg-background border-white/10"
                      placeholder="Nombre del instructor"
                    />
                  </div>

                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <label className="text-xs text-muted-foreground block mb-2">Tipo</label>
                      <select
                        value={editForm.type}
                        onChange={(e) => setEditForm({ ...editForm, type: e.target.value })}
                        className="w-full px-3 py-2 rounded border border-white/10 bg-background text-foreground text-sm"
                      >
                        <option value="Surf">Surf</option>
                        <option value="Skate">Skate</option>
                        <option value="SUP">SUP</option>
                      </select>
                    </div>
                    <div>
                      <label className="text-xs text-muted-foreground block mb-2">Capacidad</label>
                      <Input
                        type="number"
                        min={1}
                        value={editForm.capacity}
                        onChange={(e) => setEditForm({ ...editForm, capacity: parseInt(e.target.value) })}
                        className="bg-background border-white/10"
                      />
                    </div>
                    <div>
                      <label className="text-xs text-muted-foreground block mb-2">Precio (USD)</label>
                      <Input
                        type="number"
                        min={0}
                        value={editForm.price}
                        onChange={(e) => setEditForm({ ...editForm, price: parseInt(e.target.value) })}
                        className="bg-background border-white/10"
                      />
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <Button onClick={saveEdit} className="flex-1 bg-neon-lime text-background hover:bg-neon-lime/90 gap-2">
                      <Save className="w-4 h-4" />
                      Guardar
                    </Button>
                    <Button onClick={cancelEdit} variant="outline" className="flex-1">
                      <X className="w-4 h-4" />
                      Cancelar
                    </Button>
                  </div>
                </div>
              ) : (
                // Modo visualizacion
                <div className="flex items-start gap-4">
                  <div className={`w-2 h-full min-h-[80px] rounded-full ${typeColors[event.type] || 'bg-white/20'}`} />
                  
                  <div className="flex-1">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <h3 className="font-[var(--font-display)] text-xl text-foreground">{event.title}</h3>
                        <span className="text-xs px-2 py-0.5 rounded bg-white/10 text-muted-foreground">{event.type}</span>
                      </div>
                      <div className="flex gap-2">
                        <Button size="sm" onClick={() => startEdit(event)} className="bg-neon-magenta text-background hover:bg-neon-magenta/90">
                          <Edit2 className="w-3 h-3" />
                        </Button>
                        <Button size="sm" variant="destructive" onClick={() => deleteEvent(event.id)}>
                          <Trash2 className="w-3 h-3" />
                        </Button>
                      </div>
                    </div>

                    <p className="text-sm text-muted-foreground mb-3">{event.description}</p>

                    <div className="flex flex-wrap gap-4 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {event.date} {event.time}
                      </span>
                      <span className="flex items-center gap-1">
                        <MapPin className="w-3 h-3" />
                        {event.location}
                      </span>
                      <span className="flex items-center gap-1">
                        <User className="w-3 h-3" />
                        {event.instructor || '—'}
                      </span>
                      <span className="flex items-center gap-1">
                        <Users className="w-3 h-3" />
                        {event.capacity} personas
                      </span>
                      <span className="text-neon-lime font-medium">
                        {event.price > 0 ? `$${event.price}` : 'Gratis'}
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </Card>
          ))}
        </div>
      </div>
    </div>
  )
}
