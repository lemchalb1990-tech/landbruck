export const dynamic = 'force-dynamic'

import { redirect } from 'next/navigation'
import { getAdminSession } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import EnvioEditor from './EnvioEditor'

const DEFAULT_SHIPPING = {
  enabled:        false,
  apiUrl:         'https://api.starken.cl',
  apiKey:         '',
  accountNumber:  '',
  originCity:     'Santiago',
  originAddress:  '',
  originPhone:    '',
  service:        'NORMAL',
  shippingCost:   5000,
  regions:        [] as { name: string; cost: number }[],
}

export default async function EnvioPage() {
  const session = getAdminSession()
  if (!session || session.role !== 'ADMIN') redirect('/admin')

  const config = await prisma.siteConfig.findUnique({ where: { key: 'shipping' } })
  const shipping = { ...DEFAULT_SHIPPING, ...((config?.value as object) ?? {}) }

  return (
    <div className="max-w-2xl">
      <h1 className="text-2xl font-bold text-gray-900 mb-2">Envío con Starken</h1>
      <p className="text-sm text-gray-500 mb-6">Configura la integración con Starken para generar órdenes de despacho y hacer seguimiento de pedidos.</p>
      <EnvioEditor shipping={shipping} />
    </div>
  )
}
