'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'

export default function AutoRedirect() {
  const [seconds, setSeconds] = useState(4)
  const router = useRouter()

  useEffect(() => {
    if (seconds <= 0) { router.push('/cuenta/pedidos'); return }
    const t = setTimeout(() => setSeconds(s => s - 1), 1000)
    return () => clearTimeout(t)
  }, [seconds, router])

  return (
    <p className="mt-6 text-xs text-gray-400">
      Redirigiendo a tus pedidos en {seconds}s...
    </p>
  )
}
