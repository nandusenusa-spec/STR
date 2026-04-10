import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { blockUnexpectedOrigin } from '@/lib/security/api-origin'
import { applySecurityHeaders } from '@/lib/security/http-headers'
import { moderateImageBuffer } from '@/lib/moderation/image-moderation'

export const runtime = 'nodejs'

const MAX_UPLOAD = 8 * 1024 * 1024

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

  let formData: FormData
  try {
    formData = await request.formData()
  } catch {
    return applySecurityHeaders(NextResponse.json({ error: 'Formulario inválido' }, { status: 400 }))
  }

  const file = formData.get('file')
  if (!(file instanceof File)) {
    return applySecurityHeaders(NextResponse.json({ error: 'Falta el archivo.' }, { status: 400 }))
  }
  if (!file.type.startsWith('image/')) {
    return applySecurityHeaders(NextResponse.json({ error: 'Solo imágenes.' }, { status: 400 }))
  }
  if (file.size > MAX_UPLOAD) {
    return applySecurityHeaders(NextResponse.json({ error: 'Archivo demasiado grande.' }, { status: 413 }))
  }

  const buffer = await file.arrayBuffer()
  const result = await moderateImageBuffer(buffer, file.type)

  if (!result.ok) {
    return applySecurityHeaders(
      NextResponse.json({ ok: false, error: result.reason }, { status: 422 }),
    )
  }

  return applySecurityHeaders(
    NextResponse.json({ ok: true, skipped: 'skipped' in result ? result.skipped === true : false }),
  )
}
