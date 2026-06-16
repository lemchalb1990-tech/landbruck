import Link from 'next/link'
import { CheckCircle2, XCircle, Clock } from 'lucide-react'

interface Props {
  searchParams: { provider?: string; status?: string }
}

export default function RetornoPage({ searchParams }: Props) {
  const { status = 'pending' } = searchParams

  const states = {
    success: {
      icon: <CheckCircle2 size={56} className="text-green-500" />,
      title: '¡Pago exitoso!',
      desc: 'Tu pedido ha sido confirmado. Recibirás un email con los detalles.',
      color: 'text-green-700',
    },
    failure: {
      icon: <XCircle size={56} className="text-red-500" />,
      title: 'Pago rechazado',
      desc: 'No pudimos procesar tu pago. Puedes intentarlo nuevamente.',
      color: 'text-red-700',
    },
    pending: {
      icon: <Clock size={56} className="text-amber-500" />,
      title: 'Pago en proceso',
      desc: 'Tu pedido está siendo procesado. Te notificaremos cuando se confirme.',
      color: 'text-amber-700',
    },
  }

  const state = states[status as keyof typeof states] ?? states.pending

  return (
    <div className="max-w-md mx-auto px-4 py-20 text-center">
      <div className="flex justify-center mb-5">{state.icon}</div>
      <h1 className={`text-2xl font-bold mb-3 ${state.color}`}>{state.title}</h1>
      <p className="text-gray-600 mb-8">{state.desc}</p>
      <div className="flex flex-col sm:flex-row gap-3 justify-center">
        <Link href="/cuenta/pedidos"
          className="px-6 py-2.5 bg-brand-600 text-white rounded-xl font-medium hover:bg-brand-700 transition-colors">
          Ver mis pedidos
        </Link>
        <Link href="/productos"
          className="px-6 py-2.5 border border-gray-300 text-gray-700 rounded-xl font-medium hover:bg-gray-50 transition-colors">
          Seguir comprando
        </Link>
      </div>
    </div>
  )
}
