import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { MPConfig } from '@/lib/payments/mercadopago'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    if (body.type !== 'payment') return new Response('', { status: 200 })

    const payConfig = await prisma.siteConfig.findUnique({ where: { key: 'payments' } })
    const mpConfig = (payConfig?.value as Record<string, unknown>)?.mercadopago as MPConfig | undefined
    if (!mpConfig) return new Response('', { status: 200 })

    const payRes = await fetch(`https://api.mercadopago.com/v1/payments/${body.data.id}`, {
      headers: { Authorization: `Bearer ${mpConfig.accessToken}` },
    })
    const payment = await payRes.json()

    const orderId = parseInt(payment.external_reference)
    if (!orderId) return new Response('', { status: 200 })

    if (payment.status === 'approved') {
      await prisma.order.update({
        where: { id: orderId },
        data: { paymentStatus: 'PAID', paymentId: String(payment.id), status: 'CONFIRMED' },
      })
    } else if (payment.status === 'rejected' || payment.status === 'cancelled') {
      await prisma.order.update({
        where: { id: orderId },
        data: { paymentStatus: 'FAILED' },
      })
    }
  } catch (e) {
    console.error('[webhook/mercadopago]', e)
  }
  return new Response('', { status: 200 })
}
