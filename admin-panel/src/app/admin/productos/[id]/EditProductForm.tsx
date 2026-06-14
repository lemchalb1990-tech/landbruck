'use client'
import { useForm } from 'react-hook-form'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { Upload, X, ArrowLeft, ToggleLeft, ToggleRight } from 'lucide-react'

interface Category { id: number; name: string }
interface Product {
  id: number; name: string; slug: string; description: string | null
  price: number; stock: number; categoryId: number | null
  featured: boolean; active: boolean; images: string[]
}
interface FormValues {
  name: string; slug: string; description: string
  price: number; stock: number; categoryId: string
  featured: boolean; active: boolean
}

export default function EditProductForm({ product, categories }: { product: Product; categories: Category[] }) {
  const { register, handleSubmit, watch, setValue, formState: { errors } } = useForm<FormValues>({
    defaultValues: {
      name: product.name,
      slug: product.slug,
      description: product.description ?? '',
      price: product.price,
      stock: product.stock,
      categoryId: product.categoryId ? String(product.categoryId) : '',
      featured: product.featured,
      active: product.active,
    },
  })
  const [images, setImages] = useState<string[]>(product.images)
  const [uploading, setUploading] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const router = useRouter()
  const active = watch('active')
  const name = watch('name')

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? [])
    if (!files.length) return
    setUploading(true)
    try {
      const urls = await Promise.all(files.map(async file => {
        const form = new FormData()
        form.append('file', file)
        const res = await fetch('/api/upload', { method: 'POST', body: form })
        const { url } = await res.json()
        return url as string
      }))
      setImages(prev => [...prev, ...urls])
    } finally {
      setUploading(false)
    }
  }

  const removeImage = (url: string) => setImages(prev => prev.filter(u => u !== url))

  const onSubmit = async (data: FormValues) => {
    setLoading(true); setError('')
    try {
      const res = await fetch(`/api/productos/${product.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...data,
          price: Number(data.price),
          stock: Number(data.stock),
          categoryId: data.categoryId ? Number(data.categoryId) : null,
          images,
        }),
      })
      if (!res.ok) throw new Error((await res.json()).error)
      router.push('/admin/productos')
      router.refresh()
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Error al guardar')
    } finally { setLoading(false) }
  }

  return (
    <div className="max-w-2xl">
      <div className="flex items-center gap-3 mb-6">
        <button onClick={() => router.back()} className="text-gray-400 hover:text-gray-600">
          <ArrowLeft size={20} />
        </button>
        <h1 className="text-2xl font-bold text-gray-900 flex-1">Editar producto</h1>

        {/* Toggle de estado prominente */}
        <button
          type="button"
          onClick={() => setValue('active', !active)}
          className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold transition-all border-2 ${
            active
              ? 'bg-green-50 text-green-700 border-green-300 hover:bg-green-100'
              : 'bg-gray-50 text-gray-500 border-gray-300 hover:bg-gray-100'
          }`}
        >
          {active ? <ToggleRight size={18} /> : <ToggleLeft size={18} />}
          {active ? 'Publicado' : 'Inactivo'}
        </button>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="bg-white rounded-xl shadow-sm p-6 space-y-5">

        {/* Imágenes */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Imágenes</label>
          <div className="flex flex-wrap gap-3">
            {images.map((url, i) => (
              <div key={url} className="relative w-24 h-24 rounded-lg overflow-hidden border border-gray-200 group">
                <Image src={url} alt="" fill className="object-cover" />
                {i === 0 && (
                  <span className="absolute bottom-0 left-0 right-0 bg-black/50 text-white text-[10px] text-center py-0.5">
                    Principal
                  </span>
                )}
                <button
                  type="button"
                  onClick={() => removeImage(url)}
                  className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-0.5 opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <X size={12} />
                </button>
              </div>
            ))}
            <label className={`w-24 h-24 flex flex-col items-center justify-center border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-brand-600 transition-colors ${uploading ? 'opacity-50' : ''}`}>
              <Upload size={20} className="text-gray-400 mb-1" />
              <span className="text-xs text-gray-400">{uploading ? 'Subiendo...' : 'Agregar'}</span>
              <input type="file" multiple accept="image/*" className="hidden" onChange={handleImageUpload} disabled={uploading} />
            </label>
          </div>
          <p className="text-xs text-gray-400 mt-2">La primera imagen es la principal. Pasa el cursor para eliminar.</p>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">Nombre</label>
            <input
              {...register('name', { required: 'Requerido' })}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-600"
              onChange={e => {
                setValue('name', e.target.value)
                setValue('slug', e.target.value.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, ''))
              }}
            />
            {errors.name && <p className="text-xs text-red-500 mt-1">{errors.name.message}</p>}
          </div>

          <div className="col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">Slug (URL)</label>
            <input
              {...register('slug', { required: 'Requerido' })}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-600 font-mono text-xs"
            />
          </div>

          <div className="col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">Descripción</label>
            <textarea
              {...register('description')}
              rows={3}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-600 resize-none"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Precio ($)</label>
            <input
              type="number"
              step="0.01"
              {...register('price', { required: 'Requerido' })}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-600"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Stock</label>
            <input
              type="number"
              {...register('stock')}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-600"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Categoría</label>
            <select
              {...register('categoryId')}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-600"
            >
              <option value="">Sin categoría</option>
              {categories.map(c => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>

          <div className="flex items-center pt-6">
            <label className="flex items-center gap-2 text-sm cursor-pointer">
              <input type="checkbox" {...register('featured')} className="rounded accent-brand-600" />
              <span className="text-gray-700 font-medium">Producto destacado</span>
            </label>
          </div>
        </div>

        {error && <p className="text-sm text-red-500 bg-red-50 rounded-lg p-3">{error}</p>}

        <div className="flex gap-3 pt-2 border-t border-gray-100">
          <button
            type="submit"
            disabled={loading}
            className="bg-brand-600 hover:bg-brand-700 disabled:opacity-50 text-white font-medium px-6 py-2.5 rounded-lg text-sm transition-colors"
          >
            {loading ? 'Guardando...' : 'Guardar cambios'}
          </button>
          <button
            type="button"
            onClick={() => router.back()}
            className="border border-gray-300 text-gray-600 font-medium px-6 py-2.5 rounded-lg text-sm hover:bg-gray-50 transition-colors"
          >
            Cancelar
          </button>
        </div>
      </form>
    </div>
  )
}
