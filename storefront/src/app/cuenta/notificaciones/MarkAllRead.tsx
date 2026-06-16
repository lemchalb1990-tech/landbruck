'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function MarkAllRead() {
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  async function mark() {
    setLoading(true)
    await fetch('/api/notificaciones', { method: 'PATCH' })
    setLoading(false)
    router.refresh()
  }

  return (
    <button onClick={mark} disabled={loading}
      className="text-xs text-brand-600 hover:text-brand-700 disabled:opacity-50 transition-colors">
      {loading ? 'Marcando...' : 'Marcar todo como leído'}
    </button>
  )
}
