import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/service'
import { verifyMercadoPagoWebhook } from '@/lib/security/verify-mp-webhook'
import { applySecurityHeaders } from '@/lib/security/http-headers'
import { getClientIp } from '@/lib/security/get-client-ip'
import { logSecurityEvent } from '@/lib/security/event-log'

export const runtime = 'nodejs'

export async function POST(request: NextRequest) {
  try {
    const ip = getClientIp(request)
    const path = request.nextUrl.pathname
    const rawBody = await request.text()
    const secret = process.env.MERCADOPAGO_WEBHOOK_SECRET

    if (process.env.NODE_ENV === 'production' && !secret) {
      console.error('Missing MERCADOPAGO_WEBHOOK_SECRET in production')
      await logSecurityEvent({
        event_type: 'webhook_secret_missing',
        severity: 'critical',
        ip,
        path,
      })
      return applySecurityHeaders(
        NextResponse.json({ error: 'Webhook secret required' }, { status: 500 }),
      )
    }

    if (secret) {
      const ok = verifyMercadoPagoWebhook(request, rawBody, secret)
      if (!ok) {
        console.warn('Mercado Pago webhook: firma inválida')
        await logSecurityEvent({
          event_type: 'webhook_signature_invalid',
          severity: 'critical',
          ip,
          path,
        })
        return applySecurityHeaders(
          NextResponse.json({ error: 'Unauthorized' }, { status: 401 }),
        )
      }
    }

    let body: { type?: string; data?: { id?: string } }
    try {
      body = JSON.parse(rawBody) as { type?: string; data?: { id?: string } }
    } catch {
      await logSecurityEvent({
        event_type: 'webhook_invalid_json',
        severity: 'warning',
        ip,
        path,
      })
      return applySecurityHeaders(NextResponse.json({ received: false }, { status: 400 }))
    }

    if (body.type === 'payment') {
      const paymentId = body.data?.id

      if (!paymentId) {
        return applySecurityHeaders(NextResponse.json({ received: true }))
      }

      const accessToken = process.env.MERCADOPAGO_ACCESS_TOKEN

      if (!accessToken) {
        console.error('Missing MERCADOPAGO_ACCESS_TOKEN')
        return applySecurityHeaders(NextResponse.json({ received: true }))
      }

      const paymentResponse = await fetch(
        `https://api.mercadopago.com/v1/payments/${paymentId}`,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        },
      )

      if (!paymentResponse.ok) {
        console.error('Failed to fetch payment details')
        return applySecurityHeaders(NextResponse.json({ received: true }))
      }

      const paymentData = await paymentResponse.json()
      const orderId = paymentData.external_reference
      const status = paymentData.status

      const statusMap: Record<string, string> = {
        approved: 'paid',
        pending: 'pending',
        authorized: 'pending',
        in_process: 'pending',
        in_mediation: 'pending',
        rejected: 'cancelled',
        cancelled: 'cancelled',
        refunded: 'cancelled',
        charged_back: 'cancelled',
      }

      const orderStatus = statusMap[status] || 'pending'

      let supabase
      try {
        supabase = createServiceClient()
      } catch (e) {
        console.error('Webhook: set SUPABASE_SERVICE_ROLE_KEY to update orders', e)
        return applySecurityHeaders(NextResponse.json({ received: true }))
      }

      const { data: currentOrder } = await supabase
        .from('orders')
        .select('id, status, payment_id')
        .eq('id', orderId)
        .maybeSingle()

      // Idempotency: prevent duplicate stock decrements on repeated webhooks
      const alreadyPaidSamePayment =
        currentOrder?.status === 'paid' &&
        String(currentOrder?.payment_id ?? '') === String(paymentId)
      if (alreadyPaidSamePayment) {
        return applySecurityHeaders(NextResponse.json({ received: true }))
      }

      await supabase
        .from('orders')
        .update({
          status: orderStatus,
          payment_id: paymentId.toString(),
        })
        .eq('id', orderId)

      const shouldDecrementStock =
        orderStatus === 'paid' && currentOrder?.status !== 'paid'

      if (shouldDecrementStock) {
        const { data: orderItems } = await supabase
          .from('order_items')
          .select('product_id, quantity')
          .eq('order_id', orderId)

        if (orderItems) {
          for (const item of orderItems) {
            await supabase.rpc('decrement_stock', {
              p_id: item.product_id,
              amount: item.quantity,
            })
          }
        }
      }
    }

    return applySecurityHeaders(NextResponse.json({ received: true }))
  } catch (error) {
    console.error('Webhook error:', error)
    return applySecurityHeaders(NextResponse.json({ received: true }))
  }
}
