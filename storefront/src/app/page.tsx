import Link from 'next/link'
import { prisma } from '@/lib/prisma'
import ProductCard from '@/components/ProductCard'

async function getFeaturedProducts() {
  return prisma.product.findMany({
    where: { featured: true, active: true },
    take: 8,
    orderBy: { createdAt: 'desc' },
  })
}

export default async function HomePage() {
  const featured = await getFeaturedProducts()

  return (
    <>
      {/* Hero */}
      <section className="bg-brand-700 text-white py-20 px-4 text-center">
        <h1 className="text-4xl md:text-5xl font-bold mb-4">
          Semillas y productos agrícolas
        </h1>
        <p className="text-lg text-brand-100 mb-8 max-w-xl mx-auto">
          Todo lo que necesitas para tu huerto, jardín y cultivo. Envíos a todo Chile.
        </p>
        <Link
          href="/productos"
          className="inline-block bg-white text-brand-700 font-semibold px-8 py-3 rounded-full hover:bg-brand-50 transition-colors"
        >
          Ver productos
        </Link>
      </section>

      {/* Categorías */}
      <section className="max-w-7xl mx-auto px-4 py-12">
        <h2 className="text-2xl font-bold text-gray-800 mb-6">Categorías</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {['Semillas', 'Insumos', 'Herramientas', 'Fertilizantes'].map(cat => (
            <Link
              key={cat}
              href={`/productos?categoria=${cat.toLowerCase()}`}
              className="bg-white border border-gray-200 rounded-xl p-6 text-center font-medium text-gray-700 hover:border-brand-500 hover:text-brand-700 transition-colors"
            >
              {cat}
            </Link>
          ))}
        </div>
      </section>

      {/* Productos destacados */}
      {featured.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 pb-16">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-800">Destacados</h2>
            <Link href="/productos" className="text-sm text-brand-600 hover:underline">
              Ver todos →
            </Link>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {featured.map(product => (
              <ProductCard
                key={product.id}
                product={{ ...product, price: Number(product.price) }}
              />
            ))}
          </div>
        </section>
      )}

      {/* Banner envíos */}
      <section className="bg-brand-50 border-t border-brand-100 py-10 px-4">
        <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
          <div>
            <p className="text-2xl mb-2">🚚</p>
            <h3 className="font-semibold">Envío a todo Chile</h3>
            <p className="text-sm text-gray-500">Despacho con Starken</p>
          </div>
          <div>
            <p className="text-2xl mb-2">🌱</p>
            <h3 className="font-semibold">Productos seleccionados</h3>
            <p className="text-sm text-gray-500">Calidad garantizada</p>
          </div>
          <div>
            <p className="text-2xl mb-2">🔒</p>
            <h3 className="font-semibold">Compra segura</h3>
            <p className="text-sm text-gray-500">Pago protegido</p>
          </div>
        </div>
      </section>
    </>
  )
}
