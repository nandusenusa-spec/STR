import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { blockUnexpectedOrigin } from '@/lib/security/api-origin'
import { applySecurityHeaders } from '@/lib/security/http-headers'
import { PROFANITY_USER_MESSAGE, textContainsProfanity } from '@/lib/moderation/profanity'

const MAX_TITLE = 200
const MAX_CONTENT = 50_000

export async function POST(request: NextRequest) {
  const originBlock = blockUnexpectedOrigin(request)
  if (originBlock) return applySecurityHeaders(originBlock)

  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) {
    return applySecurityHeaders(NextResponse.json({ error: 'No autenticado' }, { status: 401 }))
  }

  let body: { category_id?: string; title?: string; content?: string }
  try {
    body = await request.json()
  } catch {
    return applySecurityHeaders(NextResponse.json({ error: 'JSON inválido' }, { status: 400 }))
  }

  const category_id = typeof body.category_id === 'string' ? body.category_id : ''
  const title = typeof body.title === 'string' ? body.title.trim() : ''
  const content = typeof body.content === 'string' ? body.content.trim() : ''

  if (!category_id || !title || !content) {
    return applySecurityHeaders(
      NextResponse.json({ error: 'Faltan categoría, título o contenido.' }, { status: 400 }),
    )
  }
  if (title.length > MAX_TITLE || content.length > MAX_CONTENT) {
    return applySecurityHeaders(NextResponse.json({ error: 'Texto demasiado largo.' }, { status: 400 }))
  }

  if (textContainsProfanity(title) || textContainsProfanity(content)) {
    return applySecurityHeaders(
      NextResponse.json({ error: PROFANITY_USER_MESSAGE }, { status: 422 }),
    )
  }

  const { data: post, error } = await supabase
    .from('forum_posts')
    .insert({
      user_id: user.id,
      category_id,
      title,
      content,
    })
    .select('*')
    .single()

  if (error || !post) {
    return applySecurityHeaders(
      NextResponse.json(
        { error: error?.message || 'No se pudo crear el post.' },
        { status: 400 },
      ),
    )
  }

  return applySecurityHeaders(NextResponse.json({ ok: true, post }))
}
