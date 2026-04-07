'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Plus, Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import {
  enrichRowsWithUsers,
  fetchProfilesByIds,
} from '@/lib/supabase/enrich-profiles'

const categories = [
  { id: 'general', name: 'General' },
  { id: 'tips', name: 'Tips & Trucos' },
  { id: 'spots', name: 'Spots' },
  { id: 'equipo', name: 'Equipo' },
]

/** UI tab id → forum_categories.slug (seeded in SQL) */
const FORUM_SLUG_BY_UI_ID: Record<string, string> = {
  general: 'general',
  tips: 'tecnica',
  spots: 'spots',
  equipo: 'equipamiento',
}

interface CreatePostDialogProps {
  userId: string
  onPostCreated: (post: any) => void
  /** Foro de un espacio: categoría única (omitir selector) */
  fixedCategoryId?: string
}

export default function CreatePostDialog({
  userId,
  onPostCreated,
  fixedCategoryId,
}: CreatePostDialogProps) {
  const supabase = createClient()
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [category, setCategory] = useState('general')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!title.trim() || !content.trim()) {
      toast.error('Por favor completa título y contenido')
      return
    }

    setLoading(true)
    try {
      let categoryId: string | undefined = fixedCategoryId

      if (!categoryId) {
        const slug = FORUM_SLUG_BY_UI_ID[category] || category
        const { data: categoryData } = await supabase
          .from('forum_categories')
          .select('id')
          .eq('slug', slug)
          .single()
        categoryId = categoryData?.id
      }

      if (!categoryId) {
        toast.error('Categoría no encontrada')
        setLoading(false)
        return
      }

      // Create post
      const { data: post, error } = await supabase
        .from('forum_posts')
        .insert([
          {
            user_id: userId,
            category_id: categoryId,
            title: title.trim(),
            content: content.trim(),
          },
        ])
        .select('*')
        .single()

      if (error) throw error

      const { data: cat } = await supabase
        .from('forum_categories')
        .select('id, name')
        .eq('id', categoryId)
        .single()

      const profileMap = await fetchProfilesByIds(supabase, [userId])
      const withUser = enrichRowsWithUsers([{ ...post, user_id: userId }], profileMap)[0]

      toast.success('¡Post creado exitosamente!')
      onPostCreated({ ...withUser, category: cat })
      setOpen(false)
      setTitle('')
      setContent('')
      setCategory('general')
    } catch (error: any) {
      toast.error(error.message || 'Error al crear el post')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="lg" className="w-full">
          <Plus className="w-4 h-4 mr-2" />
          Crear nuevo post
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Crear nuevo post</DialogTitle>
          <DialogDescription>
            Comparte tu pregunta, tip o experiencia con la comunidad
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {!fixedCategoryId && (
            <div className="space-y-2">
              <Label htmlFor="category">Categoría</Label>
              <Select value={category} onValueChange={setCategory}>
                <SelectTrigger id="category">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((cat) => (
                    <SelectItem key={cat.id} value={cat.id}>
                      {cat.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {/* Title */}
          <div className="space-y-2">
            <Label htmlFor="title">Título</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="¿Cuál es tu pregunta o tema?"
              maxLength={200}
            />
            <p className="text-xs text-muted-foreground">
              {title.length}/200
            </p>
          </div>

          {/* Content */}
          <div className="space-y-2">
            <Label htmlFor="content">Contenido</Label>
            <Textarea
              id="content"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Desarrolla tu idea aquí..."
              rows={5}
            />
          </div>

          {/* Submit */}
          <Button type="submit" disabled={loading} className="w-full">
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Publicando...
              </>
            ) : (
              'Publicar'
            )}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  )
}
