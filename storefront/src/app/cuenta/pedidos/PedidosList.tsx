'use client'

import { useState } from 'react'
import { Truck, ChevronDown, ChevronUp } from 'lucide-react'

interface OrderItem { id: number; quantity: number; price: number; product: { name: string } }
interface Order {
  id: number; status: string; createdAt: string
  formattedDate: string; monthKey: string
  total: number; address: string; city: string
  paymentProvider: string | null
  trackingNumber: string | null; trackingUrl: string | null
  items: OrderItem[]
}

const STATUS_LABEL: Record<string, string> = {
  PENDING: 'Pendiente', CONFIRMED: 'Confirmado', SHIPPED: 'En camino',
  DELIVERED: 'Entregado', CANCELLED: 'Cancelado',
}
const STATUS_COLOR: Record<string, string> = {
  PENDING:   'bg-yellow-100 text-yellow-700 border-yellow-200',
  CONFIRMED: 'bg-blue-100 text-blue-700 border-blue-200',
  SHIPPED:   'bg-purple-100 text-purple-700 border-purple-200',
  DELIVERED: 'bg-green-100 text-green-700 border-green-200',
  CANCELLED: 'bg-red-100 text-red-700 border-red-200',
}
const STATUS_BAR: Record<string, string> = {
  PENDING: 'bg-yellow-400', CONFIRMED: 'bg-blue-500',
  SHIPPED: 'bg-purple-500', DELIVERED: 'bg-green-500', CANCELLED: 'bg-red-400',
}
const STEPS = ['PENDING', 'CONFIRMED', 'SHIPPED', 'DELIVERED']
const STEP_LABEL = ['Recibido', 'Confirmado', 'En camino', 'Entregado']

const FILTERS = [
  { key: 'all',       label: 'Todos' },
  { key: 'active',    label: 'Activos' },
  { key: 'SHIPPED',   label: 'En camino' },
  { key: 'DELIVERED', label: 'Entregados' },
  { key: 'CANCELLED', label: 'Cancelados' },
]

function matchFilter(status: string, filter: string) {
  if (filter === 'all') return true
  if (filter === 'active') return ['PENDING', 'CONFIRMED', 'SHIPPED'].includes(status)
  return status === filter
}

function groupByMonth(orders: Order[]) {
  const map = new Map<string, Order[]>()
  orders.forEach(o => {
    if (!map.has(o.monthKey)) map.set(o.monthKey, [])
    map.get(o.monthKey)!.push(o)
  })
  return map
}

function StepBar({ status }: { status: string }) {
  if (status === 'CANCELLED') return (
    <p className="text-xs text-red-500 font-medium mt-1">Pedido cancelado</p>
  )
  const current = STEPS.indexOf(status)
  return (
    <div className="mt-3">
      <p className="text-xs text-gray-500 sm:hidden">
        Paso {current + 1} de {STEPS.length}: <strong>{STATUS_LABEL[status]}</strong>
      </p>
      <div className="hidden sm:flex items-center gap-0">
        {STEPS.map((s, i) => {
          const done = i <= current
          return (
            <div key={s} className="flex items-center flex-1 last:flex-none">
              <div className={`w-2.5 h-2.5 rounded-full shrink-0 transition-colors ${done ? STATUS_BAR[status] : 'bg-gray-200'}`} />
              <span className={`text-[10px] mx-1 ${done ? 'text-gray-700 font-medium' : 'text-gray-400'}`}>
                {STEP_LABEL[i]}
              </span>
              {i < STEPS.length - 1 && (
                <div className={`flex-1 h-px mx-1 ${i < current ? STATUS_BAR[status] : 'bg-gray-200'}`} />
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}

function OrderRow({ order }: { order: Order }) {
  const [open, setOpen] = useState(false)

  return (
    <li className="py-4">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-sm font-semibold text-gray-800">Pedido #{order.id}</span>
            <span className={`text-[11px] font-medium px-2 py-0.5 rounded-full border ${STATUS_COLOR[order.status]}`}>
              {STATUS_LABEL[order.status]}
            </span>
            {order.paymentProvider && (
              <span className="text-[11px] text-gray-400 capitalize">{order.paymentProvider}</span>
            )}
          </div>
          <p className="text-xs text-gray-400 mt-0.5">{order.formattedDate}</p>
          <StepBar status={order.status} />
        </div>
        <div className="text-right shrink-0">
          <p className="text-sm font-bold text-gray-900">${order.total.toLocaleString('es-CL')}</p>
          <button onClick={() => setOpen(v => !v)}
            className="mt-1 flex items-center gap-1 text-xs text-brand-600 hover:text-brand-700 ml-auto transition-colors">
            {open ? <><ChevronUp size={13} /> Ocultar</> : <><ChevronDown size={13} /> Detalle</>}
          </button>
        </div>
      </div>

      {open && (
        <div className="mt-3 pl-3 border-l-2 border-gray-100 space-y-3">
          <ul className="space-y-1">
            {order.items.map(item => (
              <li key={item.id} className="flex justify-between text-xs text-gray-600">
                <span>{item.product.name} <span className="text-gray-400">x{item.quantity}</span></span>
                <span>${(item.price * item.quantity).toLocaleString('es-CL')}</span>
              </li>
            ))}
          </ul>
          <p className="text-xs text-gray-400">📍 {order.address}, {order.city}</p>
          {order.trackingNumber && (
            <div className="flex items-center gap-2 text-xs text-gray-500">
              <Truck size={12} className="text-purple-500 shrink-0" />
              <span>Starken: <span className="font-mono font-medium text-gray-700">{order.trackingNumber}</span></span>
              {order.trackingUrl && (
                <a href={order.trackingUrl} target="_blank" rel="noopener noreferrer"
                  className="text-brand-600 hover:underline">Ver etiqueta →</a>
              )}
            </div>
          )}
        </div>
      )}
    </li>
  )
}

export default function PedidosList({ orders }: { orders: Order[] }) {
  const [filter, setFilter] = useState('all')

  const filtered = orders.filter(o => matchFilter(o.status, filter))
  const grouped  = groupByMonth(filtered)

  return (
    <div>
      <div className="flex gap-1 overflow-x-auto pb-1 mb-5">
        {FILTERS.map(f => (
          <button key={f.key} onClick={() => setFilter(f.key)}
            className={`shrink-0 px-3 py-1.5 rounded-full text-xs font-medium transition-colors border ${
              filter === f.key
                ? 'bg-brand-600 text-white border-brand-600'
                : 'bg-white text-gray-600 border-gray-200 hover:border-brand-400 hover:text-brand-600'
            }`}>
            {f.label}
            {f.key === 'all' && (
              <span className="ml-1.5 bg-white/20 text-current rounded-full px-1.5 py-0.5 text-[10px]">
                {orders.length}
              </span>
            )}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <p className="text-center py-16 text-sm text-gray-400">No hay pedidos en esta categoría.</p>
      ) : (
        <div className="space-y-6">
          {Array.from(grouped.entries()).map(([month, monthOrders]) => (
            <section key={month}>
              <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1 capitalize">
                {month}
              </h3>
              <ul className="divide-y divide-gray-100">
                {monthOrders.map(order => (
                  <OrderRow key={order.id} order={order} />
                ))}
              </ul>
            </section>
          ))}
        </div>
      )}
    </div>
  )
}
