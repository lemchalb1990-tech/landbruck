'use client'
import { useState } from 'react'
import { useCart } from '@/context/CartContext'
import { useForm } from 'react-hook-form'
import { useRouter } from 'next/navigation'

interface CheckoutForm {
  name: string
  email: string
  phone: string
  address: string
  city: string
}

export default function CheckoutPage() {
  const { items, total, clearCart } = useCart()
  const { register, handleSubmit, formState: { errors } } = useForm<CheckoutForm>()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const router = useRouter()

  const onSubmit = async (data: CheckoutForm) => {
    setLoading(true)
    setError('')
    try {
      const res = await fetch('/api/pedidos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...data, items }),
      })
      if (!res.ok) throw new Error('Error al procesar el pedido')
      const { id } = await res.json()
      clearCart()
      router.push(`/cuenta/pedidos/${id}?nuevo=1`)
    } catch {
      setError('Hubo un error al procesar tu pedido. Intenta nuevamente.')
    } finally {
      setLoading(false)
    }
  }

  if (items.length === 0) {
    return (
      <div className="max-w-xl mx-auto px-4 py-20 text-center text-gray-400">
        No tienes productos en el carrito.
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-10">
      <h1 className="text-2xl font-bold text-gray-800 mb-8">Finalizar compra</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <h2 className="font-semibold text-gray-700">Datos de envío</h2>

          {[
            { name: 'name', label: 'Nombre completo', placeholder: 'Juan Pérez' },
            { name: 'email', label: 'Email', placeholder: 'juan@email.com' },
            { name: 'phone', label: 'Teléfono', placeholder: '+56 9 1234 5678' },
            { name: 'address', label: 'Dirección', placeholder: 'Calle 123, Depto 4' },
            { name: 'city', label: 'Ciudad', placeholder: 'Santiago' },
          ].map(field => (
            <div key={field.name}>
              <label className="block text-sm font-medium text-gray-700 mb-1">{field.label}</label>
              <input
                {...register(field.name as keyof CheckoutForm, { required: 'Campo requerido' })}
                placeholder={field.placeholder}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
              />
              {errors[field.name as keyof CheckoutForm] && (
                <p className="text-xs text-red-500 mt-1">{errors[field.name as keyof CheckoutForm]?.message}</p>
              )}
            </div>
          ))}

          {error && <p className="text-sm text-red-500">{error}</p>}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-brand-600 hover:bg-brand-700 disabled:opacity-50 text-white font-semibold py-3 rounded-xl transition-colors"
          >
            {loading ? 'Procesando...' : 'Confirmar pedido'}
          </button>
        </form>

        {/* Resumen */}
        <div className="bg-white rounded-xl border border-gray-100 p-6 h-fit">
          <h2 className="font-semibold text-gray-700 mb-4">Tu pedido</h2>
          <ul className="space-y-3 mb-4">
            {items.map(item => (
              <li key={item.id} className="flex justify-between text-sm text-gray-600">
                <span>{item.name} x{item.quantity}</span>
                <span>${(item.price * item.quantity).toLocaleString('es-CL')}</span>
              </li>
            ))}
          </ul>
          <div className="border-t pt-3 flex justify-between font-bold text-gray-900">
            <span>Total</span>
            <span>${total.toLocaleString('es-CL')}</span>
          </div>
        </div>
      </div>
    </div>
  )
}
