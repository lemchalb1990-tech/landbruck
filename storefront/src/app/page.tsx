export const dynamic = 'force-dynamic'

import Link from 'next/link'
import { prisma } from '@/lib/prisma'
import ProductCard from '@/components/ProductCard'
import HeroCarousel, { Slide } from '@/components/HeroCarousel'
import { Sprout, Wrench, FlaskConical, Leaf, Truck, ShieldCheck, Phone } from 'lucide-react'

async function getFeaturedProducts() {
  return prisma.product.findMany({
    where: { featured: true, active: true },
    take: 8,
    orderBy: { createdAt: 'desc' },
  })
}

async function getHeroSlides(): Promise<Slide[] | undefined> {
  const config = await prisma.siteConfig.findUnique({ where: { key: 'heroSlides' } })
  if (!config) return undefined
  return config.value as Slide[]
}

const categories = [
  { name: 'Semillas', slug: 'semillas', icon: Sprout, color: 'bg-green-50 text-green-700 border-green-200 hover:border-green-400' },
  { name: 'Herramientas', slug: 'herramientas', icon: Wrench, color: 'bg-amber-50 text-amber-700 border-amber-200 hover:border-amber-400' },
  { name: 'Fertilizantes', slug: 'fertilizantes', icon: FlaskConical, color: 'bg-blue-50 text-blue-700 border-blue-200 hover:border-blue-400' },
  { name: 'Insumos', slug: 'insumos', icon: Leaf, color: 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:border-emerald-400' },
]

const benefits = [
  {
    icon: Truck,
    title: 'Envío a todo Chile',
    desc: 'Despacho con Starken desde $2.990. Gratis sobre $50.000.',
    color: 'text-brand-600',
  },
  {
    icon: Sprout,
    title: 'Calidad garantizada',
    desc: 'Productos seleccionados por expertos agrícolas.',
    color: 'text-green-600',
  },
  {
    icon: ShieldCheck,
    title: 'Compra 100% segura',
    desc: 'Pago protegido y devolución sin preguntas.',
    color: 'text-blue-600',
  },
  {
    icon: Phone,
    title: 'Asesoría gratis',
    desc: 'Consúltanos por WhatsApp antes de comprar.',
    color: 'text-amber-600',
  },
]

export default async function HomePage() {
  const [featured, heroSlides] = await Promise.all([getFeaturedProducts(), getHeroSlides()])

  return (
    <>
      {/* Hero carousel */}
      <HeroCarousel slides={heroSlides} />

      {/* Categorías */}
      <section className="max-w-7xl mx-auto px-4 py-14">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900">Categorías</h2>
            <p className="text-gray-500 text-sm mt-1">Encuentra lo que necesitas para tu cultivo</p>
          </div>
          <Link href="/productos" className="text-sm font-medium text-brand-600 hover:text-brand-700 hover:underline">
            Ver todo →
          </Link>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {categories.map(({ name, slug, icon: Icon, color }) => (
            <Link
              key={slug}
              href={`/productos?categoria=${slug}`}
              className={`flex flex-col items-center gap-3 border rounded-2xl p-6 transition-all hover:shadow-md ${color}`}
            >
              <div className="w-12 h-12 rounded-full bg-white/70 flex items-center justify-center shadow-sm">
                <Icon size={24} />
              </div>
              <span className="font-semibold text-sm">{name}</span>
            </Link>
          ))}
        </div>
      </section>

      {/* Productos destacados */}
      {featured.length > 0 && (
        <section className="bg-gray-50 py-14">
          <div className="max-w-7xl mx-auto px-4">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h2 className="text-2xl md:text-3xl font-bold text-gray-900">Productos destacados</h2>
                <p className="text-gray-500 text-sm mt-1">Los más elegidos por nuestros clientes</p>
              </div>
              <Link
                href="/productos"
                className="text-sm font-medium text-brand-600 hover:text-brand-700 hover:underline"
              >
                Ver todos →
              </Link>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-5">
              {featured.map(product => (
                <ProductCard
                  key={product.id}
                  product={{ ...product, price: Number(product.price) }}
                />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Banner beneficios */}
      <section className="max-w-7xl mx-auto px-4 py-14">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {benefits.map(({ icon: Icon, title, desc, color }) => (
            <div key={title} className="flex flex-col items-center text-center gap-3 p-6 rounded-2xl bg-white border border-gray-100 hover:shadow-sm transition-shadow">
              <div className={`w-12 h-12 rounded-full bg-gray-50 flex items-center justify-center ${color}`}>
                <Icon size={22} />
              </div>
              <h3 className="font-semibold text-gray-800 text-sm">{title}</h3>
              <p className="text-xs text-gray-500 leading-relaxed">{desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Banner CTA */}
      <section className="bg-brand-700 py-16 px-4 text-center text-white">
        <h2 className="text-2xl md:text-3xl font-bold mb-3">¿Necesitas asesoría?</h2>
        <p className="text-brand-100 mb-8 max-w-md mx-auto">
          Nuestro equipo te ayuda a elegir los mejores productos para tu tipo de suelo y clima.
        </p>
        <a
          href="https://wa.me/56912345678"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 bg-white text-brand-700 font-semibold px-8 py-3.5 rounded-full hover:bg-brand-50 transition-colors shadow-lg"
        >
          Escribir por WhatsApp
        </a>
      </section>
    </>
  )
}
