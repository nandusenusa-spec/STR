import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { checkoutBodySchema } from '@/lib/validation/api-schemas'
import { blockUnexpectedOrigin } from '@/lib/security/api-origin'
import { applySecurityHeaders } from '@/lib/security/http-headers'
import { getClientIp } from '@/lib/security/get-client-ip'
import { logSecurityEvent } from '@/lib/security/event-log'

const MAX_BODY = 200_000

type ProductRow = {
  id: string
  price: number | string
  active: boolean
  stock: number | null
}

export async function POST(request: NextRequest) {
  const ip = getClientIp(request)
  const path = request.nextUrl.pathname
  const originBlock = blockUnexpectedOrigin(request)
  if (originBlock) {
    await logSecurityEvent({
      event_type: 'api_forbidden_origin',
      severity: 'warning',
      ip,
      path,
    })
    return applySecurityHeaders(originBlock)
  }

  try {
    const raw = await request.text()
    if (raw.length > MAX_BODY) {
      await logSecurityEvent({
        event_type: 'api_payload_too_large',
        severity: 'warning',
        ip,
        path,
        details: { endpoint: 'checkout' },
      })
      return applySecurityHeaders(
        NextResponse.json({ error: 'Solicitud demasiado grande' }, { status: 413 }),
      )
    }

    let parsed: unknown
    try {
      parsed = JSON.parse(raw)
    } catch {
      await logSecurityEvent({
        event_type: 'api_invalid_json',
        severity: 'warning',
        ip,
        path,
        details: { endpoint: 'checkout' },
      })
      return applySecurityHeaders(
        NextResponse.json({ error: 'JSON inválido' }, { status: 400 }),
      )
    }

    const parsedBody = checkoutBodySchema.safeParse(parsed)
    if (!parsedBody.success) {
      await logSecurityEvent({
        event_type: 'checkout_validation_failed',
        severity: 'warning',
        ip,
        path,
      })
      return applySecurityHeaders(
        NextResponse.json({ error: 'Datos inválidos' }, { status: 400 }),
      )
    }

    const { items, customer, total } = parsedBody.data
    const supabase = await createClient()

    const ids = [...new Set(items.map((i) => i.product_id))]
    const { data: products, error: fetchErr } = await supabase
      .from('products')
      .select('id, price, active, stock')
      .in('id', ids)

    if (fetchErr || !products || products.length !== ids.length) {
      return applySecurityHeaders(
        NextResponse.json({ error: 'Productos inválidos' }, { status: 400 }),
      )
    }

    const byId = new Map<string, ProductRow>(products as ProductRow[])
    let serverTotal = 0

    for (const line of items) {
      const p = byId.get(line.product_id)
      if (!p || !p.active) {
        return applySecurityHeaders(
          NextResponse.json({ error: 'Producto no disponible' }, { status: 400 }),
        )
      }
      const stock = p.stock ?? 0
      if (stock < line.quantity) {
        return applySecurityHeaders(
          NextResponse.json({ error: 'Stock insuficiente' }, { status: 400 }),
        )
      }
      const unit = Number(p.price)
      if (!Number.isFinite(unit) || unit < 0) {
        return applySecurityHeaders(
          NextResponse.json({ error: 'Precio inválido' }, { status: 400 }),
        )
      }
      serverTotal += unit * line.quantity
    }

    const rounded = Math.round(serverTotal * 100) / 100
    const clientTotal = Math.round(total * 100) / 100
    if (Math.abs(rounded - clientTotal) > 0.02) {
      await logSecurityEvent({
        event_type: 'checkout_total_mismatch',
        severity: 'critical',
        ip,
        path,
        details: { client_total: clientTotal, server_total: rounded },
      })
      return applySecurityHeaders(
        NextResponse.json({ error: 'Total no válido' }, { status: 400 }),
      )
    }

    const { data: order, error: orderError } = await supabase
      .from('orders')
      .insert({
        customer_name: customer.name.trim().slice(0, 200),
        customer_email: customer.email.trim().toLowerCase().slice(0, 254),
        customer_phone: (customer.phone || '').trim().slice(0, 40),
        shipping_address: 'A coordinar',
        total: rounded,
        status: 'pending',
      })
      .select()
      .single()

    if (orderError) {
      console.error('Order creation error:', orderError)
      return applySecurityHeaders(
        NextResponse.json({ error: 'No se pudo crear el pedido' }, { status: 500 }),
      )
    }

    const orderItems = items.map((line) => {
      const p = byId.get(line.product_id)!
      const unit = Number(p.price)
      return {
        order_id: order.id,
        product_id: line.product_id,
        quantity: line.quantity,
        price: unit,
      }
    })

    const { error: itemsError } = await supabase.from('order_items').insert(orderItems)

    if (itemsError) {
      console.error('Order items error:', itemsError)
    }

    const accessToken = process.env.MERCADOPAGO_ACCESS_TOKEN
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'

    if (!accessToken) {
      return applySecurityHeaders(
        NextResponse.json({
          init_point: `${appUrl}/checkout/success?order_id=${order.id}`,
          order_id: order.id,
        }),
      )
    }

    const preferenceData = {
      items: items.map((line) => {
        const p = byId.get(line.product_id)!
        return {
          id: line.product_id,
          title: line.name.slice(0, 240),
          quantity: line.quantity,
          unit_price: Number(p.price),
          currency_id: process.env.NEXT_PUBLIC_MP_CURRENCY_ID || 'UYU',
        }
      }),
      payer: {
        name: customer.name.trim().slice(0, 200),
        email: customer.email.trim(),
        phone: customer.phone
          ? { number: customer.phone.trim().slice(0, 40) }
          : undefined,
      },
      back_urls: {
        success: `${appUrl}/checkout/success?order_id=${order.id}`,
        failure: `${appUrl}/checkout/failure?order_id=${order.id}`,
        pending: `${appUrl}/checkout/pending?order_id=${order.id}`,
      },
      auto_return: 'approved' as const,
      external_reference: order.id,
      notification_url: `${appUrl}/api/webhooks/mercadopago`,
    }

    const mpResponse = await fetch('https://api.mercadopago.com/checkout/preferences', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${accessToken}`,
      },
      body: JSON.stringify(preferenceData),
    })

    if (!mpResponse.ok) {
      const errorData = await mpResponse.json().catch(() => ({}))
      console.error('Mercado Pago error:', errorData)
      return applySecurityHeaders(
        NextResponse.json({ error: 'No se pudo crear el pago' }, { status: 500 }),
      )
    }

    const mpData = await mpResponse.json()

    await supabase.from('orders').update({ payment_id: mpData.id }).eq('id', order.id)

    return applySecurityHeaders(
      NextResponse.json({
        init_point: mpData.init_point,
        preference_id: mpData.id,
        order_id: order.id,
      }),
    )
  } catch (error) {
    console.error('Checkout error:', error)
    return applySecurityHeaders(
      NextResponse.json({ error: 'Error interno' }, { status: 500 }),
    )
  }
}
