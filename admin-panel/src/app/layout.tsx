import type { Metadata } from 'next'
import { prisma } from '@/lib/prisma'
import './globals.css'

export async function generateMetadata(): Promise<Metadata> {
  let siteName = 'Landbruck'
  try {
    const config = await prisma.siteConfig.findUnique({ where: { key: 'siteInfo' } })
    siteName = (config?.value as { name?: string } | null)?.name || 'Landbruck'
  } catch { /* fallback */ }
  return {
    title:       `${siteName} · Administrador`,
    description: `Panel de administración ${siteName}`,
  }
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <body>{children}</body>
    </html>
  )
}
