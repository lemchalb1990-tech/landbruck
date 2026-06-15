export const dynamic = 'force-dynamic'

import { prisma } from '@/lib/prisma'
import TemaEditor from './TemaEditor'

const DEFAULT_THEME = {
  primaryColor: '#16a34a',
  buttonRadius: '9999px',
  fontFamily: 'system-ui',
}

export default async function TemaPage() {
  const config = await prisma.siteConfig.findUnique({ where: { key: 'theme' } })
  const theme = { ...DEFAULT_THEME, ...((config?.value as object) ?? {}) }
  return (
    <div className="max-w-3xl">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Tema y estilos</h1>
      <TemaEditor config={theme as typeof DEFAULT_THEME} />
    </div>
  )
}
