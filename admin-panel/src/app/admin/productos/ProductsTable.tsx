'use client'
import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { Pencil, ToggleLeft, ToggleRight, Trash2 } from 'lucide-react'
import { useRouter } from 'next/navigation'

interface Product {
  id: number
  name: string
  price: unknown
  stock: number
  active: boolean
  images: string[]
  category: { name: string } | null
}

export default function ProductsTable({ initialProducts }: { initialProducts: Product[] }) {
  const [products, setProducts] = useState(initialProducts)
  const [loadingId, setLoadingId] = useState<number | null>(null)
  const router = useRouter()

  const toggleActive = async (id: number, current: boolean) => {
    setLoadingId(id)
    setProducts(prev => prev.map(p => p.id === id ? { ...p, active: !current } : p))
    try {
      await fetch(`/api/productos/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ active: !current }),
      })
    } catch {
      setProducts(prev => prev.map(p => p.id === id ? { ...p, active: current } : p))
    } finally {
      setLoadingId(null)
    }
  }

  const deleteProduct = async (id: number, name: string) => {
    if (!confirm(`¿Eliminar "${name}"? Esta acción no se puede deshacer.`)) return
    await fetch(`/api/productos/${id}`, { method: 'DELETE' })
    setProducts(prev => prev.filter(p => p.id !== id))
    router.refresh()
  }

  return (
    <div className="bg-white rounded-xl shadow-sm overflow-hidden">
      <table className="w-full text-sm">
        <thead className="bg-gray-50 border-b border-gray-100">
          <tr className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">
            <th className="px-4 py-3 w-16">Foto</th>
            <th className="px-4 py-3">Nombre</th>
            <th className="px-4 py-3 hidden md:table-cell">Categoría</th>
            <th className="px-4 py-3">Precio</th>
            <th className="px-4 py-3 hidden sm:table-cell">Stock</th>
            <th className="px-4 py-3">Estado</th>
            <th className="px-4 py-3 text-right">Acciones</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-50">
          {products.map(p => (
            <tr key={p.id} className="hover:bg-gray-50/70 transition-colors">
              {/* Foto */}
              <td className="px-4 py-3">
                <div className="w-10 h-10 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
                  {p.images[0] ? (
                    <Image
                      src={p.images[0]}
                      alt={p.name}
                      width={40}
                      height={40}
                      className="object-cover w-full h-full"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-300 text-xs">—</div>
                  )}
                </div>
              </td>

              {/* Nombre */}
              <td className="px-4 py-3">
                <span className="font-medium text-gray-800">{p.name}</span>
              </td>

              {/* Categoría */}
              <td className="px-4 py-3 text-gray-500 hidden md:table-cell">
                {p.category?.name ?? <span className="text-gray-300">—</span>}
              </td>

              {/* Precio */}
              <td className="px-4 py-3 font-semibold text-gray-700">
                ${Number(p.price).toLocaleString('es-CL')}
              </td>

              {/* Stock */}
              <td className="px-4 py-3 hidden sm:table-cell">
                <span className={`font-medium ${p.stock === 0 ? 'text-red-500' : 'text-gray-700'}`}>
                  {p.stock}
                </span>
              </td>

              {/* Toggle estado */}
              <td className="px-4 py-3">
                <button
                  onClick={() => toggleActive(p.id, p.active)}
                  disabled={loadingId === p.id}
                  className={`flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full transition-all disabled:opacity-50 ${
                    p.active
                      ? 'bg-green-100 text-green-700 hover:bg-green-200'
                      : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                  }`}
                  title={p.active ? 'Clic para desactivar' : 'Clic para publicar'}
                >
                  {p.active
                    ? <><ToggleRight size={14} /> Publicado</>
                    : <><ToggleLeft size={14} /> Inactivo</>
                  }
                </button>
              </td>

              {/* Acciones */}
              <td className="px-4 py-3">
                <div className="flex items-center justify-end gap-2">
                  <Link
                    href={`/admin/productos/${p.id}`}
                    className="flex items-center gap-1 text-xs text-gray-500 hover:text-brand-600 bg-gray-100 hover:bg-brand-50 px-2.5 py-1.5 rounded-lg transition-colors font-medium"
                  >
                    <Pencil size={13} /> Editar
                  </Link>
                  <button
                    onClick={() => deleteProduct(p.id, p.name)}
                    className="flex items-center gap-1 text-xs text-gray-400 hover:text-red-600 bg-gray-100 hover:bg-red-50 px-2.5 py-1.5 rounded-lg transition-colors font-medium"
                  >
                    <Trash2 size={13} />
                  </button>
                </div>
              </td>
            </tr>
          ))}
          {products.length === 0 && (
            <tr>
              <td colSpan={7} className="px-4 py-14 text-center text-gray-400">
                Sin productos aún
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  )
}
