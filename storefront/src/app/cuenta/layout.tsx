export const dynamic = 'force-dynamic'

import { getSession } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { LogOut } from 'lucide-react'
import CuentaNav from './CuentaNav'

export default async function CuentaLayout({ children }: { children: React.ReactNode }) {
  const session = getSession()

  if (!session) return <>{children}</>

  const [customer, unreadCount] = await Promise.all([
    prisma.customer.findUnique({
      where: { id: session.id },
      select: { name: true, email: true },
    }),
    prisma.notification.count({ where: { customerId: session.id, read: false } }),
  ])

  return (
    <>
      <div className="bg-white border-b border-gray-100 shadow-sm">
        <div className="max-w-4xl mx-auto px-4 pt-6 pb-0 flex items-start justify-between">
          <div>
            <p className="text-xs text-gray-400 mb-0.5">Bienvenido de vuelta</p>
            <h1 className="text-xl font-bold text-gray-900">{customer?.name}</h1>
            <p className="text-xs text-gray-400 mt-0.5">{customer?.email}</p>
          </div>
          <form action="/api/auth/logout" method="POST" className="mt-1">
            <button type="submit"
              className="flex items-center gap-1.5 text-xs text-gray-500 hover:text-red-500 border border-gray-200 hover:border-red-200 px-3 py-1.5 rounded-lg transition-colors">
              <LogOut size={13} />
              Cerrar sesión
            </button>
          </form>
        </div>
        <div className="max-w-4xl mx-auto px-4 mt-4">
          <CuentaNav unreadCount={unreadCount} />
        </div>
      </div>
      <div className="max-w-4xl mx-auto px-4 py-8">
        {children}
      </div>
    </>
  )
}
