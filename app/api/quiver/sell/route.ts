import { NextRequest, NextResponse } from 'next/server'
import { createClient as createServerClient } from '@/lib/supabase/server'
import { createClient as createAdminClient } from '@supabase/supabase-js'

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
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
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
      { error: 'Falta SUPABASE_SERVICE_ROLE_KEY para publicar en tienda' },
      { status: 500 },
    )
  }

  const body = (await request.json()) as { quiverId?: string; price?: number }
  const quiverId = body.quiverId
  const price = Number(body.price || 0)
  if (!quiverId || !price || price <= 0) {
    return NextResponse.json({ error: 'Datos de publicación inválidos' }, { status: 400 })
  }

  const admin = createAdminClient(url, serviceRole)
  const { data: board, error: boardError } = await admin
    .from('surfer_quiver')
    .select('*')
    .eq('id', quiverId)
    .eq('user_id', user.id)
    .maybeSingle()

  if (boardError || !board) {
    return NextResponse.json({ error: 'No se encontró la tabla seleccionada' }, { status: 404 })
  }

  const boardType = String(board.board_type || '').toLowerCase()
  const categorySlug = boardType.includes('skate')
    ? 'skateboards'
    : boardType.includes('sup')
      ? 'sup'
      : 'surfboards'

  const { data: category } = await admin
    .from('store_categories')
    .select('id, slug')
    .eq('slug', categorySlug)
    .maybeSingle()

  const meta = parseMeta(board.notes)
  const gallery = meta.galleryUrls || []
  const imageUrl = board.image_url || gallery[0] || null
  const description =
    `${board.board_type || 'Tabla'} usada de la comunidad.` +
    ` Medidas: ${board.length_feet || '-'}' x ${board.width_inches || '-'}" x ${board.thickness_inches || '-'}".`

  const { data: product, error: insertError } = await admin
    .from('products')
    .insert({
      name: `${board.board_name} (Usada)`,
      description,
      price,
      image_url: imageUrl,
      category: categorySlug,
      category_id: category?.id || null,
      condition: 'used',
      stock: 1,
      active: true,
    })
    .select('id')
    .maybeSingle()

  if (insertError || !product) {
    return NextResponse.json({ error: 'No se pudo publicar en tienda' }, { status: 500 })
  }

  const nextMeta = {
    __quiverMeta: true,
    galleryUrls: gallery,
    notesText: meta.notesText,
    listedProductId: product.id,
    listedAt: new Date().toISOString(),
  }
  await admin
    .from('surfer_quiver')
    .update({ notes: JSON.stringify(nextMeta) })
    .eq('id', quiverId)
    .eq('user_id', user.id)

  return NextResponse.json({
    ok: true,
    productId: product.id,
    categorySlug: category?.slug || categorySlug,
    redirectTo: `${appUrl}/tienda/${category?.slug || categorySlug}`,
  })
}

