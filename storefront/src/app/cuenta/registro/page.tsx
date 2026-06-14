'use client'
import Link from 'next/link'
import { useForm } from 'react-hook-form'
import { useState } from 'react'
import { useRouter } from 'next/navigation'

interface RegisterForm {
  name: string
  email: string
  password: string
  phone?: string
}

export default function RegistroPage() {
  const { register, handleSubmit, formState: { errors } } = useForm<RegisterForm>()
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const onSubmit = async (data: RegisterForm) => {
    setLoading(true)
    setError('')
    try {
      const res = await fetch('/api/auth/registro', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
      if (!res.ok) {
        const { error } = await res.json()
        throw new Error(error)
      }
      router.push('/cuenta/pedidos')
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Error al registrarse')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-[60vh] flex items-center justify-center px-4">
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-8 w-full max-w-md">
        <h1 className="text-2xl font-bold text-gray-800 mb-6">Crear cuenta</h1>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {[
            { name: 'name', label: 'Nombre completo', type: 'text', required: true },
            { name: 'email', label: 'Email', type: 'email', required: true },
            { name: 'phone', label: 'Teléfono (opcional)', type: 'tel', required: false },
            { name: 'password', label: 'Contraseña', type: 'password', required: true },
          ].map(field => (
            <div key={field.name}>
              <label className="block text-sm font-medium text-gray-700 mb-1">{field.label}</label>
              <input
                type={field.type}
                {...register(field.name as keyof RegisterForm, field.required ? { required: 'Campo requerido' } : {})}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
              />
              {errors[field.name as keyof RegisterForm] && (
                <p className="text-xs text-red-500 mt-1">{errors[field.name as keyof RegisterForm]?.message}</p>
              )}
            </div>
          ))}

          {error && <p className="text-sm text-red-500">{error}</p>}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-brand-600 hover:bg-brand-700 disabled:opacity-50 text-white font-semibold py-3 rounded-xl transition-colors"
          >
            {loading ? 'Creando cuenta...' : 'Crear cuenta'}
          </button>
        </form>

        <p className="text-sm text-center text-gray-500 mt-6">
          ¿Ya tienes cuenta?{' '}
          <Link href="/cuenta/login" className="text-brand-600 hover:underline font-medium">
            Iniciar sesión
          </Link>
        </p>
      </div>
    </div>
  )
}
