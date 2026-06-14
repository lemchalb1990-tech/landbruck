import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Landbruck Admin',
  description: 'Panel de administración Landbruck',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <body>{children}</body>
    </html>
  )
}
