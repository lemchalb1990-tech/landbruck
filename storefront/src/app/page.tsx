export const dynamic = 'force-dynamic'

import Link from 'next/link'
import { prisma } from '@/lib/prisma'
import ProductCard from '@/components/ProductCard'
import HeroCarousel, { Slide } from '@/components/HeroCarousel'
import {
  Sprout, Leaf, Wrench, FlaskConical, Sun, Droplets, Package, TreePine, Hammer,
  Truck, ShieldCheck, Phone, Star, Award, Users, Heart, CheckCircle,
} from 'lucide-react'

interface CategoryConfig { id: number; name: string; slug: string; icon: string; color: string }
interface SectionsConfig { hero: boolean; categories: boolean; featured: boolean; benefits: boolean; cta: boolean; testimonios: boolean }
interface Benefit     { id: number; icon: string; title: string; desc: string; color: string }
interface Testimonial { id: number; name: string; role: string; text: string; rating: number }

const ICON_MAP: Record<string, React.ElementType> = {
  Sprout, Leaf, Wrench, FlaskConical, Sun, Droplets, Package, TreePine, Hammer,
}

const BENEFIT_ICON_MAP: Record<string, React.ElementType> = {
  Truck, ShieldCheck, Phone, Sprout, Star, Award, Users, Heart, CheckCircle, Package, Leaf,
}

const BENEFIT_COLOR_TEXT: Record<string, string> = {
  brand: 'text-brand-600', green: 'text-green-600', blue: 'text-blue-600',
  amber: 'text-amber-600', red: 'text-red-600', purple: 'text-purple-600',
  emerald: 'text-emerald-600', orange: 'text-orange-600',
}

const COLOR_MAP: Record<string, string> = {
  green:   'bg-green-50 text-green-700 border-green-200 hover:border-green-400',
  amber:   'bg-amber-50 text-amber-700 border-amber-200 hover:border-amber-400',
  blue:    'bg-blue-50 text-blue-700 border-blue-200 hover:border-blue-400',
  emerald: 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:border-emerald-400',
  red:     'bg-red-50 text-red-700 border-red-200 hover:border-red-400',
  purple:  'bg-purple-50 text-purple-700 border-purple-200 hover:border-purple-400',
  orange:  'bg-orange-50 text-orange-700 border-orange-200 hover:border-orange-400',
  teal:    'bg-teal-50 text-teal-700 border-teal-200 hover:border-teal-400',
}

const DEFAULT_SECTIONS: SectionsConfig = { hero: true, categories: true, featured: true, benefits: true, cta: true, testimonios: true }

const DEFAULT_BENEFITS: Benefit[] = [
  { id: 1, icon: 'Truck',       title: 'Envío a todo Chile',  desc: 'Despacho con Starken desde $2.990. Gratis sobre $50.000.', color: 'brand'  },
  { id: 2, icon: 'Sprout',      title: 'Calidad garantizada', desc: 'Productos seleccionados por expertos agrícolas.',          color: 'green'  },
  { id: 3, icon: 'ShieldCheck', title: 'Compra 100% segura',  desc: 'Pago protegido y devolución sin preguntas.',               color: 'blue'   },
  { id: 4, icon: 'Phone',       title: 'Asesoría gratis',     desc: 'Consúltanos por WhatsApp antes de comprar.',               color: 'amber'  },
]

const DEFAULT_TESTIMONIALS: Testimonial[] = [
  { id: 1, name: 'María González', role: 'Huertero, Valparaíso', text: 'Excelente calidad en las semillas. Mi huerto nunca había producido tanto. Totalmente recomendado.', rating: 5 },
  { id: 2, name: 'Carlos Muñoz',   role: 'Agricultor, Rancagua', text: 'El servicio al cliente es increíble. Me asesoraron perfectamente para mi tipo de suelo y clima.',    rating: 5 },
  { id: 3, name: 'Ana Torres',     role: 'Jardín urbano, Santiago', text: 'Llegó rápido y bien embalado. Las plantas aromáticas están creciendo muy bien desde el primer día.', rating: 4 },
]

async function getPageData() {
  const [products, configs, categories] = await Promise.all([
    prisma.product.findMany({ where: { featured: true, active: true }, take: 8, orderBy: { createdAt: 'desc' } }),
    prisma.siteConfig.findMany({ where: { key: { in: ['heroSlides', 'sections', 'benefits', 'testimonials'] } } }),
    prisma.category.findMany({ where: { active: true }, orderBy: { name: 'asc' } }),
  ])
  const configMap = Object.fromEntries(configs.map(c => [c.key, c.value]))
  return { products, configMap, categories }
}

