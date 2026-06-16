'use client'
import Link from 'next/link'
import Image from 'next/image'
import { ShoppingCart, User, Menu, X, Package } from 'lucide-react'
import { useState } from 'react'
import { useCart } from '@/context/CartContext'

interface LogoConfig { type: 'text' | 'image'; value: string }
interface NavItem { href: string; label: string }

const DEFAULT_NAV_LINKS: NavItem[] = [
  { href: '/', label: 'Inicio' },
  { href: '/productos', label: 'Productos' },
  { href: '/nosotros', label: 'Nosotros' },
  { href: '/contacto', label: 'Contacto' },
]

export default function Navbar({
  logo, navItems, customerName,
}: {
  logo?: LogoConfig; navItems?: NavItem[]; customerName?: string | null
}) {
  const navLinks = navItems && navItems.length > 0 ? navItems : DEFAULT_NAV_LINKS
  const [menuOpen, setMenuOpen] = useState(false)
  const { count } = useCart()

  const firstName = customerName?.split(' ')[0] ?? null

  return (
    <header className="bg-white shadow-sm sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 flex items-center justify-between h-16">

        {/* Logo */}
        <Link href="/" className="flex items-center shrink-0">
          {logo?.type === 'image' ? (
            <Image src={logo.value} alt="Logo" width={140} height={40} className="object-contain h-10 w-auto" />
          ) : (
            <span className="text-2xl font-bold text-brand-700">{logo?.value || 'Landbruck'}</span>
          )}
        </Link>

        {/* Nav desktop */}
        <nav className="hidden md:flex gap-6 text-sm font-medium text-gray-600">
          {navLinks.map(l => (
            <Link key={l.href} href={l.href} className="hover:text-brand-600 transition-colors">{l.label}</Link>
          ))}
        </nav>

        {/* Iconos + usuario */}
        <div className="flex items-center gap-3">
          {firstName ? (
            <Link href="/cuenta/pedidos"
              className="hidden md:flex items-center gap-1.5 text-sm font-medium text-brand-700 hover:text-brand-800 transition-colors">
              <User size={18} />
              {firstName}
            </Link>
          ) : (
            <Link href="/cuenta/login" className="text-gray-500 hover:text-brand-600 transition-colors">
              <User size={20} />
            </Link>
          )}
          <Link href="/carrito" className="relative text-gray-500 hover:text-brand-600 transition-colors">
            <ShoppingCart size={20} />
            {count > 0 && (
              <span className="absolute -top-2 -right-2 bg-brand-600 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center">
                {count}
              </span>
            )}
          </Link>
          <button className="md:hidden text-gray-500" onClick={() => setMenuOpen(!menuOpen)}>
            {menuOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </div>

      {/* Menú móvil */}
      {menuOpen && (
        <div className="md:hidden bg-white border-t border-gray-100 px-4 py-3 flex flex-col gap-1">
          {navLinks.map(l => (
            <Link
              key={l.href}
              href={l.href}
              onClick={() => setMenuOpen(false)}
              className="py-2 px-3 rounded-lg text-sm font-medium text-gray-700 hover:bg-brand-50 hover:text-brand-700 transition-colors"
            >
              {l.label}
            </Link>
          ))}
          {firstName ? (
            <Link
              href="/cuenta/pedidos"
              onClick={() => setMenuOpen(false)}
              className="py-2 px-3 rounded-lg text-sm font-medium text-brand-700 hover:bg-brand-50 flex items-center gap-2 transition-colors"
            >
              <Package size={16} />
              Mis pedidos ({firstName})
            </Link>
          ) : (
            <Link
              href="/cuenta/login"
              onClick={() => setMenuOpen(false)}
              className="py-2 px-3 rounded-lg text-sm font-medium text-gray-700 hover:bg-brand-50 hover:text-brand-700 transition-colors"
            >
              Mi cuenta
            </Link>
          )}
        </div>
      )}
    </header>
  )
}
