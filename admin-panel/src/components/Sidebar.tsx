'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { LayoutDashboard, Package, ShoppingBag, Users, FileText, Palette, Menu, LogOut } from 'lucide-react'
import clsx from 'clsx'

const links = [
  { href: '/admin',          label: 'Dashboard',      icon: LayoutDashboard },
  { href: '/admin/productos', label: 'Productos',      icon: Package },
  { href: '/admin/pedidos',   label: 'Pedidos',        icon: ShoppingBag },
  { href: '/admin/clientes',  label: 'Clientes',       icon: Users },
  { href: '/admin/paginas',   label: 'Páginas',        icon: FileText },
  { href: '/admin/tema',      label: 'Tema y estilos', icon: Palette },
  { href: '/admin/menu',      label: 'Menú',           icon: Menu },
]

export default function Sidebar() {
  const pathname = usePathname()

  return (
    <aside className="w-64 min-h-screen bg-sidebar text-white flex flex-col">
      <div className="px-6 py-5 border-b border-white/10">
        <h1 className="text-lg font-bold">Landbruck Admin</h1>
      </div>
      <nav className="flex-1 px-3 py-4 space-y-1">
        {links.map(({ href, label, icon: Icon }) => (
          <Link key={href} href={href}
            className={clsx('flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors',
              pathname === href || (href !== '/admin' && pathname.startsWith(href))
                ? 'bg-white/10 text-white'
                : 'text-white/70 hover:bg-white/5 hover:text-white'
            )}>
            <Icon size={18} />
            {label}
          </Link>
        ))}
      </nav>
      <div className="px-3 py-4 border-t border-white/10">
        <form action="/api/auth/logout" method="POST">
          <button type="submit"
            className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-white/70 hover:bg-white/5 hover:text-white w-full transition-colors">
            <LogOut size={18} />
            Cerrar sesión
          </button>
        </form>
      </div>
    </aside>
  )
}
