export const dynamic = 'force-dynamic'

import { prisma } from '@/lib/prisma'
import { ShoppingBag, Package, Users, DollarSign } from 'lucide-react'

async function getStats() {
  const [orders, products, customers, revenue] = await Promise.all([
    prisma.order.count(),
    prisma.product.count(),
    prisma.customer.count(),
    prisma.order.aggregate({ _sum: { total: true }, where: { status: { not: 'CANCELLED' } } }),
  ])
  const recentOrders = await prisma.order.findMany({
    take: 5,
    orderBy: { createdAt: 'desc' },
    include: { customer: true },
  })
  return { orders, products, customers, revenue: Number(revenue._sum.total ?? 0), recentOrders }
}

const STATUS_LABEL: Record<string, string> = {
  PENDING: 'Pendiente', CONFIRMED: 'Confirmado', SHIPPED: 'En camino',
  DELIVERED: 'Entregado', CANCELLED: 'Cancelado',
}
const STATUS_COLOR: Record<string, string> = {
  PENDING: 'status-pending', CONFIRMED: 'status-confirmed', SHIPPED: 'status-shipped',
  DELIVERED: 'status-delivered', CANCELLED: 'status-cancelled',
}

export default async function DashboardPage() {
  const { orders, products, customers, revenue, recentOrders } = await getStats()

  const stats = [
    { label: 'Pedidos', value: orders, icon: ShoppingBag, color: 'bg-blue-500' },
    { label: 'Productos', value: products, icon: Package, color: 'bg-green-500' },
    { label: 'Clientes', value: customers, icon: Users, color: 'bg-purple-500' },
    { label: 'Ingresos', value: `$${revenue.toLocaleString('es-CL')}`, icon: DollarSign, color: 'bg-yellow-500' },
  ]

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Dashboard</h1>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-5 mb-8">
        {stats.map(({ label, value, icon: Icon, color }) => (
          <div key={label} className="bg-white rounded-xl p-5 shadow-sm flex items-center gap-4">
            <div className={`${color} p-3 rounded-xl`}>
              <Icon size={22} className="text-white" />
            </div>
            <div>
              <p className="text-sm text-gray-500">{label}</p>
              <p className="text-xl font-bold text-gray-900">{value}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-xl shadow-sm p-6">
        <h2 className="font-semibold text-gray-800 mb-4">Últimos pedidos</h2>
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-gray-500 border-b">
              <th className="pb-2">#</th>
              <th className="pb-2">Cliente</th>
              <th className="pb-2">Total</th>
              <th className="pb-2">Estado</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {recentOrders.map(order => (
              <tr key={order.id}>
                <td className="py-3 text-gray-500">#{order.id}</td>
                <td className="py-3 font-medium">{order.customer.name}</td>
                <td className="py-3">${Number(order.total).toLocaleString('es-CL')}</td>
                <td className="py-3">
                  <span className={STATUS_COLOR[order.status]}>{STATUS_LABEL[order.status]}</span>
                </td>
              </tr>
            ))}
            {recentOrders.length === 0 && (
              <tr><td colSpan={4} className="py-6 text-center text-gray-400">Sin pedidos aún</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
