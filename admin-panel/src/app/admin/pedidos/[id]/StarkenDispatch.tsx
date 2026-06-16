'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Truck, ExternalLink } from 'lucide-react'

interface Props {
  orderId:        number
  trackingNumber: string | null
  trackingUrl:    string | null
}

export default function StarkenDispatch({ orderId, trackingNumber, trackingUrl }: Props) {
  const [loading, setLoading] = useState(false)
  const [error, setError]     = useState('')
  const router = useRouter()

  if (trackingNumber) {
    return (
      <div className="flex flex-col gap-2">
        <div className="flex items-center gap-2 text-sm text-green-700 font-medium">
          <Truck size={15} />
          <span>N° de seguimiento: <strong>{trackingNumber}</strong></span>
        </div>
        {trackingUrl && (
          <a href={trackingUrl} target="_blank" rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 text-xs text-brand-600 hover:underline">
            <ExternalLink size={13} />
            Ver etiqueta / tracking
          </a>
        )}
      </div>
    )
  }

  async function generar() {
    setLoading(true); setError('')
    const res = await fetch('/api/envio/despacho', {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify({ orderId }),
    })
    setLoading(false)
    if (!res.ok) {
      const data = await res.json()
      setError(data.error || 'Error al generar despacho')
      return
    }
    router.refresh()
  }

  return (
    <div className="flex flex-col gap-2">
      <button onClick={generar} disabled={loading}
        className="inline-flex items-center gap-2 px-3 py-1.5 bg-brand-600 hover:bg-brand-700 disabled:opacity-50 text-white text-xs font-medium rounded-lg transition-colors">
        <Truck size={14} />
        {loading ? 'Generando...' : 'Generar despacho Starken'}
      </button>
      {error && <p className="text-xs text-red-600">{error}</p>}
    </div>
  )
}
