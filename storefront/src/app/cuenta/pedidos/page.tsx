import { redirect } from 'next/navigation'
import Link from 'next/link'
import { getSession } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'

const STATUS_LABEL: Record<string, string> = {
  PENDING: 'Pendiente',
  CONFIRMED: 'Confirmado',
  SHIPPED: 'En camino',
  DELIVERED: 'Entregado',
  CANCELLED: 'Cancelado',
}

const STATUS_COLOR: Record<string, string> = {
  PENDING: 'bg-yellow-100 text-yellow-700',
  CONFIRMED: 'bg-blue-100 text-blue-700',
  SHIPPED: 'bg-purple-100 text-purple-700',
  DELIVERED: 'bg-green-100 text-green-700',
  CANCELLED: 'bg-red-100 text-red-700',
}

export default async function PedidosPage() {
  const session = getSession()
  if (!session) redirect('/cuenta/login')

  const orders = await prisma.order.findMany({
    where: { customerId: session.id },
    include: { items: { include: { product: true } } },
    orderBy: { createdAt: 'desc' },
  })

  return (
    <div className="max-w-4xl mx-auto px-4 py-10">
      <h1 className="text-2xl font-bold text-gray-800 mb-8">Mis pedidos</h1>

      {orders.length === 0 ? (
        <div className="text-center py-20 text-gray-400">
          <p className="mb-4">Aún no tienes pedidos.</p>
          <Link href="/productos" className="text-brand-600 hover:underline">Ver productos</Link>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map(order => (
            <div key={order.id} className="bg-white rounded-xl border border-gray-100 p-6">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <span className="text-sm text-gray-500">Pedido #{order.id}</span>
                  <p className="text-xs text-gray-400">
                    {format(order.createdAt, "d 'de' MMMM yyyy", { locale: es })}
                  </p>
                </div>
                <span className={`text-xs font-medium px-3 py-1 rounded-full ${STATUS_COLOR[order.status]}`}>
                  {STATUS_LABEL[order.status]}
                </span>
              </div>
              <ul className="text-sm text-gray-600 space-y-1 mb-3">
                {order.items.map(item => (
                  <li key={item.id}>{item.product.name} x{item.quantity}</li>
                ))}
              </ul>
              <div className="flex justify-between items-center border-t pt-3">
                <span className="text-sm text-gray-500">Total</span>
                <span className="font-bold text-gray-900">${Number(order.total).toLocaleString('es-CL')}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
