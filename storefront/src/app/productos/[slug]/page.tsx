'use client'
import { useEffect, useState } from 'react'
import Image from 'next/image'
import { useCart } from '@/context/CartContext'
import { ShoppingCart, Check } from 'lucide-react'

interface Product {
  id: number
  name: string
  slug: string
  description: string | null
  price: number
  stock: number
  images: string[]
  category: { name: string } | null
}

export default function ProductoPage({ params }: { params: { slug: string } }) {
  const [product, setProduct] = useState<Product | null>(null)
  const [added, setAdded] = useState(false)
  const [selectedImage, setSelectedImage] = useState(0)
  const { addItem } = useCart()

  useEffect(() => {
    fetch(`/api/productos/${params.slug}`)
      .then(r => r.json())
      .then(setProduct)
  }, [params.slug])

  const handleAdd = () => {
    if (!product) return
    addItem({
      id: product.id,
      name: product.name,
      price: product.price,
      image: product.images[0] ?? '/placeholder.jpg',
    })
    setAdded(true)
    setTimeout(() => setAdded(false), 2000)
  }

  if (!product) {
    return <div className="max-w-4xl mx-auto px-4 py-20 text-center text-gray-400">Cargando...</div>
  }

  const image = product.images[selectedImage] ?? '/placeholder.jpg'

  return (
    <div className="max-w-5xl mx-auto px-4 py-10">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-10">

        {/* Imágenes */}
        <div>
          <div className="relative h-80 bg-gray-100 rounded-xl overflow-hidden">
            <Image src={image} alt={product.name} fill className="object-cover" />
          </div>
          {product.images.length > 1 && (
            <div className="flex gap-2 mt-3">
              {product.images.map((img, i) => (
                <button
                  key={i}
                  onClick={() => setSelectedImage(i)}
                  className={`relative w-16 h-16 rounded-lg overflow-hidden border-2 ${i === selectedImage ? 'border-brand-600' : 'border-transparent'}`}
                >
                  <Image src={img} alt="" fill className="object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Info */}
        <div>
          {product.category && (
            <span className="text-xs font-medium text-brand-600 uppercase tracking-wide">
              {product.category.name}
            </span>
          )}
          <h1 className="text-2xl font-bold text-gray-900 mt-1">{product.name}</h1>
          <p className="text-3xl font-bold text-brand-700 mt-3">
            ${Number(product.price).toLocaleString('es-CL')}
          </p>

          {product.description && (
            <p className="text-gray-600 mt-4 leading-relaxed">{product.description}</p>
          )}

          <div className="mt-6">
            {product.stock === 0 ? (
              <p className="text-red-500 font-medium">Sin stock disponible</p>
            ) : (
              <>
                <p className="text-sm text-gray-500 mb-3">{product.stock} unidades disponibles</p>
                <button
                  onClick={handleAdd}
                  className="w-full flex items-center justify-center gap-2 bg-brand-600 hover:bg-brand-700 text-white font-semibold py-3 rounded-xl transition-colors"
                >
                  {added ? <><Check size={18} /> Agregado</> : <><ShoppingCart size={18} /> Agregar al carrito</>}
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
