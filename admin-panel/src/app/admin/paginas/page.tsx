export const dynamic = 'force-dynamic'

import { prisma } from '@/lib/prisma'
import PageEditor from './PageEditor'

const DEFAULT_SLIDES = [
  {
    id: 1,
    image: 'https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=1600&q=80',
    tag: 'Temporada de siembra',
    title: 'Semillas de alta\ncalidad genética',
    subtitle: 'Variedades seleccionadas para el clima chileno. Mayor rendimiento en cada cosecha.',
    cta: 'Explorar semillas',
    href: '/productos?categoria=semillas',
  },
  {
    id: 2,
    image: 'https://images.unsplash.com/photo-1464226184884-fa280b87c399?w=1600&q=80',
    tag: 'Para tu campo',
    title: 'Insumos agrícolas\npara profesionales',
    subtitle: 'Fertilizantes, pesticidas y herramientas para maximizar tu producción agrícola.',
    cta: 'Ver insumos',
    href: '/productos?categoria=insumos',
  },
  {
    id: 3,
    image: 'https://images.unsplash.com/photo-1625246333195-78d9c38ad449?w=1600&q=80',
    tag: 'Huerto en casa',
    title: 'Todo para tu\nhuerto y jardín',
    subtitle: 'Desde semillas de tomates hasta plantas aromáticas. Cultiva tu propio alimento.',
    cta: 'Ver productos',
    href: '/productos',
  },
]

const DEFAULT_CONFIG = {
  logo: { type: 'text' as const, value: 'Landbruck' },
  heroSlides: DEFAULT_SLIDES,
  about: { title: 'Sobre Landbruck', content: '' },
  contact: { email: 'contacto@landbruck.cl', phone: '', address: 'Santiago, Chile' },
}

export default async function PaginasPage() {
  const configs = await prisma.siteConfig.findMany()
  const configMap = Object.fromEntries(configs.map(c => [c.key, c.value]))
  const merged = { ...DEFAULT_CONFIG, ...configMap }

  return (
    <div className="max-w-3xl">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Editor de páginas</h1>
      <PageEditor config={merged as typeof DEFAULT_CONFIG} />
    </div>
  )
}
