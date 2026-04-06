'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Heart, MessageCircle, Share2, Image as ImageIcon, Video, Eye } from 'lucide-react'
import CreatePostDialog from '@/components/app/create-post-dialog'
import { SocialPost } from '@/lib/types'
import Link from 'next/link'
import {
  enrichRowsWithUsers,
  fetchProfilesByIds,
} from '@/lib/supabase/enrich-profiles'

export default function FeedPage() {
  const supabase = createClient()
  const [posts, setPosts] = useState<SocialPost[]>([])
  const [loading, setLoading] = useState(true)
  const [user, setUser] = useState<any>(null)
  const [postType, setPostType] = useState<'all' | 'image' | 'video' | 'story' | 'reel'>('all')

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

  // Load posts
  useEffect(() => {
    const loadPosts = async () => {
      setLoading(true)
      let query = supabase
        .from('social_posts')
        .select('*')
        .eq('status', 'published')
        .order('created_at', { ascending: false })

      if (postType !== 'all') {
        query = query.eq('post_type', postType)
      }

      const { data, error } = await query.limit(50)

      if (!error && data?.length) {
        const profileMap = await fetchProfilesByIds(
          supabase,
          data.map((p) => p.user_id),
        )
        setPosts(enrichRowsWithUsers(data, profileMap) as unknown as SocialPost[])
      } else if (!error) {
        setPosts([])
      }
      setLoading(false)
    }

    loadPosts()

    // Subscribe to new posts
    const subscription = supabase
      .channel('social:posts')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'social_posts',
          filter: `status=eq.published`,
        },
        async (payload) => {
          const row = payload.new as { id: string; user_id: string }
          const profileMap = await fetchProfilesByIds(supabase, [row.user_id])
          const [enriched] = enrichRowsWithUsers([row as { user_id: string }], profileMap)
          setPosts((prev) =>
            prev.some((p) => p.id === row.id)
              ? prev
              : [enriched as unknown as SocialPost, ...prev],
          )
        }
      )
      .subscribe()

    return () => {
      subscription.unsubscribe()
    }
  }, [postType, supabase])

  return (
    <div className="max-w-2xl mx-auto p-4 space-y-6">
      {/* Header */}
      <div className="space-y-4">
        <h1 className="text-3xl font-bold">Feed Social</h1>
        <p className="text-muted-foreground">
          Comparte tus momentos con la comunidad STR
        </p>
      </div>

      {/* Create Post CTA */}
      {user && <CreatePostDialog userId={user.id} onPostCreated={(post) => setPosts([post, ...posts])} />}

      {/* Tabs */}
      <Tabs value={postType} onValueChange={(val) => setPostType(val as any)}>
        <TabsList className="w-full justify-start">
          <TabsTrigger value="all">Todo</TabsTrigger>
          <TabsTrigger value="image">Fotos</TabsTrigger>
          <TabsTrigger value="video">Videos</TabsTrigger>
          <TabsTrigger value="story">Stories</TabsTrigger>
          <TabsTrigger value="reel">Reels</TabsTrigger>
        </TabsList>

        <TabsContent value={postType} className="mt-6 space-y-4">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <p className="text-muted-foreground">Cargando posts...</p>
            </div>
          ) : posts.length === 0 ? (
            <div className="flex items-center justify-center py-12">
              <p className="text-muted-foreground">No hay posts aún</p>
            </div>
          ) : (
            posts.map((post) => <SocialPostCard key={post.id} post={post} />)
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}

function SocialPostCard({ post }: { post: SocialPost }) {
  const displayName =
    post.user?.user_profile?.full_name || post.user?.email?.split('@')[0] || 'Usuario'
  const avatar = post.user?.user_profile?.avatar_url
  const initials = displayName
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()

  const icon =
    post.post_type === 'video'
      ? Video
      : post.post_type === 'reel'
        ? Video
        : post.post_type === 'story'
          ? Eye
          : ImageIcon

  const Icon = icon

  return (
    <Card className="overflow-hidden hover:shadow-lg transition-shadow">
      {/* Header */}
      <CardHeader className="pb-3">
        <div className="flex items-center gap-3">
          <Avatar className="w-10 h-10">
            <AvatarImage src={avatar || undefined} alt={displayName} />
            <AvatarFallback className="text-xs">{initials}</AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <p className="font-semibold text-sm">{displayName}</p>
            <p className="text-xs text-muted-foreground">
              {post.user?.user_profile?.discipline?.toUpperCase()}
            </p>
          </div>
          <div className="flex items-center gap-1 px-2 py-1 rounded-full bg-muted">
            <Icon className="w-3 h-3 text-muted-foreground" />
            <span className="text-xs text-muted-foreground capitalize">
              {post.post_type}
            </span>
          </div>
        </div>
      </CardHeader>

      {/* Media */}
      <div className="relative w-full aspect-square bg-muted overflow-hidden">
        <img
          src={post.thumbnail_url || post.media_url}
          alt={post.caption || 'Post'}
          className="w-full h-full object-cover"
        />
        {post.is_featured && (
          <div className="absolute top-2 right-2 px-2 py-1 rounded-full bg-accent/90 text-accent-foreground text-xs font-semibold">
            Destacado
          </div>
        )}
      </div>

      {/* Caption */}
      {post.caption && (
        <CardContent className="pt-3">
          <p className="text-sm">{post.caption}</p>
        </CardContent>
      )}

      {/* Actions */}
      <CardContent className="flex items-center gap-4 pt-3 border-t border-border">
        <Button variant="ghost" size="sm" className="gap-2 flex-1">
          <Heart className="w-4 h-4" />
          <span className="text-xs">{post.likes_count}</span>
        </Button>
        <Button variant="ghost" size="sm" className="gap-2 flex-1">
          <MessageCircle className="w-4 h-4" />
          <span className="text-xs">{post.comments_count}</span>
        </Button>
        <Button variant="ghost" size="sm" className="gap-2 flex-1">
          <Share2 className="w-4 h-4" />
        </Button>
      </CardContent>
    </Card>
  )
}
