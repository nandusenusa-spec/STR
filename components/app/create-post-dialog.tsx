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
import { Upload, Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import {
  enrichRowsWithUsers,
  fetchProfilesByIds,
} from '@/lib/supabase/enrich-profiles'

interface CreatePostDialogProps {
  userId: string
  onPostCreated: (post: any) => void
}

export default function CreatePostDialog({ userId, onPostCreated }: CreatePostDialogProps) {
  const supabase = createClient()
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [postType, setPostType] = useState<'image' | 'video' | 'story' | 'reel'>('image')
  const [caption, setCaption] = useState('')
  const [file, setFile] = useState<File | null>(null)
  const [preview, setPreview] = useState<string | null>(null)

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0]
    if (selectedFile) {
      setFile(selectedFile)
      const reader = new FileReader()
      reader.onloadend = () => {
        setPreview(reader.result as string)
      }
      reader.readAsDataURL(selectedFile)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!file) {
      toast.error('Por favor selecciona un archivo')
      return
    }

    setLoading(true)
    try {
      // Upload file to storage
      const fileExt = file.name.split('.').pop()
      const fileName = `${Date.now()}.${fileExt}`
      const filePath = `social-posts/${userId}/${fileName}`

      const { error: uploadError } = await supabase.storage
        .from('media')
        .upload(filePath, file)

      if (uploadError) throw uploadError

      // Get public URL
      const {
        data: { publicUrl },
      } = supabase.storage.from('media').getPublicUrl(filePath)

      // Create post record
      const { data: post, error: postError } = await supabase
        .from('social_posts')
        .insert([
          {
            user_id: userId,
            post_type: postType,
            caption: caption || null,
            media_url: publicUrl,
            thumbnail_url: postType === 'story' ? publicUrl : null,
            status: 'published',
          },
        ])
        .select('*')
        .single()

      if (postError) throw postError

      const profileMap = await fetchProfilesByIds(supabase, [userId])
      const [withUser] = enrichRowsWithUsers([{ ...post, user_id: userId }], profileMap)

      toast.success('¡Post publicado exitosamente!')
      onPostCreated(withUser)
      setOpen(false)
      setCaption('')
      setFile(null)
      setPreview(null)
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
          <Upload className="w-4 h-4 mr-2" />
          Compartir contenido
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Crear nuevo post</DialogTitle>
          <DialogDescription>
            Comparte fotos, videos, stories o reels con la comunidad
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Post Type */}
          <div className="space-y-2">
            <Label htmlFor="post-type">Tipo de contenido</Label>
            <Select value={postType} onValueChange={(val: any) => setPostType(val)}>
              <SelectTrigger id="post-type">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="image">Foto</SelectItem>
                <SelectItem value="video">Video</SelectItem>
                <SelectItem value="story">Story (24h)</SelectItem>
                <SelectItem value="reel">Reel</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* File Upload */}
          <div className="space-y-2">
            <Label htmlFor="file">Selecciona un archivo</Label>
            <div className="border-2 border-dashed border-border rounded-lg p-6 text-center cursor-pointer hover:border-primary transition-colors">
              <input
                id="file"
                type="file"
                accept={postType === 'video' ? 'video/*' : 'image/*'}
                onChange={handleFileChange}
                className="hidden"
              />
              {preview ? (
                <div className="space-y-2">
                  <img src={preview} alt="Preview" className="w-full h-40 object-cover rounded" />
                  <p className="text-sm text-muted-foreground">{file?.name}</p>
                </div>
              ) : (
                <div className="space-y-2" onClick={() => document.getElementById('file')?.click()}>
                  <Upload className="w-8 h-8 mx-auto text-muted-foreground" />
                  <p className="text-sm font-medium">Clic para cargar</p>
                  <p className="text-xs text-muted-foreground">
                    {postType === 'video' ? 'MP4, WebM' : 'JPG, PNG, GIF'}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Caption */}
          <div className="space-y-2">
            <Label htmlFor="caption">Descripción (opcional)</Label>
            <Textarea
              id="caption"
              value={caption}
              onChange={(e) => setCaption(e.target.value)}
              placeholder="Cuenta una historia sobre tu sesión..."
              rows={3}
            />
          </div>

          {/* Submit */}
          <Button type="submit" disabled={loading || !file} className="w-full">
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
