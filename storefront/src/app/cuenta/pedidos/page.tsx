export const dynamic = 'force-dynamic'

import { redirect } from 'next/navigation'
import Link from 'next/link'
import { getSession } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'
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

  // Pre-format dates on server to avoid hydration mismatch (server UTC vs client timezone)
  const serialized = orders.map(o => ({
    ...o,
    createdAt:     o.createdAt.toISOString(),
    formattedDate: format(o.createdAt, "d 'de' MMMM yyyy", { locale: es }),
    monthKey:      format(o.createdAt, 'MMMM yyyy', { locale: es }),
    total:         Number(o.total),
    items: o.items.map(i => ({
      ...i,
      price: Number(i.price),
    })),
  }))

  return <PedidosList orders={serialized} />
}
