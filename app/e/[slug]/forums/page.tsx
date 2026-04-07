import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import ForumsClient from '@/components/app/forums-client'

type Props = { params: Promise<{ slug: string }> }

export default async function EspacioForumsPage({ params }: Props) {
  const { slug } = await params
  const supabase = await createClient()
  const { data: space } = await supabase.from('spaces').select('id, name').eq('slug', slug).maybeSingle()
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
    <div className="mx-auto max-w-4xl py-6 px-4">
      <ForumsClient
        spaceId={space.id}
        spaceSlug={slug}
        title={`Foros — ${space.name}`}
        subtitle="Temas y debates solo para miembros de este espacio."
        showComposer={isMember}
      />
    </div>
  )
}
