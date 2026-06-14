import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Landbruk Admin',
  description: 'Panel de administración Landbruk',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <body className="bg-lb-bg text-lb-text antialiased">{children}</body>
    </html>
  )
}
