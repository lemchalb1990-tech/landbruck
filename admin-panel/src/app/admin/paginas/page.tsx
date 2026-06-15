export const dynamic = 'force-dynamic'

import { prisma } from '@/lib/prisma'
import PageEditor from './PageEditor'

const DEFAULT_CONFIG = {
  logo: { type: 'text' as const, value: 'Landbruck' },
  hero: { title: 'Semillas y productos agrícolas', subtitle: 'Todo lo que necesitas para tu huerto, jardín y cultivo. Envíos a todo Chile.', buttonText: 'Ver productos', buttonUrl: '/productos' },
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
