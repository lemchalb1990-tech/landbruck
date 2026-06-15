import { unstable_noStore as noStore } from 'next/cache'
import Link from 'next/link'
import { prisma } from '@/lib/prisma'
import { Mail, Phone, MapPin } from 'lucide-react'

const DEFAULT_CONTACT = { email: 'contacto@landbruck.cl', phone: '', address: 'Santiago, Chile' }

export default async function Footer() {
  noStore()
  const configs = await prisma.siteConfig.findMany()
  const configMap = Object.fromEntries(configs.map(c => [c.key, c.value as Record<string, string>]))
  const contact = { ...DEFAULT_CONTACT, ...(configMap.contact ?? {}) }
  const logoValue = (configMap.logo as { value?: string } | undefined)?.value || 'Landbruck'

  return (
    <footer className="bg-brand-900 text-white mt-20">
      <div className="max-w-7xl mx-auto px-4 py-12 grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Marca */}
        <div>
          <h3 className="text-xl font-bold mb-3">{logoValue}</h3>
          <p className="text-sm text-gray-300 leading-relaxed">
            Semillas y productos agrícolas de calidad para tu huerto, jardín y campo.
          </p>
        </div>

        {/* Navegación */}
        <div>
          <h4 className="font-semibold mb-4">Navegación</h4>
          <ul className="space-y-2 text-sm text-gray-300">
            <li><Link href="/" className="hover:text-white transition-colors">Inicio</Link></li>
            <li><Link href="/productos" className="hover:text-white transition-colors">Productos</Link></li>
            <li><Link href="/nosotros" className="hover:text-white transition-colors">Nosotros</Link></li>
            <li><Link href="/contacto" className="hover:text-white transition-colors">Contacto</Link></li>
            <li><Link href="/cuenta/pedidos" className="hover:text-white transition-colors">Mis pedidos</Link></li>
          </ul>
        </div>

        {/* Contacto */}
        <div>
          <h4 className="font-semibold mb-4">Contacto</h4>
          <ul className="space-y-3 text-sm text-gray-300">
            {contact.email && (
              <li className="flex items-start gap-2.5">
                <Mail size={15} className="mt-0.5 shrink-0 text-gray-400" />
                <a href={`mailto:${contact.email}`} className="hover:text-white transition-colors break-all">
                  {contact.email}
                </a>
              </li>
            )}
            {contact.phone && (
              <li className="flex items-start gap-2.5">
                <Phone size={15} className="mt-0.5 shrink-0 text-gray-400" />
                <a href={`tel:${contact.phone}`} className="hover:text-white transition-colors">
                  {contact.phone}
                </a>
              </li>
            )}
            {contact.address && (
              <li className="flex items-start gap-2.5">
                <MapPin size={15} className="mt-0.5 shrink-0 text-gray-400" />
                <span>{contact.address}</span>
              </li>
            )}
          </ul>
        </div>
      </div>

      <div className="border-t border-brand-700 text-center py-4 text-xs text-gray-400">
        © {new Date().getFullYear()} {logoValue}. Todos los derechos reservados.
      </div>
    </footer>
  )
}
