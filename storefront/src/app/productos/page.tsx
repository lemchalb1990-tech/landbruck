import { prisma } from '@/lib/prisma'
import ProductCard from '@/components/ProductCard'

interface Props {
  searchParams: { categoria?: string; buscar?: string; pagina?: string }
}

export default async function ProductosPage({ searchParams }: Props) {
  const pagina = Number(searchParams.pagina ?? 1)
  const porPagina = 12

  const where = {
    active: true,
    ...(searchParams.categoria && {
      category: { slug: searchParams.categoria },
    }),
    ...(searchParams.buscar && {
      name: { contains: searchParams.buscar, mode: 'insensitive' as const },
    }),
  }

  const [products, total] = await Promise.all([
    prisma.product.findMany({
      where,
      skip: (pagina - 1) * porPagina,
      take: porPagina,
      orderBy: { createdAt: 'desc' },
    }),
    prisma.product.count({ where }),
  ])

  const totalPaginas = Math.ceil(total / porPagina)
  const categories = await prisma.category.findMany()

  return (
    <div className="max-w-7xl mx-auto px-4 py-10">
      <div className="flex flex-col md:flex-row gap-8">

        {/* Sidebar filtros */}
        <aside className="w-full md:w-56 shrink-0">
          <h2 className="font-semibold text-gray-700 mb-3">Categorías</h2>
          <ul className="space-y-1">
            <li>
              <a
                href="/productos"
                className={`block px-3 py-2 rounded-lg text-sm ${!searchParams.categoria ? 'bg-brand-600 text-white' : 'hover:bg-gray-100 text-gray-700'}`}
              >
                Todos
              </a>
            </li>
            {categories.map(cat => (
              <li key={cat.id}>
                <a
                  href={`/productos?categoria=${cat.slug}`}
                  className={`block px-3 py-2 rounded-lg text-sm ${searchParams.categoria === cat.slug ? 'bg-brand-600 text-white' : 'hover:bg-gray-100 text-gray-700'}`}
                >
                  {cat.name}
                </a>
              </li>
            ))}
          </ul>
        </aside>

        {/* Grid productos */}
        <div className="flex-1">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-xl font-bold text-gray-800">
              {searchParams.categoria
                ? categories.find(c => c.slug === searchParams.categoria)?.name ?? 'Productos'
                : 'Todos los productos'}
            </h1>
            <span className="text-sm text-gray-500">{total} productos</span>
          </div>

          {products.length === 0 ? (
            <p className="text-gray-500 text-center py-20">No se encontraron productos.</p>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
              {products.map(product => (
                <ProductCard
                  key={product.id}
                  product={{ ...product, price: Number(product.price) }}
                />
              ))}
            </div>
          )}

          {/* Paginación */}
          {totalPaginas > 1 && (
            <div className="flex justify-center gap-2 mt-10">
              {Array.from({ length: totalPaginas }, (_, i) => i + 1).map(p => (
                <a
                  key={p}
                  href={`?${new URLSearchParams({ ...searchParams, pagina: String(p) })}`}
                  className={`w-9 h-9 flex items-center justify-center rounded-lg text-sm font-medium ${p === pagina ? 'bg-brand-600 text-white' : 'bg-white border text-gray-600 hover:border-brand-500'}`}
                >
                  {p}
                </a>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
