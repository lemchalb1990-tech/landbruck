export const dynamic = 'force-dynamic'

import { prisma } from '@/lib/prisma'
import PageEditor from './PageEditor'

const DEFAULT_SLIDES = [
  { id: 1, image: 'https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=1600&q=80', tag: 'Temporada de siembra', title: 'Semillas de alta\ncalidad genética', subtitle: 'Variedades seleccionadas para el clima chileno. Mayor rendimiento en cada cosecha.', cta: 'Explorar semillas', href: '/productos?categoria=semillas' },
  { id: 2, image: 'https://images.unsplash.com/photo-1464226184884-fa280b87c399?w=1600&q=80', tag: 'Para tu campo', title: 'Insumos agrícolas\npara profesionales', subtitle: 'Fertilizantes, pesticidas y herramientas para maximizar tu producción agrícola.', cta: 'Ver insumos', href: '/productos?categoria=insumos' },
  { id: 3, image: 'https://images.unsplash.com/photo-1625246333195-78d9c38ad449?w=1600&q=80', tag: 'Huerto en casa', title: 'Todo para tu\nhuerto y jardín', subtitle: 'Desde semillas de tomates hasta plantas aromáticas. Cultiva tu propio alimento.', cta: 'Ver productos', href: '/productos' },
]

const DEFAULT_SECTIONS = {
  hero: true, categories: true, featured: true, benefits: true, cta: true,
  nosotros: true, contacto: true, testimonios: true,
}

const DEFAULT_BENEFITS = [
  { id: 1, icon: 'Truck',       title: 'Envío a todo Chile',   desc: 'Despacho con Starken desde $2.990. Gratis sobre $50.000.', color: 'brand'  },
  { id: 2, icon: 'Sprout',      title: 'Calidad garantizada',  desc: 'Productos seleccionados por expertos agrícolas.',          color: 'green'  },
  { id: 3, icon: 'ShieldCheck', title: 'Compra 100% segura',   desc: 'Pago protegido y devolución sin preguntas.',               color: 'blue'   },
  { id: 4, icon: 'Phone',       title: 'Asesoría gratis',      desc: 'Consúltanos por WhatsApp antes de comprar.',               color: 'amber'  },
]

const DEFAULT_TESTIMONIALS = [
  { id: 1, name: 'María González', role: 'Huertero, Valparaíso', text: 'Excelente calidad en las semillas. Mi huerto nunca había producido tanto. Totalmente recomendado.', rating: 5 },
  { id: 2, name: 'Carlos Muñoz',   role: 'Agricultor, Rancagua', text: 'El servicio al cliente es increíble. Me asesoraron perfectamente para mi tipo de suelo y clima.', rating: 5 },
  { id: 3, name: 'Ana Torres',     role: 'Jardín urbano, Santiago', text: 'Llegó rápido y bien embalado. Las plantas aromáticas están creciendo muy bien desde el primer día.', rating: 4 },
]

const DEFAULT_SOCIAL = { facebook: '', instagram: '', tiktok: '', youtube: '', whatsapp: '' }

const DEFAULT_CONFIG = {
  logo: { type: 'text' as const, value: 'Landbruck' },
  siteInfo: { name: 'Landbruck', description: 'Semillas y productos agrícolas para tu huerto y jardín.', favicon: '' },
  heroSlides: DEFAULT_SLIDES,
  sections: DEFAULT_SECTIONS,
  about:    { title: 'Sobre Landbruck', content: 'Somos una empresa chilena dedicada a ofrecer semillas y productos agrícolas de calidad para tu huerto, jardín y campo.' },
  contact:  { email: 'contacto@landbruck.cl', phone: '', address: 'Santiago, Chile' },
  benefits:     DEFAULT_BENEFITS,
  testimonials: DEFAULT_TESTIMONIALS,
  social:       DEFAULT_SOCIAL,
}

export default async function PaginasPage() {
  const configs = await prisma.siteConfig.findMany()
  const configMap = Object.fromEntries(configs.map(c => [c.key, c.value]))
  const merged = {
    ...DEFAULT_CONFIG,
    ...configMap,
    sections:     { ...DEFAULT_SECTIONS,             ...((configMap.sections     as object) ?? {}) },
    siteInfo:     { ...DEFAULT_CONFIG.siteInfo,      ...((configMap.siteInfo     as object) ?? {}) },
    about:        { ...DEFAULT_CONFIG.about,          ...((configMap.about        as object) ?? {}) },
    contact:      { ...DEFAULT_CONFIG.contact,        ...((configMap.contact      as object) ?? {}) },
    benefits:     (configMap.benefits     as typeof DEFAULT_BENEFITS     | undefined) ?? DEFAULT_BENEFITS,
    testimonials: (configMap.testimonials as typeof DEFAULT_TESTIMONIALS | undefined) ?? DEFAULT_TESTIMONIALS,
    social:       { ...DEFAULT_SOCIAL,               ...((configMap.social       as object) ?? {}) },
  }

  return (
    <div className="max-w-3xl">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Editor de páginas</h1>
      <PageEditor config={merged as typeof DEFAULT_CONFIG} />
    </div>
  )
}
