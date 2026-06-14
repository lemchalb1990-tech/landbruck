'use client'
import Link from 'next/link'
import Image from 'next/image'
import { Trash2, Plus, Minus } from 'lucide-react'
import { useCart } from '@/context/CartContext'

export default function CarritoPage() {
  const { items, removeItem, updateQuantity, total } = useCart()

  if (items.length === 0) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-20 text-center">
        <p className="text-gray-400 text-lg mb-6">Tu carrito está vacío</p>
        <Link href="/productos" className="bg-brand-600 text-white px-6 py-3 rounded-xl font-medium hover:bg-brand-700">
          Ver productos
        </Link>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-10">
      <h1 className="text-2xl font-bold text-gray-800 mb-8">Tu carrito</h1>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">

        {/* Items */}
        <div className="md:col-span-2 space-y-4">
          {items.map(item => (
            <div key={item.id} className="bg-white rounded-xl border border-gray-100 p-4 flex gap-4">
              <div className="relative w-20 h-20 shrink-0 bg-gray-50 rounded-lg overflow-hidden">
                <Image src={item.image} alt={item.name} fill className="object-cover" />
              </div>
              <div className="flex-1">
                <h3 className="font-medium text-gray-800">{item.name}</h3>
                <p className="text-brand-700 font-bold mt-1">
                  ${Number(item.price).toLocaleString('es-CL')}
                </p>
                <div className="flex items-center gap-3 mt-2">
                  <button onClick={() => updateQuantity(item.id, item.quantity - 1)} className="w-7 h-7 rounded-full border flex items-center justify-center hover:border-brand-500">
                    <Minus size={13} />
                  </button>
                  <span className="text-sm font-medium w-5 text-center">{item.quantity}</span>
                  <button onClick={() => updateQuantity(item.id, item.quantity + 1)} className="w-7 h-7 rounded-full border flex items-center justify-center hover:border-brand-500">
                    <Plus size={13} />
                  </button>
                </div>
              </div>
              <button onClick={() => removeItem(item.id)} className="text-gray-400 hover:text-red-500 self-start">
                <Trash2 size={18} />
              </button>
            </div>
          ))}
        </div>

        {/* Resumen */}
        <div className="bg-white rounded-xl border border-gray-100 p-6 h-fit">
          <h2 className="font-semibold text-gray-800 mb-4">Resumen</h2>
          <div className="flex justify-between text-sm text-gray-600 mb-2">
            <span>Subtotal</span>
            <span>${total.toLocaleString('es-CL')}</span>
          </div>
          <div className="flex justify-between text-sm text-gray-600 mb-4">
            <span>Envío</span>
            <span className="text-green-600">Calculado al pagar</span>
          </div>
          <div className="border-t pt-4 flex justify-between font-bold text-gray-900">
            <span>Total</span>
            <span>${total.toLocaleString('es-CL')}</span>
          </div>
          <Link
            href="/checkout"
            className="mt-6 block text-center bg-brand-600 hover:bg-brand-700 text-white font-semibold py-3 rounded-xl transition-colors"
          >
            Proceder al pago
          </Link>
        </div>
      </div>
    </div>
  )
}
