'use client'
import Link from 'next/link'
import { ShoppingCart, User, Menu, X, Search } from 'lucide-react'
import { useState } from 'react'
import { useCart } from '@/context/CartContext'

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false)
  const { count } = useCart()

  return (
    <header className="bg-white shadow-sm sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 flex items-center justify-between h-16">
        <Link href="/" className="text-2xl font-bold text-brand-700">
          Landbruk
        </Link>

        <nav className="hidden md:flex gap-6 text-sm font-medium text-gray-600">
          <Link href="/productos" className="hover:text-brand-600">Productos</Link>
          <Link href="/productos?categoria=semillas" className="hover:text-brand-600">Semillas</Link>
          <Link href="/productos?categoria=insumos" className="hover:text-brand-600">Insumos</Link>
        </nav>

        <div className="flex items-center gap-4">
          <Link href="/buscar" className="text-gray-500 hover:text-brand-600">
            <Search size={20} />
          </Link>
          <Link href="/cuenta" className="text-gray-500 hover:text-brand-600">
            <User size={20} />
          </Link>
          <Link href="/carrito" className="relative text-gray-500 hover:text-brand-600">
            <ShoppingCart size={20} />
            {count > 0 && (
              <span className="absolute -top-2 -right-2 bg-brand-600 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center">
                {count}
              </span>
            )}
          </Link>
          <button className="md:hidden" onClick={() => setMenuOpen(!menuOpen)}>
            {menuOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </div>

      {menuOpen && (
        <div className="md:hidden bg-white border-t px-4 py-4 flex flex-col gap-3 text-sm font-medium text-gray-700">
          <Link href="/productos" onClick={() => setMenuOpen(false)}>Productos</Link>
          <Link href="/productos?categoria=semillas" onClick={() => setMenuOpen(false)}>Semillas</Link>
          <Link href="/productos?categoria=insumos" onClick={() => setMenuOpen(false)}>Insumos</Link>
          <Link href="/cuenta" onClick={() => setMenuOpen(false)}>Mi cuenta</Link>
        </div>
      )}
    </header>
  )
}
