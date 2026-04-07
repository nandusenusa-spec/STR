import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import ChatClient from '@/components/app/chat-client'

type Props = { params: Promise<{ slug: string }> }

export default async function EspacioChatPage({ params }: Props) {
  const { slug } = await params
  const supabase = await createClient()
  const { data: space } = await supabase.from('spaces').select('id').eq('slug', slug).maybeSingle()
  if (!space) notFound()

  const {
    data: { user },
  } = await supabase.auth.getUser()
  let isMember = false
  if (user) {
    const { data: mem } = await supabase
      .from('space_members')
      .select('id')
      .eq('space_id', space.id)
      .eq('user_id', user.id)
      .maybeSingle()
    isMember = !!mem
  }

  return (
    <div className="mx-auto max-w-4xl py-6 px-4 min-h-[calc(100vh-12rem)]">
      <h1 className="text-xl font-semibold mb-4 font-[var(--font-display)]">Chat del espacio</h1>
      <div className="rounded-xl border border-white/10 overflow-hidden bg-card/20 min-h-[480px]">
        <ChatClient spaceId={space.id} spaceSlug={slug} showComposer={isMember} />
      </div>
    </div>
  )
}
