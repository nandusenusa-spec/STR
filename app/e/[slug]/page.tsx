import Link from 'next/link'
import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import { createClient } from '@/lib/supabase/server'
import { SpaceJoinButton } from '@/components/spaces/space-join-button'
import { SpaceInvitePanel } from '@/components/spaces/space-invite-panel'
import type { Space } from '@/lib/types'

type Props = { params: Promise<{ slug: string }> }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const supabase = await createClient()
  const { data: space } = await supabase.from('spaces').select('name').eq('slug', slug).maybeSingle()
  if (!space) return { title: 'Espacio | STR' }
  return { title: `${(space as { name: string }).name} | STR` }
}

export default async function EspacioPublicPage({ params }: Props) {
  const { slug } = await params
  const supabase = await createClient()

  const { data: spaceRow, error: spaceError } = await supabase
    .from('spaces')
    .select('*')
    .eq('slug', slug)
    .maybeSingle()

  if (spaceError) {
    console.error('[e/[slug]] spaces', spaceError.message)
    notFound()
  }
  if (!spaceRow) {
    notFound()
  }

  const space = spaceRow as Space

  const {
    data: { user },
  } = await supabase.auth.getUser()

  let isMember = false
  let memberCount: number | null = null

  if (user) {
    const { data: mem } = await supabase
      .from('space_members')
      .select('id')
      .eq('space_id', space.id)
      .eq('user_id', user.id)
      .maybeSingle()
    isMember = !!mem

    if (isMember) {
      const { count } = await supabase
        .from('space_members')
        .select('id', { count: 'exact', head: true })
        .eq('space_id', space.id)
      memberCount = count ?? null
    }
  }

  const isOwner = user?.id === space.owner_id

  return (
    <div className="mx-auto max-w-3xl px-4 py-12 sm:py-16">
      <p className="text-xs font-mono text-neon-magenta tracking-wider mb-3">ESPACIO</p>
      <h1 className="font-[var(--font-display)] text-4xl sm:text-6xl mb-4">{space.name}</h1>
      {space.description && (
        <p className="text-lg text-muted-foreground mb-8 whitespace-pre-wrap">{space.description}</p>
      )}

      <div className="flex flex-wrap gap-3 text-sm text-muted-foreground mb-10">
        <span
          className={`px-3 py-1 rounded-full border ${space.is_public ? 'border-neon-lime/40 text-neon-lime' : 'border-border'}`}
        >
          {space.is_public ? 'Público' : 'Privado'}
        </span>
        {memberCount !== null && (
          <span className="px-3 py-1 rounded-full border border-white/10">
            {memberCount} {memberCount === 1 ? 'miembro' : 'miembros'}
          </span>
        )}
        {isOwner && (
          <span className="px-3 py-1 rounded-full border border-neon-cyan/40 text-neon-cyan">Sos el dueño</span>
        )}
      </div>

      {isOwner && (
        <div className="mb-8">
          <SpaceInvitePanel
            spaceId={space.id}
            slug={space.slug}
            initialInviteEnabled={Boolean(space.invite_enabled)}
            initialInviteCode={space.invite_code ?? null}
          />
        </div>
      )}

      <div className="rounded-2xl border border-white/10 bg-card/30 p-6 sm:p-8 mb-8">
        <h2 className="font-[var(--font-display)] text-xl mb-4">Participar</h2>
        <SpaceJoinButton
          spaceId={space.id}
          slug={space.slug}
          isPublic={space.is_public}
          isMember={isMember}
          isLoggedIn={!!user}
        />
      </div>

      <p className="text-xs text-muted-foreground font-mono mb-6">
        Compartí: <span className="text-foreground">/e/{space.slug}</span>
        {space.invite_enabled && space.invite_code && (
          <span className="block mt-1">
            Con invitación:{' '}
            <span className="text-neon-cyan">
              …/e/{space.slug}?invite={space.invite_code}
            </span>
          </span>
        )}
      </p>

      <div className="rounded-xl border border-white/5 bg-card/20 p-4 text-sm text-muted-foreground space-y-2">
        <p>
          <strong className="text-foreground">Fase 3:</strong> feed, foros y chat por espacio:{' '}
          <Link href={`/e/${space.slug}/feed`} className="text-neon-cyan hover:underline">
            Feed
          </Link>
          {' · '}
          <Link href={`/e/${space.slug}/forums`} className="text-neon-cyan hover:underline">
            Foros
          </Link>
          {' · '}
          <Link href={`/e/${space.slug}/chat`} className="text-neon-cyan hover:underline">
            Chat
          </Link>
          . La comunidad global sigue en{' '}
          <Link href="/app" className="text-neon-cyan hover:underline">
            /app
          </Link>
          .
        </p>
      </div>
    </div>
  )
}
