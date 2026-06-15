export const dynamic = 'force-dynamic'

import Link from 'next/link'
import { redirect } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import { Sprout, Award, Users, Leaf } from 'lucide-react'

const DEFAULT_ABOUT = { title: 'Sobre Landbruck', content: '' }
const DEFAULT_CTA = { enabled: true, title: '¿Tienes alguna pregunta?', description: 'Estamos aquí para ayudarte.', buttonText: 'Contáctanos', buttonUrl: '/contacto' }

const values = [
  { icon: Sprout, title: 'Calidad en semillas', desc: 'Selección rigurosa de variedades adaptadas al clima chileno.', color: 'text-green-600 bg-green-50' },
  { icon: Award, title: 'Experiencia comprobada', desc: 'Años acompañando a agricultores y huerteros de todo Chile.', color: 'text-brand-600 bg-brand-50' },
  { icon: Users, title: 'Atención personalizada', desc: 'Asesoría real antes y después de tu compra.', color: 'text-blue-600 bg-blue-50' },
  { icon: Leaf, title: 'Compromiso con la tierra', desc: 'Promovemos prácticas sostenibles y responsables.', color: 'text-emerald-600 bg-emerald-50' },
]

export default async function NosotrosPage() {
  const configs = await prisma.siteConfig.findMany()
  const configMap = Object.fromEntries(configs.map(c => [c.key, c.value as Record<string, unknown>]))
  const sections = configMap.sections as { nosotros?: boolean } | undefined
  if (sections?.nosotros === false) redirect('/')
  const aboutRaw = (configMap.about ?? {}) as Record<string, unknown>
  const about = { ...DEFAULT_ABOUT, ...(aboutRaw as Record<string, string>) }
  const cta = { ...DEFAULT_CTA, ...((aboutRaw.cta ?? {}) as Record<string, unknown>) } as typeof DEFAULT_CTA

  return (
    <div className="max-w-4xl mx-auto px-4 py-16">
      <div className="text-center mb-12">
        <h1 className="text-3xl md:text-4xl font-bold text-gray-900">{about.title}</h1>
        {about.content ? (
          <p className="text-gray-600 mt-4 max-w-2xl mx-auto leading-relaxed whitespace-pre-line">
            {about.content}
          </p>
        ) : (
          <p className="text-gray-500 mt-4 max-w-xl mx-auto">
            Somos una empresa chilena dedicada a ofrecer semillas y productos agrícolas de calidad para tu huerto, jardín y campo.
          </p>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-12">
        {values.map(({ icon: Icon, title, desc, color }) => (
          <div key={title} className="flex gap-4 bg-white border border-gray-100 rounded-2xl p-6 shadow-sm">
            <div className={`w-12 h-12 shrink-0 rounded-xl flex items-center justify-center ${color}`}>
              <Icon size={22} />
            </div>
            <div>
              <h3 className="font-semibold text-gray-800 mb-1">{title}</h3>
              <p className="text-sm text-gray-500 leading-relaxed">{desc}</p>
            </div>
          </div>
        ))}
      </div>

      {cta.enabled && (
        <div className="bg-brand-700 rounded-2xl p-8 text-center text-white">
          <h2 className="text-xl font-bold mb-2">{cta.title}</h2>
          <p className="text-brand-100 mb-6 text-sm">{cta.description}</p>
          <Link
            href={cta.buttonUrl}
            className="inline-flex items-center gap-2 bg-white text-brand-700 font-semibold px-8 py-3 rounded-full hover:bg-brand-50 transition-colors"
          >
            {cta.buttonText}
          </Link>
        </div>
      )}
    </div>
  )
}
