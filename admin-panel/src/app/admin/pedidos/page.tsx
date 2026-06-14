export const dynamic = 'force-dynamic'

import Link from 'next/link'
import { prisma } from '@/lib/prisma'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'

const STATUS_LABEL: Record<string, string> = {
  PENDING: 'Pendiente', CONFIRMED: 'Confirmado', SHIPPED: 'En camino',
  DELIVERED: 'Entregado', CANCELLED: 'Cancelado',
}
const STATUS_COLOR: Record<string, string> = {
  PENDING: 'status-pending', CONFIRMED: 'status-confirmed', SHIPPED: 'status-shipped',
  DELIVERED: 'status-delivered', CANCELLED: 'status-cancelled',
}

export default async function PedidosPage() {
  const orders = await prisma.order.findMany({
    include: { customer: true, items: true },
    orderBy: { createdAt: 'desc' },
  })

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Pedidos</h1>
      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b">
            <tr className="text-left text-gray-500">
              <th className="px-4 py-3">#</th>
              <th className="px-4 py-3">Cliente</th>
              <th className="px-4 py-3">Items</th>
              <th className="px-4 py-3">Total</th>
              <th className="px-4 py-3">Estado</th>
              <th className="px-4 py-3">Fecha</th>
              <th className="px-4 py-3"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {orders.map(o => (
              <tr key={o.id} className="hover:bg-gray-50">
                <td className="px-4 py-3 text-gray-500">#{o.id}</td>
                <td className="px-4 py-3 font-medium">{o.customer.name}</td>
                <td className="px-4 py-3 text-gray-500">{o.items.length} producto(s)</td>
                <td className="px-4 py-3">${Number(o.total).toLocaleString('es-CL')}</td>
                <td className="px-4 py-3">
                  <span className={STATUS_COLOR[o.status]}>{STATUS_LABEL[o.status]}</span>
                </td>
                <td className="px-4 py-3 text-gray-500">
                  {format(o.createdAt, "d MMM yyyy", { locale: es })}
                </td>
                <td className="px-4 py-3">
                  <Link href={`/admin/pedidos/${o.id}`} className="text-brand-600 hover:underline text-xs">Ver</Link>
                </td>
              </tr>
            ))}
            {orders.length === 0 && (
              <tr><td colSpan={7} className="px-4 py-10 text-center text-gray-400">Sin pedidos</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
