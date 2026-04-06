'use client'

import { useEffect, useState } from 'react'
import { Link as LinkIcon, Plus, Trash2, Edit, ExternalLink, GripVertical } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { createClient } from '@/lib/supabase/client'

interface LinkItem {
  id: string
  title: string
  url: string
  icon: string
}

const initialLinks: LinkItem[] = [
  { id: '1', title: 'Instagram', url: 'https://instagram.com/comunidad', icon: 'instagram' },
  { id: '2', title: 'WhatsApp', url: 'https://wa.me/598123456', icon: 'whatsapp' },
  { id: '3', title: 'YouTube', url: 'https://youtube.com/@comunidad', icon: 'youtube' },
  { id: '4', title: 'TikTok', url: 'https://tiktok.com/@comunidad', icon: 'tiktok' },
]

export default function AdminLinksPage() {
  const [links, setLinks] = useState<LinkItem[]>(initialLinks)
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [formData, setFormData] = useState({ title: '', url: '', icon: 'link' })

  useEffect(() => {
    const load = async () => {
      const supabase = createClient()
      const { data } = await supabase
        .from('admin_links')
        .select('*')
        .order('display_order', { ascending: true })
      if (!data || data.length === 0) return
      setLinks(
        data.map((l) => ({
          id: l.id,
          title: l.title,
          url: l.url,
          icon: l.icon || 'link',
        })),
      )
    }
    load()
  }, [])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const supabase = createClient()
    if (editingId) {
      setLinks(links.map(l => l.id === editingId ? { ...l, ...formData } : l))
      void supabase.from('admin_links').update({ ...formData }).eq('id', editingId)
      setEditingId(null)
    } else {
      const optimisticId = Date.now().toString()
      setLinks([...links, { ...formData, id: optimisticId }])
      void supabase
        .from('admin_links')
        .insert({
          ...formData,
          display_order: links.length,
          is_active: true,
        })
        .select('id')
        .single()
        .then(({ data }) => {
          if (!data?.id) return
          setLinks((prev) => prev.map((l) => (l.id === optimisticId ? { ...l, id: data.id } : l)))
        })
    }
    setFormData({ title: '', url: '', icon: 'link' })
    setShowForm(false)
  }

  const handleEdit = (link: LinkItem) => {
    setFormData({ title: link.title, url: link.url, icon: link.icon })
    setEditingId(link.id)
    setShowForm(true)
  }

  const handleDelete = (id: string) => {
    setLinks(links.filter(l => l.id !== id))
    const supabase = createClient()
    void supabase.from('admin_links').delete().eq('id', id)
  }

  return (
    <div className="p-6 lg:p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Links</h1>
          <p className="text-muted-foreground mt-1">Gestiona los links de redes sociales</p>
        </div>
        <Button 
          onClick={() => { setShowForm(!showForm); setEditingId(null); setFormData({ title: '', url: '', icon: 'link' }) }}
          className="bg-neon-cyan text-background hover:bg-neon-cyan/80"
        >
          <Plus className="w-4 h-4 mr-2" />
          Agregar Link
        </Button>
      </div>

      {showForm && (
        <Card className="mb-8 border-neon-cyan/30 bg-card/50">
          <CardHeader>
            <CardTitle>{editingId ? 'Editar Link' : 'Nuevo Link'}</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Input
                  placeholder="Titulo (ej: Instagram)"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  required
                />
                <Input
                  placeholder="URL completa"
                  value={formData.url}
                  onChange={(e) => setFormData({ ...formData, url: e.target.value })}
                  required
                />
                <select
                  value={formData.icon}
                  onChange={(e) => setFormData({ ...formData, icon: e.target.value })}
                  className="px-3 py-2 rounded-md bg-background border border-input text-foreground"
                >
                  <option value="instagram">Instagram</option>
                  <option value="whatsapp">WhatsApp</option>
                  <option value="youtube">YouTube</option>
                  <option value="tiktok">TikTok</option>
                  <option value="facebook">Facebook</option>
                  <option value="twitter">Twitter/X</option>
                  <option value="link">Link generico</option>
                </select>
              </div>
              <div className="flex gap-2">
                <Button type="submit" className="bg-neon-lime text-background hover:bg-neon-lime/80">
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

      <div className="grid gap-3">
        {links.map((link) => (
          <Card key={link.id} className="border-white/10">
            <CardContent className="flex items-center justify-between p-4">
              <div className="flex items-center gap-4">
                <GripVertical className="w-5 h-5 text-muted-foreground/50 cursor-grab" />
                <div className="w-10 h-10 rounded-lg bg-neon-lime/20 flex items-center justify-center">
                  <LinkIcon className="w-5 h-5 text-neon-lime" />
                </div>
                <div>
                  <h3 className="font-medium text-foreground">{link.title}</h3>
                  <p className="text-sm text-muted-foreground truncate max-w-[300px]">{link.url}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Button size="icon" variant="ghost" asChild>
                  <a href={link.url} target="_blank" rel="noopener noreferrer">
                    <ExternalLink className="w-4 h-4" />
                  </a>
                </Button>
                <Button size="icon" variant="ghost" onClick={() => handleEdit(link)}>
                  <Edit className="w-4 h-4" />
                </Button>
                <Button size="icon" variant="ghost" className="text-destructive" onClick={() => handleDelete(link.id)}>
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
