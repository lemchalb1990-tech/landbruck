import { NextResponse, NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { createMPPreference, MPConfig } from '@/lib/payments/mercadopago'

export async function GET(req: NextRequest) {
  const orderId = parseInt(req.nextUrl.searchParams.get('orderId') ?? '0')
  if (!orderId) return NextResponse.json({ error: 'orderId requerido' }, { status: 400 })

  const [order, payConfig] = await Promise.all([
    prisma.order.findUnique({
      where: { id: orderId },
      include: { customer: true, items: { include: { product: true } } },
    }),
    prisma.siteConfig.findUnique({ where: { key: 'payments' } }),
  ])

  if (!order) return NextResponse.json({ error: 'Pedido no encontrado' }, { status: 404 })

  const mpConfig = (payConfig?.value as Record<string, unknown>)?.mercadopago as MPConfig | undefined
  if (!mpConfig?.enabled || !mpConfig.accessToken)
    return NextResponse.json({ error: 'MercadoPago no configurado' }, { status: 400 })

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? ''
  const { url } = await createMPPreference(mpConfig, {
    id: order.id,
    items: order.items.map(i => ({
      name:     i.product.name,
      quantity: i.quantity,
      price:    Number(i.price),
    })),
    email: order.customer.email,
    siteUrl,
  })

  await prisma.order.update({
    where: { id: orderId },
    data: { paymentProvider: 'mercadopago', paymentStatus: 'PENDING' },
  })

  return NextResponse.json({ url })
}
