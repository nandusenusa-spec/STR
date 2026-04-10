import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { blockUnexpectedOrigin } from '@/lib/security/api-origin'
import { applySecurityHeaders } from '@/lib/security/http-headers'
import { PROFANITY_USER_MESSAGE, textContainsProfanity } from '@/lib/moderation/profanity'

const MAX_CONTENT = 5_000

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

  let body: { channel_id?: string; content?: string }
  try {
    body = await request.json()
  } catch {
    return applySecurityHeaders(NextResponse.json({ error: 'JSON inválido' }, { status: 400 }))
  }

  const channel_id = typeof body.channel_id === 'string' ? body.channel_id : ''
  const content = typeof body.content === 'string' ? body.content.trim() : ''
  if (!channel_id || !content) {
    return applySecurityHeaders(
      NextResponse.json({ error: 'Falta canal o mensaje.' }, { status: 400 }),
    )
  }
  if (content.length > MAX_CONTENT) {
    return applySecurityHeaders(
      NextResponse.json({ error: 'Mensaje demasiado largo.' }, { status: 400 }),
    )
  }

  if (textContainsProfanity(content)) {
    return applySecurityHeaders(
      NextResponse.json({ error: PROFANITY_USER_MESSAGE }, { status: 422 }),
    )
  }

  const { error } = await supabase.from('chat_messages').insert({
    channel_id,
    user_id: user.id,
    content,
  })

  if (error) {
    return applySecurityHeaders(
      NextResponse.json({ error: error.message || 'No se pudo enviar el mensaje.' }, { status: 400 }),
    )
  }

  return applySecurityHeaders(NextResponse.json({ ok: true }))
}
