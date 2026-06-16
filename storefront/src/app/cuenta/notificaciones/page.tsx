export const dynamic = 'force-dynamic'

import { redirect } from 'next/navigation'
import { getSession } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { formatDistanceToNow } from 'date-fns'
import { es } from 'date-fns/locale'
import {
  Package, CheckCircle2, Truck, MailCheck, XCircle, Clock, BellOff,
} from 'lucide-react'
import MarkAllRead from './MarkAllRead'

const TYPE_CONFIG: Record<string, { icon: React.ElementType; color: string; bg: string }> = {
  ORDER_CREATED:     { icon: Package,      color: 'text-blue-600',   bg: 'bg-blue-50' },
  EMAIL_SENT:        { icon: MailCheck,    color: 'text-gray-500',   bg: 'bg-gray-100' },
  PAYMENT_CONFIRMED: { icon: CheckCircle2, color: 'text-green-600',  bg: 'bg-green-50' },
  ORDER_SHIPPED:     { icon: Truck,        color: 'text-purple-600', bg: 'bg-purple-50' },
  ORDER_DELIVERED:   { icon: CheckCircle2, color: 'text-brand-600',  bg: 'bg-brand-50' },
  ORDER_CANCELLED:   { icon: XCircle,      color: 'text-red-500',    bg: 'bg-red-50' },
  SHIPPING_DISPATCHED: { icon: Truck,      color: 'text-purple-600', bg: 'bg-purple-50' },
}

const DEFAULT_TYPE = { icon: Clock, color: 'text-gray-500', bg: 'bg-gray-100' }

export default async function NotificacionesPage() {
  const session = getSession()
  if (!session) redirect('/cuenta/login')

  const notifications = await prisma.notification.findMany({
    where: { customerId: session.id },
    orderBy: { createdAt: 'desc' },
  })

  const unread = notifications.filter(n => !n.read).length

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-lg font-semibold text-gray-800">Notificaciones</h2>
          {unread > 0 && (
            <p className="text-xs text-gray-500 mt-0.5">{unread} sin leer</p>
          )}
        </div>
        {unread > 0 && <MarkAllRead />}
      </div>

      {notifications.length === 0 ? (
        <div className="text-center py-20 text-gray-400 flex flex-col items-center gap-3">
          <BellOff size={36} className="text-gray-300" />
          <p>No tienes notificaciones aún.</p>
        </div>
      ) : (
        <div className="relative">
          {/* Línea de tiempo */}
          <div className="absolute left-5 top-0 bottom-0 w-px bg-gray-100" />

          <div className="space-y-1">
            {notifications.map(n => {
              const cfg = TYPE_CONFIG[n.type] ?? DEFAULT_TYPE
              const Icon = cfg.icon
              return (
                <div key={n.id}
                  className={`relative flex gap-4 pl-12 pr-4 py-4 rounded-xl transition-colors ${n.read ? 'bg-transparent' : 'bg-brand-50/40'}`}>
                  {/* Ícono en la timeline */}
                  <div className={`absolute left-2.5 top-4 w-5 h-5 rounded-full flex items-center justify-center ${cfg.bg} z-10`}>
                    <Icon size={11} className={cfg.color} />
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <p className={`text-sm font-medium ${n.read ? 'text-gray-700' : 'text-gray-900'}`}>
                        {n.title}
                        {!n.read && <span className="ml-2 inline-block w-1.5 h-1.5 rounded-full bg-brand-600 align-middle" />}
                      </p>
                      <span className="text-xs text-gray-400 shrink-0">
                        {formatDistanceToNow(new Date(n.createdAt), { addSuffix: true, locale: es })}
                      </span>
                    </div>
                    <p className="text-sm text-gray-500 mt-0.5">{n.body}</p>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}
