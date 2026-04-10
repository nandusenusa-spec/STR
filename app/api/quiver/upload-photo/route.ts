import { NextRequest, NextResponse } from 'next/server'
import { createClient as createServerClient } from '@/lib/supabase/server'
import { createClient as createAdminClient } from '@supabase/supabase-js'
import { moderateImageBuffer } from '@/lib/moderation/image-moderation'

type QuiverMeta = {
  galleryUrls?: string[]
  listedProductId?: string
  listedAt?: string
  notesText?: string
}

const parseMeta = (notes?: string | null): QuiverMeta => {
  if (!notes) return {}
  try {
    const parsed = JSON.parse(notes) as { __quiverMeta?: boolean } & QuiverMeta
    if (parsed.__quiverMeta) return parsed
  } catch {
    return {}
  }
  return {}
}

export async function POST(request: NextRequest) {
  const supabase = await createServerClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.json({ error: 'No autenticado' }, { status: 401 })
  }

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const serviceRole = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !serviceRole) {
    return NextResponse.json(
      { error: 'Falta SUPABASE_SERVICE_ROLE_KEY para subir fotos desde el servidor.' },
      { status: 500 },
    )
  }

  const formData = await request.formData()
  const quiverId = String(formData.get('quiverId') || '')
  const files = formData
    .getAll('photos')
    .filter((v): v is File => v instanceof File)
    .filter((f) => f.type.startsWith('image/'))

  if (!quiverId || files.length === 0) {
    return NextResponse.json({ error: 'No se enviaron fotos válidas.' }, { status: 400 })
  }

  const admin = createAdminClient(url, serviceRole)
  const { data: board, error: boardError } = await admin
    .from('surfer_quiver')
    .select('id, user_id, image_url, notes')
    .eq('id', quiverId)
    .eq('user_id', user.id)
    .maybeSingle()
  if (boardError || !board) {
    return NextResponse.json({ error: 'No se encontró la tabla seleccionada.' }, { status: 404 })
  }

  const BUCKET = 'quiver-photos'
  try {
    await admin.storage.createBucket(BUCKET, { public: true })
  } catch {
    // ignore when it already exists
  }

  const uploadedUrls: string[] = []
  for (const file of files) {
    const bytes = await file.arrayBuffer()
    const mod = await moderateImageBuffer(bytes, file.type)
    if (!mod.ok) {
      return NextResponse.json({ error: mod.reason }, { status: 422 })
    }

    const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, '_')
    const path = `${user.id}/${quiverId}/${Date.now()}-${safeName}`
    const { error: uploadError } = await admin.storage
      .from(BUCKET)
      .upload(path, bytes, { contentType: file.type, upsert: false })
    if (uploadError) {
      return NextResponse.json(
        { error: `No se pudo subir una foto: ${uploadError.message}` },
        { status: 500 },
      )
    }
    const { data } = admin.storage.from(BUCKET).getPublicUrl(path)
    if (data.publicUrl) uploadedUrls.push(data.publicUrl)
  }

  const meta = parseMeta(board.notes)
  const existing = [board.image_url, ...(meta.galleryUrls || [])].filter(Boolean) as string[]
  const merged = [...new Set([...existing, ...uploadedUrls])]
  const nextImageUrl = merged[0] || null
  const nextMeta = {
    __quiverMeta: true,
    galleryUrls: merged.slice(1),
    listedProductId: meta.listedProductId,
    listedAt: meta.listedAt,
    notesText: meta.notesText,
  }

  const { error: updateError } = await admin
    .from('surfer_quiver')
    .update({
      image_url: nextImageUrl,
      notes: JSON.stringify(nextMeta),
    })
    .eq('id', quiverId)
    .eq('user_id', user.id)

  if (updateError) {
    return NextResponse.json(
      { error: `Las fotos subieron pero no se pudo guardar la tabla: ${updateError.message}` },
      { status: 500 },
    )
  }

  return NextResponse.json({
    ok: true,
    imageUrl: nextImageUrl,
    notes: JSON.stringify(nextMeta),
    uploaded: uploadedUrls.length,
  })
}

