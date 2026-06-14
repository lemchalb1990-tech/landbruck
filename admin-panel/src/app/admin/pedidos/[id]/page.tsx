export const dynamic = 'force-dynamic'

import { prisma } from '@/lib/prisma'
import { notFound } from 'next/navigation'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import UpdateOrderStatus from './UpdateOrderStatus'

const STATUS_LABEL: Record<string, string> = {
  PENDING: 'Pendiente', CONFIRMED: 'Confirmado', SHIPPED: 'En camino',
  DELIVERED: 'Entregado', CANCELLED: 'Cancelado',
}

export default async function PedidoPage({ params }: { params: { id: string } }) {
  const order = await prisma.order.findUnique({
    where: { id: Number(params.id) },
    include: { customer: true, items: { include: { product: true } } },
  })
  if (!order) notFound()

  return (
    <div className="max-w-3xl">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Pedido #{order.id}</h1>
      <div className="grid grid-cols-2 gap-5 mb-6">
        <div className="bg-white rounded-xl shadow-sm p-5">
          <h2 className="font-semibold text-gray-700 mb-3">Cliente</h2>
          <p className="text-sm font-medium">{order.customer.name}</p>
          <p className="text-sm text-gray-500">{order.customer.email}</p>
          <p className="text-sm text-gray-500">{order.phone}</p>
          <p className="text-sm text-gray-500 mt-2">{order.address}, {order.city}</p>
        </div>
        <div className="bg-white rounded-xl shadow-sm p-5">
          <h2 className="font-semibold text-gray-700 mb-3">Información</h2>
          <p className="text-sm text-gray-500">Fecha: {format(order.createdAt, "d 'de' MMMM yyyy", { locale: es })}</p>
          <p className="text-sm font-bold mt-2">Total: ${Number(order.total).toLocaleString('es-CL')}</p>
          <div className="mt-3">
            <UpdateOrderStatus orderId={order.id} currentStatus={order.status} />
          </div>
        </div>
      </div>
      <div className="bg-white rounded-xl shadow-sm p-5">
        <h2 className="font-semibold text-gray-700 mb-3">Productos</h2>
        <table className="w-full text-sm">
          <thead className="border-b text-gray-500">
            <tr>
              <th className="text-left pb-2">Producto</th>
              <th className="text-right pb-2">Cantidad</th>
              <th className="text-right pb-2">Precio</th>
              <th className="text-right pb-2">Subtotal</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {order.items.map(item => (
              <tr key={item.id}>
                <td className="py-2">{item.product.name}</td>
                <td className="py-2 text-right">{item.quantity}</td>
                <td className="py-2 text-right">${Number(item.price).toLocaleString('es-CL')}</td>
                <td className="py-2 text-right font-medium">${(Number(item.price) * item.quantity).toLocaleString('es-CL')}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
