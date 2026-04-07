'use client'

import { useEffect, useState, useMemo } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { MessageSquare, Eye, Clock, Search } from 'lucide-react'
import Link from 'next/link'
import CreatePostDialog from '@/components/app/forum-create-post'
import {
  enrichRowsWithUsers,
  fetchProfilesByIds,
} from '@/lib/supabase/enrich-profiles'

type ForumCategory = { id: string; name: string; slug: string }

export type ForumsClientProps = {
  spaceId?: string | null
  spaceSlug?: string
  title?: string
  subtitle?: string
  showComposer?: boolean
}

export default function ForumsClient({
  spaceId = null,
  spaceSlug,
  title = 'Foros',
  subtitle = 'Discute, comparte tips y conecta con otros miembros',
  showComposer = true,
}: ForumsClientProps) {
  const supabase = createClient()
  const [posts, setPosts] = useState<any[]>([])
  const [categories, setCategories] = useState<ForumCategory[]>([])
  const [loading, setLoading] = useState(true)
  const [user, setUser] = useState<{ id: string } | null>(null)
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [searchQuery, setSearchQuery] = useState('')

  useEffect(() => {
    void (async () => {
      const {
        data: { user: u },
      } = await supabase.auth.getUser()
      setUser(u)
    })()
  }, [supabase])

  useEffect(() => {
    let cancelled = false

    const run = async () => {
      let catQuery = supabase
        .from('forum_categories')
        .select('id, name, slug')
        .order('sort_order', { ascending: true })

      if (spaceId) {
        catQuery = catQuery.eq('space_id', spaceId)
      } else {
        catQuery = catQuery.is('space_id', null)
      }

      const { data: cats } = await catQuery
      if (cancelled) return
      setCategories(cats || [])

      const categoryIds = (cats || []).map((c) => c.id)

      setLoading(true)
      let query = supabase
        .from('forum_posts')
        .select(
          `
          *,
          category:forum_categories (
            id,
            name
          )
        `,
        )
        .order('created_at', { ascending: false })

      if (categoryIds.length > 0) {
        query = query.in('category_id', categoryIds)
      } else {
        setPosts([])
        setLoading(false)
        return
      }

      if (selectedCategory !== 'all') {
        query = query.eq('category_id', selectedCategory)
      }

      const { data, error } = await query.limit(50)

      if (cancelled) return

      if (error || !data) {
        setPosts([])
        setLoading(false)
        return
      }

      const profileMap = await fetchProfilesByIds(
        supabase,
        data.map((p) => p.user_id),
      )
      const enriched = enrichRowsWithUsers(data, profileMap)
      setPosts(enriched)
      setLoading(false)
    }

    void run()

    const subscription = supabase
      .channel(`forum:posts:${spaceId ?? 'global'}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'forum_posts',
        },
        async (payload) => {
          const row = payload.new as { id: string; user_id: string; category_id: string }
          if (spaceId) {
            const { data: c } = await supabase
              .from('forum_categories')
              .select('space_id')
              .eq('id', row.category_id)
              .maybeSingle()
            if (c?.space_id !== spaceId) return
          } else {
            const { data: c } = await supabase
              .from('forum_categories')
              .select('space_id')
              .eq('id', row.category_id)
              .maybeSingle()
            if (c?.space_id != null) return
          }
          const { data: cat } = await supabase
            .from('forum_categories')
            .select('id, name')
            .eq('id', row.category_id)
            .single()
          const profileMap = await fetchProfilesByIds(supabase, [row.user_id])
          const [e] = enrichRowsWithUsers([row as { user_id: string }], profileMap)
          setPosts((prev) =>
            prev.some((p) => p.id === row.id)
              ? prev
              : [{ ...e, category: cat }, ...prev],
          )
        },
      )
      .subscribe()

    return () => {
      cancelled = true
      subscription.unsubscribe()
    }
  }, [selectedCategory, supabase, spaceId])

  const filteredPosts = useMemo(() => {
    const q = searchQuery.trim().toLowerCase()
    if (!q) return posts
    return posts.filter(
      (p) =>
        (p.title || '').toLowerCase().includes(q) ||
        (p.content || '').toLowerCase().includes(q),
    )
  }, [posts, searchQuery])

  const fixedCategoryId =
    spaceId && categories.length === 1 ? categories[0].id : undefined

  const canPost = Boolean(user && showComposer)

  return (
    <div className="max-w-4xl mx-auto p-4 space-y-6">
      <div className="space-y-4">
        <h1 className="text-3xl font-bold">{title}</h1>
        <p className="text-muted-foreground">{subtitle}</p>
      </div>

      {spaceId && !showComposer && (
        <div className="rounded-lg border border-amber-500/30 bg-amber-500/5 px-4 py-3 text-sm text-muted-foreground">
          Unite al espacio para participar en el foro.
          {spaceSlug && (
            <Link className="block mt-2 text-neon-cyan hover:underline" href={`/e/${spaceSlug}`}>
              Volver al espacio
            </Link>
          )}
        </div>
      )}

      {canPost && user && (
        <CreatePostDialog
          userId={user.id}
          fixedCategoryId={fixedCategoryId}
          onPostCreated={(post) => setPosts([post, ...posts])}
        />
      )}

      <div className="relative">
        <Search className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
        <Input
          placeholder="Buscar en foros..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10"
        />
      </div>

      <Tabs value={selectedCategory} onValueChange={setSelectedCategory}>
        <TabsList className="w-full justify-start flex-wrap h-auto gap-1">
          <TabsTrigger value="all">Todo</TabsTrigger>
          {categories.map((cat) => (
            <TabsTrigger key={cat.id} value={cat.id}>
              {cat.name}
            </TabsTrigger>
          ))}
        </TabsList>

        <TabsContent value={selectedCategory} className="mt-6 space-y-4">
          {loading ? (
            <Card>
              <CardContent className="p-12 text-center">
                <p className="text-muted-foreground">Cargando posts...</p>
              </CardContent>
            </Card>
          ) : filteredPosts.length === 0 ? (
            <Card>
              <CardContent className="p-12 text-center">
                <p className="text-muted-foreground">No hay posts en esta categoría</p>
              </CardContent>
            </Card>
          ) : (
            filteredPosts.map((post) => (
              <Link key={post.id} href={`/app/forums/${post.id}`}>
                <Card className="hover:shadow-lg transition-shadow cursor-pointer">
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 min-w-0 space-y-2">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h3 className="font-semibold text-lg line-clamp-2">{post.title}</h3>
                          {post.is_pinned && (
                            <Badge variant="secondary" className="text-xs">
                              Fijado
                            </Badge>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground line-clamp-2">
                          {post.content}
                        </p>
                      </div>
                      <div className="flex-shrink-0">
                        <Badge variant="outline" className="capitalize">
                          {post.category?.name}
                        </Badge>
                      </div>
                    </div>
                  </CardHeader>

                  <CardContent>
                    <div className="flex items-center justify-between text-sm text-muted-foreground">
                      <div className="flex items-center gap-4">
                        <div className="flex items-center gap-1">
                          <MessageSquare className="w-4 h-4" />
                          <span>{post.replies_count ?? 0} respuestas</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Eye className="w-4 h-4" />
                          <span>
                            {(post.views_count ?? post.view_count ?? 0) as number} vistas
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock className="w-4 h-4" />
                        <span>
                          {new Date(post.created_at).toLocaleDateString('es-ES', {
                            month: 'short',
                            day: 'numeric',
                          })}
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}
