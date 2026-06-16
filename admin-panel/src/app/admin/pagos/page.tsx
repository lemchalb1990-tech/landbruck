export const dynamic = 'force-dynamic'

import { redirect } from 'next/navigation'
import { getAdminSession } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import PagosEditor from './PagosEditor'

const DEFAULT_PAYMENTS = {
  mercadopago: { enabled: false, sandbox: true, publicKey: '', accessToken: '' },
  flow:        { enabled: false, sandbox: true, apiKey: '',   secretKey: '' },
}

const DEFAULT_EMAIL = {
  host: '', port: 587, secure: false, user: '', pass: '', from: '',
}

export default async function PagosPage() {
  const session = getAdminSession()
  if (!session || session.role !== 'ADMIN') redirect('/admin')

  const [payConfig, emailConfig] = await Promise.all([
    prisma.siteConfig.findUnique({ where: { key: 'payments' } }),
    prisma.siteConfig.findUnique({ where: { key: 'email' } }),
  ])

  const payments = {
    mercadopago: { ...DEFAULT_PAYMENTS.mercadopago, ...((payConfig?.value as Record<string, unknown>)?.mercadopago as object ?? {}) },
    flow:        { ...DEFAULT_PAYMENTS.flow,        ...((payConfig?.value as Record<string, unknown>)?.flow        as object ?? {}) },
  }

  const email = { ...DEFAULT_EMAIL, ...((emailConfig?.value as object) ?? {}) }

  return (
    <div className="max-w-3xl">
      <h1 className="text-2xl font-bold text-gray-900 mb-2">Pagos y notificaciones</h1>
      <p className="text-sm text-gray-500 mb-6">Configura los proveedores de pago y el email de confirmación de pedidos.</p>
      <PagosEditor payments={payments} email={email} />
    </div>
  )
}
