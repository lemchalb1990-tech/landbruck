'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'

const STATUSES = ['PENDING','CONFIRMED','SHIPPED','DELIVERED','CANCELLED']
const STATUS_LABEL: Record<string, string> = {
  PENDING: 'Pendiente', CONFIRMED: 'Confirmado', SHIPPED: 'En camino',
  DELIVERED: 'Entregado', CANCELLED: 'Cancelado',
}

export default function UpdateOrderStatus({ orderId, currentStatus }: { orderId: number; currentStatus: string }) {
  const [status, setStatus] = useState(currentStatus)
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const update = async () => {
    setLoading(true)
    await fetch(`/api/pedidos/${orderId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status }),
    })
    setLoading(false)
    router.refresh()
  }

  return (
    <div className="flex gap-2 items-center">
      <select value={status} onChange={e => setStatus(e.target.value)}
        className="border border-gray-300 rounded-lg px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-brand-600">
        {STATUSES.map(s => <option key={s} value={s}>{STATUS_LABEL[s]}</option>)}
      </select>
      <button onClick={update} disabled={loading || status === currentStatus}
        className="bg-brand-600 hover:bg-brand-700 disabled:opacity-50 text-white text-xs px-3 py-1.5 rounded-lg transition-colors">
        {loading ? '...' : 'Actualizar'}
      </button>
    </div>
  )
}
