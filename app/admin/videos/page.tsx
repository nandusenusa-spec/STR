'use client'

import { useEffect, useState } from 'react'
import { Video, Plus, Trash2, Edit, Eye, EyeOff, Link as LinkIcon } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { createClient } from '@/lib/supabase/client'

interface VideoItem {
  id: string
  title: string
  url: string
  category: string
  visible: boolean
}

const initialVideos: VideoItem[] = [
  { id: '1', title: 'Tecnica de Surf Basica', url: 'https://youtube.com/watch?v=abc123', category: 'Surf', visible: true },
  { id: '2', title: 'Trucos de Skate', url: 'https://youtube.com/watch?v=def456', category: 'Skate', visible: true },
  { id: '3', title: 'Warm Up Pre-Surf', url: 'https://youtube.com/watch?v=ghi789', category: 'Surf', visible: false },
]

export default function AdminVideosPage() {
  const [videos, setVideos] = useState<VideoItem[]>(initialVideos)
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [formData, setFormData] = useState({ title: '', url: '', category: 'Surf' })

  useEffect(() => {
    const load = async () => {
      const supabase = createClient()
      const { data } = await supabase
        .from('admin_videos')
        .select('*')
        .order('created_at', { ascending: false })
      if (!data || data.length === 0) return
      setVideos(
        data.map((v) => ({
          id: v.id,
          title: v.title,
          url: v.url,
          category: v.category || 'Surf',
          visible: !!v.visible,
        })),
      )
    }
    load()
  }, [])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const supabase = createClient()
    if (editingId) {
      setVideos(videos.map(v => v.id === editingId ? { ...v, ...formData } : v))
      void supabase.from('admin_videos').update({ ...formData }).eq('id', editingId)
      setEditingId(null)
    } else {
      const optimisticId = Date.now().toString()
      setVideos([...videos, { ...formData, id: optimisticId, visible: true }])
      void supabase
        .from('admin_videos')
        .insert({ ...formData, visible: true })
        .select('id')
        .single()
        .then(({ data }) => {
          if (!data?.id) return
          setVideos((prev) => prev.map((v) => (v.id === optimisticId ? { ...v, id: data.id } : v)))
        })
    }
    setFormData({ title: '', url: '', category: 'Surf' })
    setShowForm(false)
  }

  const handleEdit = (video: VideoItem) => {
    setFormData({ title: video.title, url: video.url, category: video.category })
    setEditingId(video.id)
    setShowForm(true)
  }

  const handleDelete = (id: string) => {
    setVideos(videos.filter(v => v.id !== id))
    const supabase = createClient()
    void supabase.from('admin_videos').delete().eq('id', id)
  }

  const toggleVisibility = (id: string) => {
    const next = videos.map(v => v.id === id ? { ...v, visible: !v.visible } : v)
    setVideos(next)
    const changed = next.find((v) => v.id === id)
    if (changed) {
      const supabase = createClient()
      void supabase.from('admin_videos').update({ visible: changed.visible }).eq('id', id)
    }
  }

  return (
    <div className="p-6 lg:p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Videos</h1>
          <p className="text-muted-foreground mt-1">Gestiona los videos de la comunidad</p>
        </div>
        <Button 
          onClick={() => { setShowForm(!showForm); setEditingId(null); setFormData({ title: '', url: '', category: 'Surf' }) }}
          className="bg-primary text-background hover:bg-primary/80"
        >
          <Plus className="w-4 h-4 mr-2" />
          Agregar Video
        </Button>
      </div>

      {showForm && (
        <Card className="mb-8 border-primary/30 bg-card/50">
          <CardHeader>
            <CardTitle>{editingId ? 'Editar Video' : 'Nuevo Video'}</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Input
                  placeholder="Titulo del video"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  required
                />
                <Input
                  placeholder="URL del video (YouTube, Vimeo)"
                  value={formData.url}
                  onChange={(e) => setFormData({ ...formData, url: e.target.value })}
                  required
                />
                <select
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className="px-3 py-2 rounded-md bg-background border border-input text-foreground"
                >
                  <option value="Surf">Surf</option>
                  <option value="Skate">Skate</option>
                  <option value="Fitness">Fitness</option>
                  <option value="Otro">Otro</option>
                </select>
              </div>
              <div className="flex gap-2">
                <Button type="submit" className="bg-primary text-background hover:bg-primary/80">
                  {editingId ? 'Guardar Cambios' : 'Agregar'}
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
        {videos.map((video) => (
          <Card key={video.id} className={`border-white/10 ${!video.visible ? 'opacity-50' : ''}`}>
            <CardContent className="flex items-center justify-between p-4">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-lg bg-primary/20 flex items-center justify-center">
                  <Video className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <h3 className="font-medium text-foreground">{video.title}</h3>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <span className="px-2 py-0.5 rounded bg-primary/20 text-primary text-xs">{video.category}</span>
                    <LinkIcon className="w-3 h-3" />
                    <span className="truncate max-w-[200px]">{video.url}</span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Button size="icon" variant="ghost" onClick={() => toggleVisibility(video.id)}>
                  {video.visible ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                </Button>
                <Button size="icon" variant="ghost" onClick={() => handleEdit(video)}>
                  <Edit className="w-4 h-4" />
                </Button>
                <Button size="icon" variant="ghost" className="text-destructive" onClick={() => handleDelete(video.id)}>
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {videos.length === 0 && (
        <div className="text-center py-12 text-muted-foreground">
          <Video className="w-12 h-12 mx-auto mb-4 opacity-50" />
          <p>No hay videos. Agrega el primero.</p>
        </div>
      )}
    </div>
  )
}
