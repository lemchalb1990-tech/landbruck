export const dynamic = 'force-dynamic'

import { redirect } from 'next/navigation'
import { getSession } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import { Mail, CheckCircle, AlertCircle, Package } from 'lucide-react'

const TYPE_META: Record<string, { label: string; icon: typeof Mail; color: string }> = {
  ORDER_CREATED:     { label: 'Pedido recibido',  icon: Package,      color: 'text-gray-500' },
  EMAIL_SENT:        { label: 'Correo enviado',   icon: Mail,         color: 'text-blue-500' },
  PAYMENT_CONFIRMED: { label: 'Pago confirmado',  icon: CheckCircle,  color: 'text-green-500' },
  ORDER_CANCELLED:   { label: 'Pedido cancelado', icon: AlertCircle,  color: 'text-red-500' },
}

export default async function DocumentosPage() {
  const session = getSession()
  if (!session) redirect('/cuenta/login')

  const notifications = await prisma.notification.findMany({
    where: {
      customerId: session.id,
      type: { in: ['EMAIL_SENT', 'ORDER_CREATED', 'PAYMENT_CONFIRMED', 'ORDER_CANCELLED'] },
    },
    orderBy: { createdAt: 'desc' },
  })

  const grouped = notifications.reduce<Record<string, typeof notifications>>((acc, n) => {
    const key = format(new Date(n.createdAt), 'MMMM yyyy', { locale: es })
    if (!acc[key]) acc[key] = []
    acc[key].push(n)
    return acc
  }, {})

  return (
    <div>
      <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-5">
        Historial de documentos
      </h2>

      {notifications.length === 0 ? (
        <p className="text-center py-16 text-sm text-gray-400">Sin documentos aún.</p>
      ) : (
        <div className="space-y-6">
          {Object.entries(grouped).map(([month, items]) => (
            <section key={month}>
              <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1 capitalize">
                {month}
              </h3>
              <ul className="divide-y divide-gray-100">
                {items.map(n => {
                  const meta = TYPE_META[n.type] ?? { label: n.title, icon: Mail, color: 'text-gray-500' }
                  const Icon = meta.icon
                  return (
                    <li key={n.id} className="py-3 flex items-start gap-3">
                      <Icon size={15} className={`mt-0.5 shrink-0 ${meta.color}`} />
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center justify-between gap-2">
                          <span className="text-xs font-semibold text-gray-700">{meta.label}</span>
                          <span className="text-[11px] text-gray-400 shrink-0">
                            {format(new Date(n.createdAt), "d MMM yyyy, HH:mm", { locale: es })}
                          </span>
                        </div>
                        <p className="text-xs text-gray-500 mt-0.5">{n.body}</p>
                      </div>
                    </li>
                  )
                })}
              </ul>
            </section>
          ))}
        </div>
      )}
    </div>
  )
}
