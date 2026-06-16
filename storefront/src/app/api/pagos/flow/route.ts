import { NextResponse, NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { createFlowPayment, FlowConfig } from '@/lib/payments/flow'

export async function GET(req: NextRequest) {
  const orderId = parseInt(req.nextUrl.searchParams.get('orderId') ?? '0')
  if (!orderId) return NextResponse.json({ error: 'orderId requerido' }, { status: 400 })

  const [order, payConfig] = await Promise.all([
    prisma.order.findUnique({ where: { id: orderId }, include: { customer: true } }),
    prisma.siteConfig.findUnique({ where: { key: 'payments' } }),
  ])

  if (!order) return NextResponse.json({ error: 'Pedido no encontrado' }, { status: 404 })

  const flowConfig = (payConfig?.value as Record<string, unknown>)?.flow as FlowConfig | undefined
  if (!flowConfig?.enabled || !flowConfig.apiKey)
    return NextResponse.json({ error: 'Flow no configurado' }, { status: 400 })

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? ''
  const { url } = await createFlowPayment(flowConfig, {
    id: order.id,
    total: Number(order.total),
    email: order.customer.email,
    siteUrl,
  })

  await prisma.order.update({
    where: { id: orderId },
    data: { paymentProvider: 'flow', paymentStatus: 'PENDING' },
  })

  return NextResponse.json({ url })
}
