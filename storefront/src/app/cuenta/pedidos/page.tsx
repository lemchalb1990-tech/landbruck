export const dynamic = 'force-dynamic'

import { redirect } from 'next/navigation'
import Link from 'next/link'
import { getSession } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import { Truck } from 'lucide-react'

const STATUS_LABEL: Record<string, string> = {
  PENDING:   'Pendiente',
  CONFIRMED: 'Confirmado',
  SHIPPED:   'En camino',
  DELIVERED: 'Entregado',
  CANCELLED: 'Cancelado',
}

const STATUS_COLOR: Record<string, string> = {
  PENDING:   'bg-yellow-100 text-yellow-700',
  CONFIRMED: 'bg-blue-100 text-blue-700',
  SHIPPED:   'bg-purple-100 text-purple-700',
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
    <div>
      <h2 className="text-lg font-semibold text-gray-800 mb-6">Mis pedidos</h2>

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
                  <span className="text-sm font-medium text-gray-700">Pedido #{order.id}</span>
                  <p className="text-xs text-gray-400 mt-0.5">
                    {format(order.createdAt, "d 'de' MMMM yyyy", { locale: es })}
                    {order.paymentProvider && (
                      <span className="ml-2 capitalize text-gray-400">· {order.paymentProvider}</span>
                    )}
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

              {order.trackingNumber && (
                <div className="mt-3 pt-3 border-t flex items-center gap-2 text-xs text-gray-500">
                  <Truck size={13} className="text-purple-500" />
                  <span>Seguimiento Starken:</span>
                  <span className="font-mono font-medium text-gray-700">{order.trackingNumber}</span>
                  {order.trackingUrl && (
                    <a href={order.trackingUrl} target="_blank" rel="noopener noreferrer"
                      className="text-brand-600 hover:underline ml-1">Ver etiqueta →</a>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
