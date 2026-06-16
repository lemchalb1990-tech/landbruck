'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Package, Bell } from 'lucide-react'

export default function CuentaNav({ unreadCount }: { unreadCount: number }) {
  const pathname = usePathname()

  const tabs = [
    { href: '/cuenta/pedidos',       label: 'Mis pedidos',      icon: Package },
    { href: '/cuenta/notificaciones', label: 'Notificaciones',  icon: Bell, badge: unreadCount },
  ]

  return (
    <nav className="flex gap-1 -mb-px">
      {tabs.map(({ href, label, icon: Icon, badge }) => {
        const active = pathname === href
        return (
          <Link key={href} href={href}
            className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
              active
                ? 'border-brand-600 text-brand-700'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}>
            <Icon size={16} />
            {label}
            {badge ? (
              <span className="bg-brand-600 text-white text-[10px] font-bold rounded-full min-w-[18px] h-[18px] flex items-center justify-center px-1">
                {badge > 9 ? '9+' : badge}
              </span>
            ) : null}
          </Link>
        )
      })}
    </nav>
  )
}
