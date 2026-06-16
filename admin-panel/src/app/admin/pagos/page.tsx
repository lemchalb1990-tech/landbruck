export const dynamic = 'force-dynamic'

import { redirect } from 'next/navigation'
import { getAdminSession } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import PagosEditor from './PagosEditor'

const DEFAULT_PAYMENTS = {
  mercadopago: { enabled: false, sandbox: true, publicKey: '', accessToken: '' },
  flow:        { enabled: false, sandbox: true, apiKey: '',   secretKey: '' },
}

export default async function PagosPage() {
  const session = getAdminSession()
  if (!session || session.role !== 'ADMIN') redirect('/admin')

  const config = await prisma.siteConfig.findUnique({ where: { key: 'payments' } })
  const payments = {
    mercadopago: { ...DEFAULT_PAYMENTS.mercadopago, ...((config?.value as Record<string, unknown>)?.mercadopago as object ?? {}) },
    flow:        { ...DEFAULT_PAYMENTS.flow,        ...((config?.value as Record<string, unknown>)?.flow        as object ?? {}) },
  }

  return (
    <div className="max-w-3xl">
      <h1 className="text-2xl font-bold text-gray-900 mb-2">Métodos de pago</h1>
      <p className="text-sm text-gray-500 mb-6">Configura los proveedores de pago para el checkout de la tienda.</p>
      <PagosEditor payments={payments} />
    </div>
  )
}
