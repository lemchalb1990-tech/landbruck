import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

const STATUS_NOTIF: Record<string, { title: string; body: (id: number) => string }> = {
  CONFIRMED: { title: 'Pago confirmado',   body: id => `El pago de tu pedido #${id} fue confirmado. Pronto lo despacharemos.` },
  SHIPPED:   { title: 'Pedido en camino',  body: id => `Tu pedido #${id} está en camino. Te avisaremos cuando llegue.` },
  DELIVERED: { title: '¡Pedido entregado!', body: id => `Tu pedido #${id} fue entregado. ¡Gracias por comprar en Landbruck!` },
  CANCELLED: { title: 'Pedido cancelado',  body: id => `Tu pedido #${id} fue cancelado.` },
}

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  const { status } = await req.json()
  const order = await prisma.order.update({
    where: { id: Number(params.id) },
    data:  { status },
  })

  const notif = STATUS_NOTIF[status]
  if (notif) {
    await prisma.notification.create({
      data: {
        customerId: order.customerId,
        type:       status === 'DELIVERED' ? 'ORDER_DELIVERED' : status === 'CANCELLED' ? 'ORDER_CANCELLED' : status === 'SHIPPED' ? 'ORDER_SHIPPED' : 'PAYMENT_CONFIRMED',
        title:      notif.title,
        body:       notif.body(order.id),
      },
    }).catch(() => {})
  }

  return NextResponse.json(order)
}
