'use client'

import { useEffect, useState } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Save, Edit2, X, Plus, Trash2 } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

type Maneuver = {
  id: string
  name: string
  level: number
  description: string
  youtubeUrl: string | null
  tips: string | null
}

export default function AdminManeuversPage() {
  const [maneuvers, setManeuvers] = useState<Maneuver[]>([])
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editForm, setEditForm] = useState<Maneuver | null>(null)
  const [showNewForm, setShowNewForm] = useState(false)
  const [newManeuver, setNewManeuver] = useState({
    name: '',
    level: 1,
    description: '',
    youtubeUrl: '',
    tips: '',
  })

  useEffect(() => {
    const load = async () => {
      const supabase = createClient()
      const { data } = await supabase
        .from('surf_maneuvers')
        .select('id, name_es, name, level_required, description_es, description, video_example_url, tips, order_index')
        .order('order_index', { ascending: true })
      if (!data) return
      const mapped = data.map((m) => ({
        id: m.id,
        name: m.name_es || m.name,
        level: Number(m.level_required || 1),
        description: m.description_es || m.description || '',
        youtubeUrl: m.video_example_url,
        tips: m.tips,
      }))
      setManeuvers(mapped)
      setNewManeuver((prev) => ({ ...prev, level: Math.max(mapped.length + 1, 1) }))
    }
    load()
  }, [])

  const convertYoutubeUrl = (url: string) => {
    if (!url) return ''
    if (url.includes('youtube.com/watch?v=')) {
      return `https://www.youtube.com/embed/${url.split('v=')[1]}`
    }
    if (url.includes('youtu.be/')) {
      return `https://www.youtube.com/embed/${url.split('youtu.be/')[1]}`
    }
    return url
  }

  const startEdit = (maneuver: Maneuver) => {
    setEditingId(maneuver.id)
    setEditForm(maneuver)
  }

  const saveEdit = async () => {
    if (!editingId || !editForm) return
    setManeuvers((prev) => prev.map((m) => (m.id === editingId ? editForm : m)))
    const supabase = createClient()
    await supabase
      .from('surf_maneuvers')
      .update({
        name_es: editForm.name,
        level_required: editForm.level,
        description_es: editForm.description,
        video_example_url: editForm.youtubeUrl || null,
        tips: editForm.tips || null,
      })
      .eq('id', editingId)
    setEditingId(null)
    setEditForm(null)
  }

  const addNewManeuver = async () => {
    const optimisticId = Date.now().toString()
    setManeuvers((prev) => [...prev, { ...newManeuver, id: optimisticId }])
    const supabase = createClient()
    const { data } = await supabase
      .from('surf_maneuvers')
      .insert({
        name: newManeuver.name,
        name_es: newManeuver.name,
        category: 'intermediate',
        level_required: newManeuver.level,
        description_es: newManeuver.description,
        video_example_url: newManeuver.youtubeUrl || null,
        tips: newManeuver.tips || null,
        points: 10,
        order_index: maneuvers.length + 1,
      })
      .select('id')
      .single()
    if (data?.id) {
      setManeuvers((prev) => prev.map((m) => (m.id === optimisticId ? { ...m, id: data.id } : m)))
    }
    setNewManeuver({ name: '', level: maneuvers.length + 2, description: '', youtubeUrl: '', tips: '' })
    setShowNewForm(false)
  }

  return (
    <div className="min-h-screen bg-background p-4 sm:p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="font-[var(--font-display)] text-4xl text-neon-magenta mb-2">Gestion de Maniobras</h1>
        <p className="text-muted-foreground mb-8">Asigna videos tutoriales de YouTube a cada maniobra para que los alumnos aprendan</p>

        <Button onClick={() => setShowNewForm(true)} className="w-full mb-6 bg-neon-cyan text-background hover:bg-neon-cyan/90 gap-2">
          <Plus className="w-4 h-4" />
          Crear Nueva Maniobra
        </Button>

        {showNewForm && (
          <Card className="p-6 border-neon-cyan/50 bg-card/50 mb-6">
            <h3 className="font-[var(--font-display)] text-xl text-neon-cyan mb-4">Nueva Maniobra</h3>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <Input placeholder="Nombre" value={newManeuver.name} onChange={(e) => setNewManeuver({ ...newManeuver, name: e.target.value })} className="bg-background border-white/10" />
                <Input type="number" min={1} value={newManeuver.level} onChange={(e) => setNewManeuver({ ...newManeuver, level: parseInt(e.target.value) || 1 })} className="bg-background border-white/10" />
              </div>
              <textarea value={newManeuver.description} onChange={(e) => setNewManeuver({ ...newManeuver, description: e.target.value })} className="w-full px-3 py-2 rounded border border-white/10 bg-background text-foreground text-sm resize-none h-20" />
              <Input value={newManeuver.youtubeUrl} onChange={(e) => setNewManeuver({ ...newManeuver, youtubeUrl: convertYoutubeUrl(e.target.value) })} className="bg-background border-white/10" placeholder="URL YouTube" />
              <textarea value={newManeuver.tips} onChange={(e) => setNewManeuver({ ...newManeuver, tips: e.target.value })} className="w-full px-3 py-2 rounded border border-white/10 bg-background text-foreground text-sm resize-none h-20" />
              <div className="flex gap-2">
                <Button onClick={addNewManeuver} className="flex-1 bg-neon-lime text-background hover:bg-neon-lime/90 gap-2" disabled={!newManeuver.name || !newManeuver.description}>
                  <Save className="w-4 h-4" />
                  Guardar Maniobra
                </Button>
                <Button onClick={() => setShowNewForm(false)} variant="outline" className="flex-1">
                  <X className="w-4 h-4" />
                  Cancelar
                </Button>
              </div>
            </div>
          </Card>
        )}

        <div className="space-y-6">
          {maneuvers.map((maneuver) => (
            <Card key={maneuver.id} className="p-6 border-white/10 bg-card/50">
              {editingId === maneuver.id ? (
                <div className="space-y-4">
                  <Input value={editForm?.name || ''} onChange={(e) => setEditForm((prev) => (prev ? { ...prev, name: e.target.value } : prev))} className="bg-background border-white/10" />
                  <textarea value={editForm?.description || ''} onChange={(e) => setEditForm((prev) => (prev ? { ...prev, description: e.target.value } : prev))} className="w-full px-3 py-2 rounded border border-white/10 bg-background text-foreground text-sm resize-none h-20" />
                  <Input value={editForm?.youtubeUrl || ''} onChange={(e) => setEditForm((prev) => (prev ? { ...prev, youtubeUrl: convertYoutubeUrl(e.target.value) } : prev))} className="bg-background border-white/10" />
                  <textarea value={editForm?.tips || ''} onChange={(e) => setEditForm((prev) => (prev ? { ...prev, tips: e.target.value } : prev))} className="w-full px-3 py-2 rounded border border-white/10 bg-background text-foreground text-sm resize-none h-24" />
                  <div className="flex gap-2">
                    <Button onClick={saveEdit} className="flex-1 bg-neon-lime text-background hover:bg-neon-lime/90 gap-2">
                      <Save className="w-4 h-4" />
                      Guardar
                    </Button>
                    <Button onClick={() => { setEditingId(null); setEditForm(null) }} variant="outline" className="flex-1">
                      <X className="w-4 h-4" />
                      Cancelar
                    </Button>
                  </div>
                </div>
              ) : (
                <div>
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="font-[var(--font-display)] text-xl text-foreground">{maneuver.name}</h3>
                      <p className="text-sm text-muted-foreground">Nivel {maneuver.level}</p>
                    </div>
                    <div className="flex gap-2">
                      <Button onClick={() => startEdit(maneuver)} className="bg-neon-magenta text-background hover:bg-neon-magenta/90 gap-2">
                        <Edit2 className="w-4 h-4" />
                        Editar
                      </Button>
                      <Button
                        onClick={() => {
                          setManeuvers((prev) => prev.filter((m) => m.id !== maneuver.id))
                          const supabase = createClient()
                          void supabase.from('surf_maneuvers').delete().eq('id', maneuver.id)
                        }}
                        variant="destructive"
                        size="icon"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>

                  <p className="text-sm text-muted-foreground mb-4">{maneuver.description}</p>
                  {maneuver.youtubeUrl && (
                    <div className="relative w-full bg-black rounded-lg overflow-hidden mb-4" style={{ paddingBottom: '56.25%' }}>
                      <iframe className="absolute top-0 left-0 w-full h-full border-0" src={maneuver.youtubeUrl} title={maneuver.name} allowFullScreen />
                    </div>
                  )}
                  {maneuver.tips && (
                    <div className="bg-background/50 border border-neon-lime/20 rounded-lg p-3">
                      <p className="text-xs text-neon-lime font-medium mb-1">Tips Asignados:</p>
                      <p className="text-sm text-muted-foreground">{maneuver.tips}</p>
                    </div>
                  )}
                </div>
              )}
            </Card>
          ))}
        </div>
      </div>
    </div>
  )
}