export default async function HomePage() {
  const { products, configMap, categories } = await getPageData()

  const heroSlides = configMap.heroSlides as unknown as Slide[] | undefined
  const sections: SectionsConfig = { ...DEFAULT_SECTIONS, ...((configMap.sections as unknown as Partial<SectionsConfig>) ?? {}) }
  const benefits: Benefit[] = (configMap.benefits as unknown as Benefit[] | undefined) ?? DEFAULT_BENEFITS
  const testimonials: Testimonial[] = (configMap.testimonials as unknown as Testimonial[] | undefined) ?? DEFAULT_TESTIMONIALS

  return (
    <>
      {/* Hero */}
      {sections.hero && <HeroCarousel slides={heroSlides} />}

      {/* Categorías */}
      {sections.categories && categories.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 py-14">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-2xl md:text-3xl font-bold text-gray-900">Categorías</h2>
              <p className="text-gray-500 text-sm mt-1">Encuentra lo que necesitas para tu cultivo</p>
            </div>
            <Link href="/productos" className="text-sm font-medium text-brand-600 hover:text-brand-700 hover:underline">Ver todo →</Link>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {categories.map(cat => {
              const Icon = ICON_MAP[cat.icon] ?? Leaf
              const colorClass = COLOR_MAP[cat.color] ?? COLOR_MAP.green
              return (
                <Link key={cat.id} href={`/productos?categoria=${cat.slug}`}
                  className={`flex flex-col items-center gap-3 border rounded-2xl p-6 transition-all hover:shadow-md ${colorClass}`}>
                  <div className="w-12 h-12 rounded-full bg-white/70 flex items-center justify-center shadow-sm">
                    <Icon size={24} />
                  </div>
                  <span className="font-semibold text-sm">{cat.name}</span>
                </Link>
              )
            })}
          </div>
        </section>
      )}

      {/* Productos destacados */}
      {sections.featured && products.length > 0 && (
        <section className="bg-gray-50 py-14">
          <div className="max-w-7xl mx-auto px-4">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h2 className="text-2xl md:text-3xl font-bold text-gray-900">Productos destacados</h2>
                <p className="text-gray-500 text-sm mt-1">Los más elegidos por nuestros clientes</p>
              </div>
              <Link href="/productos" className="text-sm font-medium text-brand-600 hover:text-brand-700 hover:underline">Ver todos →</Link>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-5">
              {products.map(product => (
                <ProductCard key={product.id} product={{ ...product, price: Number(product.price) }} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Beneficios */}
      {sections.benefits && benefits.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 py-14">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {benefits.map(({ icon, title, desc, color, id }) => {
              const Icon = BENEFIT_ICON_MAP[icon] ?? Truck
              const colorClass = BENEFIT_COLOR_TEXT[color] ?? 'text-brand-600'
              return (
                <div key={id} className="flex flex-col items-center text-center gap-3 p-6 rounded-2xl bg-white border border-gray-100 hover:shadow-sm transition-shadow">
                  <div className={`w-12 h-12 rounded-full bg-gray-50 flex items-center justify-center ${colorClass}`}>
                    <Icon size={22} />
                  </div>
                  <h3 className="font-semibold text-gray-800 text-sm">{title}</h3>
                  <p className="text-xs text-gray-500 leading-relaxed">{desc}</p>
                </div>
              )
            })}
          </div>
        </section>
      )}

      {/* Testimonios */}
      {sections.testimonios && testimonials.length > 0 && (
        <section className="bg-gray-50 py-14">
          <div className="max-w-7xl mx-auto px-4">
            <div className="text-center mb-10">
              <h2 className="text-2xl md:text-3xl font-bold text-gray-900">Lo que dicen nuestros clientes</h2>
              <p className="text-gray-500 text-sm mt-2">Miles de huerteros y agricultores confían en Landbruck</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {testimonials.map(t => (
                <div key={t.id} className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 flex flex-col gap-4">
                  <div className="flex gap-1">
                    {[1, 2, 3, 4, 5].map(n => (
                      <Star key={n} size={16} className={n <= t.rating ? 'text-amber-400 fill-amber-400' : 'text-gray-200 fill-gray-200'} />
                    ))}
                  </div>
                  <p className="text-gray-600 text-sm leading-relaxed flex-1">&ldquo;{t.text}&rdquo;</p>
                  <div>
                    <p className="font-semibold text-gray-800 text-sm">{t.name}</p>
                    <p className="text-xs text-gray-400 mt-0.5">{t.role}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Banner CTA */}
      {sections.cta && (
        <section className="bg-brand-700 py-16 px-4 text-center text-white">
          <h2 className="text-2xl md:text-3xl font-bold mb-3">¿Necesitas asesoría?</h2>
          <p className="text-brand-100 mb-8 max-w-md mx-auto">
            Nuestro equipo te ayuda a elegir los mejores productos para tu tipo de suelo y clima.
          </p>
          <a href="https://wa.me/56912345678" target="_blank" rel="noopener noreferrer"
            className="inline-flex items-center gap-2 bg-white text-brand-700 font-semibold px-8 py-3.5 rounded-full hover:bg-brand-50 transition-colors shadow-lg">
            Escribir por WhatsApp
          </a>
        </section>
      )}
    </>
  )
}
