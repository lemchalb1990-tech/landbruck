'use client'
import Link from 'next/link'
import Image from 'next/image'
import { ShoppingCart } from 'lucide-react'
import { useCart } from '@/context/CartContext'

interface Product {
  id: number
  name: string
  slug: string
  price: number
  images: string[]
  stock: number
}

export default function ProductCard({ product }: { product: Product }) {
  const { addItem } = useCart()
  const image = product.images[0] ?? '/placeholder.jpg'

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow">
      <Link href={`/productos/${product.slug}`}>
        <div className="relative h-52 bg-gray-50">
          <Image
            src={image}
            alt={product.name}
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, 25vw"
          />
        </div>
      </Link>
      <div className="p-4">
        <Link href={`/productos/${product.slug}`}>
          <h3 className="font-semibold text-gray-800 hover:text-brand-600 line-clamp-2">
            {product.name}
          </h3>
        </Link>
        <p className="text-brand-700 font-bold text-lg mt-1">
          ${Number(product.price).toLocaleString('es-CL')}
        </p>
        {product.stock === 0 ? (
          <span className="text-xs text-red-500 mt-2 block">Sin stock</span>
        ) : (
          <button
            onClick={() => addItem({ id: product.id, name: product.name, price: Number(product.price), image })}
            className="mt-3 w-full flex items-center justify-center gap-2 bg-brand-600 hover:bg-brand-700 text-white text-sm font-medium py-2 rounded-lg transition-colors"
          >
            <ShoppingCart size={16} />
            Agregar al carrito
          </button>
        )}
      </div>
    </div>
  )
}
