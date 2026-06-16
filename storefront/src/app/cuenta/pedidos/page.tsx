export const dynamic = 'force-dynamic'

import { redirect } from 'next/navigation'
import Link from 'next/link'
import { getSession } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import PedidosList from './PedidosList'

export default async function PedidosPage() {
  const session = getSession()
  if (!session) redirect('/cuenta/login')

  const orders = await prisma.order.findMany({
    where:   { customerId: session.id },
    include: { items: { include: { product: { select: { name: true } } } } },
    orderBy: { createdAt: 'desc' },
  })

  if (orders.length === 0) {
    return (
      <div className="text-center py-20 text-gray-400">
        <p className="mb-4">Aún no tienes pedidos.</p>
        <Link href="/productos" className="text-brand-600 hover:underline text-sm">
          Ver productos →
        </Link>
      </div>
    )
  }

  return <PedidosList orders={orders as any} />
}
