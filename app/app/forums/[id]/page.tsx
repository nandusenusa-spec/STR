'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useParams } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { MessageCircle, Send, ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import { formatDistanceToNow } from 'date-fns'
import { es } from 'date-fns/locale'
import { toast } from 'sonner'
import {
  enrichRowsWithUsers,
  fetchProfilesByIds,
} from '@/lib/supabase/enrich-profiles'

export default function ForumPostPage() {
  const params = useParams()
  const postId = params.id as string
  const supabase = createClient()

  const [post, setPost] = useState<any>(null)
  const [replies, setReplies] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [replyContent, setReplyContent] = useState('')
  const [user, setUser] = useState<any>(null)
  const [submitting, setSubmitting] = useState(false)

  // Get current user
  useEffect(() => {
    const getUser = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      setUser(user)
    }
    getUser()
  }, [supabase])

  // Load post and replies
  useEffect(() => {
    const loadPost = async () => {
      setLoading(true)

      const { data: postData, error: postError } = await supabase
        .from('forum_posts')
        .select('*')
        .eq('id', postId)
        .single()

      if (postError) {
        toast.error('Post no encontrado')
        return
      }

      const postProfileMap = await fetchProfilesByIds(supabase, [postData.user_id])
      const [postEnriched] = enrichRowsWithUsers([postData], postProfileMap)
      setPost(postEnriched)

      const { data: repliesData } = await supabase
        .from('forum_replies')
        .select('*')
        .eq('post_id', postId)
        .order('created_at', { ascending: true })

      if (repliesData?.length) {
        const replyMap = await fetchProfilesByIds(
          supabase,
          repliesData.map((r) => r.user_id),
        )
        setReplies(enrichRowsWithUsers(repliesData, replyMap))
      } else {
        setReplies([])
      }
      setLoading(false)
    }

    loadPost()

    // Subscribe to new replies
    const subscription = supabase
      .channel(`forum:${postId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'forum_replies',
          filter: `post_id=eq.${postId}`,
        },
        async (payload) => {
          const row = payload.new as { id: string; user_id: string }
          const profileMap = await fetchProfilesByIds(supabase, [row.user_id])
          const [e] = enrichRowsWithUsers([row as { user_id: string }], profileMap)
          setReplies((prev) => (prev.some((r) => r.id === row.id) ? prev : [...prev, e]))
        }
      )
      .subscribe()

    return () => {
      subscription.unsubscribe()
    }
  }, [postId, supabase])

  const handleSubmitReply = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!replyContent.trim() || !user) return

    setSubmitting(true)
    try {
      const { data: inserted, error } = await supabase
        .from('forum_replies')
        .insert([
          {
            post_id: postId,
            user_id: user.id,
            content: replyContent,
          },
        ])
        .select()
        .single()

      if (error) throw error

      if (inserted) {
        const map = await fetchProfilesByIds(supabase, [user.id])
        const [e] = enrichRowsWithUsers([inserted], map)
        setReplies((prev) => (prev.some((r) => r.id === e.id) ? prev : [...prev, e]))
      }

      setPost((p: any) =>
        p ? { ...p, replies_count: (p.replies_count ?? 0) + 1 } : p,
      )

      setReplyContent('')
      toast.success('¡Respuesta añadida!')
    } catch (error: any) {
      toast.error(error.message)
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="max-w-2xl mx-auto p-8">
        <p className="text-muted-foreground">Cargando...</p>
      </div>
    )
  }

  if (!post) {
    return (
      <div className="max-w-2xl mx-auto p-8 space-y-4">
        <p className="text-muted-foreground">Post no encontrado</p>
        <Button asChild variant="outline">
          <Link href="/app/forums">Volver a foros</Link>
        </Button>
      </div>
    )
  }

  const displayName =
    post.user?.user_profile?.full_name || post.user?.email?.split('@')[0] || 'Usuario'
  const avatar = post.user?.user_profile?.avatar_url
  const initials = displayName
    .split(' ')
    .map((n: string) => n[0])
    .join('')
    .toUpperCase()

  return (
    <div className="max-w-2xl mx-auto p-4 space-y-6">
      {/* Back Button */}
      <Button variant="ghost" size="sm" asChild className="gap-2">
        <Link href="/app/forums">
          <ArrowLeft className="w-4 h-4" />
          Volver a foros
        </Link>
      </Button>

      {/* Post */}
      <Card>
        <CardHeader className="space-y-4">
          <div>
            <h1 className="text-3xl font-bold mb-2">{post.title}</h1>
            <div className="flex items-center gap-3">
              <Avatar className="w-8 h-8">
                <AvatarImage src={avatar || undefined} alt={displayName} />
                <AvatarFallback className="text-xs">{initials}</AvatarFallback>
              </Avatar>
              <div className="text-sm">
                <p className="font-semibold">{displayName}</p>
                <p className="text-muted-foreground">
                  {formatDistanceToNow(new Date(post.created_at), {
                    addSuffix: true,
                    locale: es,
                  })}
                </p>
              </div>
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          <p className="text-lg whitespace-pre-wrap">{post.content}</p>

          <div className="flex items-center gap-4 pt-4 border-t border-border text-sm text-muted-foreground">
            <div className="flex items-center gap-1">
              <MessageCircle className="w-4 h-4" />
              <span>{post.replies_count || 0} respuestas</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Replies */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold">
          {replies.length} {replies.length === 1 ? 'Respuesta' : 'Respuestas'}
        </h2>

        {replies.map((reply) => {
          const replyDisplayName =
            reply.user?.user_profile?.full_name || reply.user?.email?.split('@')[0] || 'Usuario'
          const replyAvatar = reply.user?.user_profile?.avatar_url
          const replyInitials = replyDisplayName
            .split(' ')
            .map((n: string) => n[0])
            .join('')
            .toUpperCase()

          return (
            <Card key={reply.id}>
              <CardContent className="pt-6">
                <div className="flex gap-3">
                  <Avatar className="w-8 h-8 flex-shrink-0">
                    <AvatarImage src={replyAvatar || undefined} alt={replyDisplayName} />
                    <AvatarFallback className="text-xs">{replyInitials}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <div className="flex items-baseline gap-2">
                      <p className="font-semibold text-sm">{replyDisplayName}</p>
                      <p className="text-xs text-muted-foreground">
                        {formatDistanceToNow(new Date(reply.created_at), {
                          addSuffix: true,
                          locale: es,
                        })}
                      </p>
                    </div>
                    <p className="text-sm mt-2 whitespace-pre-wrap">{reply.content}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Reply Form */}
      {user && (
        <Card>
          <CardContent className="pt-6">
            <form onSubmit={handleSubmitReply} className="space-y-4">
              <Textarea
                value={replyContent}
                onChange={(e) => setReplyContent(e.target.value)}
                placeholder="Escribe tu respuesta..."
                rows={4}
              />
              <Button type="submit" disabled={submitting || !replyContent.trim()} className="gap-2">
                <Send className="w-4 h-4" />
                {submitting ? 'Enviando...' : 'Responder'}
              </Button>
            </form>
          </CardContent>
        </Card>
      )}

      {!user && (
        <Card>
          <CardContent className="p-6 text-center">
            <p className="text-muted-foreground mb-4">Inicia sesión para responder</p>
            <Button asChild>
              <Link href={`/auth/login?redirect=${encodeURIComponent(`/app/forums/${postId}`)}`}>
                Ir a login
              </Link>
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
