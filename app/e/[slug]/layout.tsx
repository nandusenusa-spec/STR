import Link from 'next/link'
import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { SpaceSubNav } from '@/components/spaces/space-sub-nav'

type Props = { children: React.ReactNode; params: Promise<{ slug: string }> }

export default async function EspacioSlugLayout({ children, params }: Props) {
  const { slug } = await params
  const supabase = await createClient()
  const { data: space } = await supabase.from('spaces').select('id, name').eq('slug', slug).maybeSingle()

  if (!space) {
    notFound()
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="border-b border-white/10">
        <div className="mx-auto max-w-4xl px-4 py-3 flex items-center justify-between">
          <Link href="/" className="text-sm text-muted-foreground hover:text-foreground">
            STR
          </Link>
          <div className="flex items-center gap-3">
            <Link href="/app/espacios" className="text-sm text-neon-cyan hover:underline">
              Mis espacios
            </Link>
          </div>
        </div>
      </div>
      <SpaceSubNav slug={slug} spaceName={space.name} />
      {children}
    </div>
  )
}
