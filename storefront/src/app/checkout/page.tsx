'use client'
import { useState, useEffect } from 'react'
import { useCart } from '@/context/CartContext'
import { useForm } from 'react-hook-form'
import { CreditCard, Landmark, Truck } from 'lucide-react'

interface CheckoutForm {
  name: string; email: string; phone: string; address: string; city: string
}
interface PaymentConfig {
  mercadopago: { enabled: boolean; publicKey: string }
  flow: { enabled: boolean }
}

const PAYMENT_LABELS: Record<string, { label: string; desc: string }> = {
  mercadopago: { label: 'MercadoPago', desc: 'Tarjeta, transferencia y más' },
  flow:        { label: 'Flow',        desc: 'Tarjeta de crédito/débito' },
}

export default function CheckoutPage() {
  const { items, total, clearCart } = useCart()
  const { register, handleSubmit, watch, formState: { errors } } = useForm<CheckoutForm>()
  const [loading, setLoading]           = useState(false)
  const [error, setError]               = useState('')
  const [payConfig, setPayConfig]       = useState<PaymentConfig | null>(null)
  const [payMethod, setPayMethod]       = useState<string>('')
  const [shippingEnabled, setShippingEnabled] = useState(false)
  const [shippingCost, setShippingCost]       = useState(0)
  const [loadingShipping, setLoadingShipping] = useState(false)

  const cityValue = watch('city', '')

  // Carga inicial: configuración de pagos + costo de envío base
  useEffect(() => {
    fetch('/api/pagos/config').then(r => r.json()).then((data: PaymentConfig) => {
      setPayConfig(data)
      if (data.mercadopago?.enabled) setPayMethod('mercadopago')
      else if (data.flow?.enabled)   setPayMethod('flow')
    })
    fetch('/api/envio/cotizar').then(r => r.json()).then(data => {
      setShippingEnabled(data.enabled)
      setShippingCost(data.shippingCost ?? 0)
    })
  }, [])

  // Recalcula costo según ciudad ingresada (debounce 600ms)
  useEffect(() => {
    if (!shippingEnabled || cityValue.trim().length < 3) return
    setLoadingShipping(true)
    const t = setTimeout(() => {
      fetch(`/api/envio/cotizar?city=${encodeURIComponent(cityValue.trim())}`)
        .then(r => r.json())
        .then(data => setShippingCost(data.shippingCost ?? 0))
        .finally(() => setLoadingShipping(false))
    }, 600)
    return () => clearTimeout(t)
  }, [cityValue, shippingEnabled])

  const grandTotal = total + shippingCost

  const enabled = payConfig
    ? [
        ...(payConfig.mercadopago?.enabled ? ['mercadopago'] : []),
        ...(payConfig.flow?.enabled        ? ['flow']        : []),
      ]
    : []

  const onSubmit = async (data: CheckoutForm) => {
    if (!payMethod) { setError('Selecciona un método de pago'); return }
    setLoading(true); setError('')
    try {
      const orderRes = await fetch('/api/pedidos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...data, items, paymentProvider: payMethod, shippingCost }),
      })
      if (!orderRes.ok) throw new Error('Error al crear el pedido')
      const { id: orderId, loginToken } = await orderRes.json()

      if (loginToken) {
        await fetch('/api/auth/autologin', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ token: loginToken }),
        })
      }

      const payRes = await fetch(`/api/pagos/${payMethod}?orderId=${orderId}`)
      if (!payRes.ok) {
        const err = await payRes.json()
        throw new Error(err.error || 'Error al procesar el pago')
      }
      const { url } = await payRes.json()
      clearCart()
      window.location.href = url
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Error al procesar tu pedido.')
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
          {([
            { name: 'name',    label: 'Nombre completo', placeholder: 'Juan Pérez' },
            { name: 'email',   label: 'Email',           placeholder: 'juan@email.com' },
            { name: 'phone',   label: 'Teléfono',        placeholder: '+56 9 1234 5678' },
            { name: 'address', label: 'Dirección',       placeholder: 'Calle 123, Depto 4' },
            { name: 'city',    label: 'Ciudad / Región', placeholder: 'Ej: Temuco, Puerto Montt' },
          ] as const).map(field => (
            <div key={field.name}>
              <label className="block text-sm font-medium text-gray-700 mb-1">{field.label}</label>
              <input
                {...register(field.name, { required: 'Campo requerido' })}
                placeholder={field.placeholder}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
              />
              {errors[field.name] && (
                <p className="text-xs text-red-500 mt-1">{errors[field.name]?.message}</p>
              )}
            </div>
          ))}

          {/* Método de pago */}
          {enabled.length > 0 && (
            <div>
              <h2 className="font-semibold text-gray-700 mb-2">Método de pago</h2>
              <div className="space-y-2">
                {enabled.map(method => (
                  <label key={method}
                    className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${payMethod === method ? 'border-brand-500 bg-brand-50' : 'border-gray-200 hover:border-gray-300'}`}>
                    <input type="radio" name="payMethod" value={method}
                      checked={payMethod === method} onChange={() => setPayMethod(method)} className="text-brand-600" />
                    <CreditCard size={18} className="text-gray-500 shrink-0" />
                    <div>
                      <p className="text-sm font-medium text-gray-800">{PAYMENT_LABELS[method]?.label}</p>
                      <p className="text-xs text-gray-500">{PAYMENT_LABELS[method]?.desc}</p>
                    </div>
                  </label>
                ))}
              </div>
            </div>
          )}

          {enabled.length === 0 && payConfig !== null && (
            <div className="flex items-center gap-2 p-3 bg-amber-50 border border-amber-200 rounded-lg text-sm text-amber-700">
              <Landmark size={16} />
              No hay métodos de pago habilitados. Contacta al administrador.
            </div>
          )}

          {error && <p className="text-sm text-red-500">{error}</p>}

          <button type="submit" disabled={loading || enabled.length === 0}
            className="w-full bg-brand-600 hover:bg-brand-700 disabled:opacity-50 text-white font-semibold py-3 rounded-xl transition-colors">
            {loading ? 'Procesando...' : 'Ir a pagar'}
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
          <div className="border-t pt-3 space-y-2">
            <div className="flex justify-between text-sm text-gray-600">
              <span>Subtotal</span>
              <span>${total.toLocaleString('es-CL')}</span>
            </div>
            {shippingEnabled && (
              <div className="flex justify-between text-sm text-gray-600">
                <span className="flex items-center gap-1.5">
                  <Truck size={14} />
                  Envío Starken
                </span>
                <span className={loadingShipping ? 'text-gray-400 text-xs' : ''}>
                  {loadingShipping
                    ? 'Calculando...'
                    : shippingCost === 0
                      ? 'Gratis'
                      : `$${shippingCost.toLocaleString('es-CL')}`}
                </span>
              </div>
            )}
            <div className="flex justify-between font-bold text-gray-900 border-t pt-2">
              <span>Total</span>
              <span>${grandTotal.toLocaleString('es-CL')}</span>
            </div>
          </div>
        </div>

      </div>
    </div>
  )
}
