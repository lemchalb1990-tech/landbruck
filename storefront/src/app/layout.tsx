import type { Metadata } from 'next'
import { unstable_noStore as noStore } from 'next/cache'
import './globals.css'
import NavbarWrapper from '@/components/NavbarWrapper'
import Footer from '@/components/Footer'
import { CartProvider } from '@/context/CartContext'
import { prisma } from '@/lib/prisma'

interface ThemeConfig {
  primaryColor: string
  buttonRadius: string
  fontFamily: string
}

function hexToRgb(hex: string): [number, number, number] | null {
  const clean = hex.replace('#', '')
  if (!/^[0-9a-fA-F]{6}$/.test(clean)) return null
  return [parseInt(clean.slice(0, 2), 16), parseInt(clean.slice(2, 4), 16), parseInt(clean.slice(4, 6), 16)]
}

function generateThemeCSS(theme: ThemeConfig): string {
  const rgb = hexToRgb(theme.primaryColor)
  if (!rgb) return ''
  const [r, g, b] = rgb
  const mix = (t: number) => `${Math.round(r + (255 - r) * t)} ${Math.round(g + (255 - g) * t)} ${Math.round(b + (255 - b) * t)}`
  const dark = (t: number) => `${Math.round(r * (1 - t))} ${Math.round(g * (1 - t))} ${Math.round(b * (1 - t))}`
  const vars = [
    `--brand-50:${mix(0.95)}`,
    `--brand-100:${mix(0.88)}`,
    `--brand-500:${mix(0.1)}`,
    `--brand-600:${r} ${g} ${b}`,
    `--brand-700:${dark(0.12)}`,
    `--brand-900:${dark(0.35)}`,
    `--btn-radius:${theme.buttonRadius}`,
    `--font-body:'${theme.fontFamily}',system-ui,sans-serif`,
  ].join(';')
  return `:root{${vars}}`
}

export async function generateMetadata(): Promise<Metadata> {
  noStore()
  const config = await prisma.siteConfig.findUnique({ where: { key: 'siteInfo' } })
  const info = config?.value as { name?: string; description?: string; favicon?: string } | null | undefined
  const name = info?.name || 'Landbruck'
  const description = info?.description || 'Semillas y productos agrícolas para tu huerto y jardín.'
  const favicon = info?.favicon

  return {
    title: { default: `${name} — ${description}`, template: `%s | ${name}` },
    description,
    ...(favicon ? { icons: { icon: favicon } } : {}),
  }
}

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  noStore()
  const themeConfig = await prisma.siteConfig.findUnique({ where: { key: 'theme' } })
  const theme = themeConfig?.value as ThemeConfig | null
  const themeCSS = theme ? generateThemeCSS(theme) : ''
  const googleFontURL = theme?.fontFamily && theme.fontFamily !== 'system-ui'
    ? `https://fonts.googleapis.com/css2?family=${encodeURIComponent(theme.fontFamily)}:wght@400;500;600;700&display=swap`
    : null

  return (
    <html lang="es">
      <head>
        {googleFontURL && (
          <>
            <link rel="preconnect" href="https://fonts.googleapis.com" />
            <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
            <link rel="stylesheet" href={googleFontURL} />
          </>
        )}
        {themeCSS && <style dangerouslySetInnerHTML={{ __html: themeCSS }} />}
      </head>
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
