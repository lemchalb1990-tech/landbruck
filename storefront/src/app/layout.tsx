import type { Metadata } from 'next'
import { unstable_noStore as noStore } from 'next/cache'
import './globals.css'
import NavbarWrapper from '@/components/NavbarWrapper'
import Footer from '@/components/Footer'
import { CartProvider } from '@/context/CartContext'
import { prisma } from '@/lib/prisma'

export async function generateMetadata(): Promise<Metadata> {
  noStore()
  const config = await prisma.siteConfig.findUnique({ where: { key: 'siteInfo' } })
  const info = config?.value as { name?: string; description?: string; favicon?: string } | null | undefined
  const name = info?.name || 'Landbruck'
  const description = info?.description || 'Semillas y productos agrícolas para tu huerto y jardín.'
  const favicon = info?.favicon

  return {
    title: {
      default: `${name} — ${description}`,
      template: `%s | ${name}`,
    },
    description,
    ...(favicon ? { icons: { icon: favicon } } : {}),
  }
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <body>
        <CartProvider>
          <NavbarWrapper />
          <main className="min-h-screen">{children}</main>
          <Footer />
        </CartProvider>
      </body>
    </html>
  )
}
