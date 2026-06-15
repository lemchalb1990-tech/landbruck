import type { Metadata } from 'next'
import './globals.css'
import NavbarWrapper from '@/components/NavbarWrapper'
import Footer from '@/components/Footer'
import { CartProvider } from '@/context/CartContext'

export const metadata: Metadata = {
  title: 'Landbruck — Semillas y productos agrícolas',
  description: 'Tienda online de semillas y productos agrícolas para tu huerto y jardín.',
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
