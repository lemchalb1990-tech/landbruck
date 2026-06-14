'use client'
import { useForm } from 'react-hook-form'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Upload, X } from 'lucide-react'
import Image from 'next/image'

interface ProductForm {
  name: string; slug: string; description: string; price: number
  stock: number; categoryId: string; featured: boolean; active: boolean
}

export default function NuevoProductoPage() {
  const { register, handleSubmit, watch, setValue, formState: { errors } } = useForm<ProductForm>({
    defaultValues: { active: true, featured: false }
  })
  const [categories, setCategories] = useState<{ id: number; name: string }[]>([])
  const [images, setImages] = useState<string[]>([])
  const [uploading, setUploading] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const router = useRouter()
  const name = watch('name')

  useEffect(() => {
    fetch('/api/categorias').then(r => r.json()).then(setCategories)
  }, [])

  useEffect(() => {
    if (name) setValue('slug', name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, ''))
  }, [name, setValue])

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

  const onSubmit = async (data: ProductForm) => {
    setLoading(true); setError('')
    try {
      const res = await fetch('/api/productos', {
        method: 'POST',
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
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Error al guardar')
    } finally { setLoading(false) }
  }

  return (
    <div className="max-w-2xl">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Nuevo producto</h1>
      <form onSubmit={handleSubmit(onSubmit)} className="bg-white rounded-xl shadow-sm p-6 space-y-4">

        {/* Imágenes */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Imágenes</label>
          <div className="flex flex-wrap gap-3 mb-3">
            {images.map(url => (
              <div key={url} className="relative w-24 h-24 rounded-lg overflow-hidden border border-gray-200">
                <Image src={url} alt="" fill className="object-cover" />
                <button type="button" onClick={() => removeImage(url)}
                  className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-0.5">
                  <X size={12} />
                </button>
              </div>
            ))}
            <label className={`w-24 h-24 flex flex-col items-center justify-center border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-brand-600 transition-colors ${uploading ? 'opacity-50' : ''}`}>
              <Upload size={20} className="text-gray-400 mb-1" />
              <span className="text-xs text-gray-400">{uploading ? 'Subiendo...' : 'Subir'}</span>
              <input type="file" multiple accept="image/*" className="hidden" onChange={handleImageUpload} disabled={uploading} />
            </label>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">Nombre</label>
            <input {...register('name', { required: 'Requerido' })}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-600" />
            {errors.name && <p className="text-xs text-red-500 mt-1">{errors.name.message}</p>}
          </div>
          <div className="col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">Slug (URL)</label>
            <input {...register('slug', { required: 'Requerido' })}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-600" />
          </div>
          <div className="col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">Descripción</label>
            <textarea {...register('description')} rows={3}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-600" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Precio ($)</label>
            <input type="number" step="0.01" {...register('price', { required: 'Requerido' })}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-600" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Stock</label>
            <input type="number" {...register('stock')}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-600" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Categoría</label>
            <select {...register('categoryId')}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-600">
              <option value="">Sin categoría</option>
              {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </div>
          <div className="flex items-center gap-4 pt-6">
            <label className="flex items-center gap-2 text-sm">
              <input type="checkbox" {...register('active')} className="rounded" /> Activo
            </label>
            <label className="flex items-center gap-2 text-sm">
              <input type="checkbox" {...register('featured')} className="rounded" /> Destacado
            </label>
          </div>
        </div>

        {error && <p className="text-sm text-red-500">{error}</p>}
        <div className="flex gap-3 pt-2">
          <button type="submit" disabled={loading}
            className="bg-brand-600 hover:bg-brand-700 disabled:opacity-50 text-white font-medium px-6 py-2 rounded-lg text-sm transition-colors">
            {loading ? 'Guardando...' : 'Guardar producto'}
          </button>
          <button type="button" onClick={() => router.back()}
            className="border border-gray-300 text-gray-600 font-medium px-6 py-2 rounded-lg text-sm hover:bg-gray-50 transition-colors">
            Cancelar
          </button>
        </div>
      </form>
    </div>
  )
}
