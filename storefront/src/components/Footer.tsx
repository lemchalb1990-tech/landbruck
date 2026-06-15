import { unstable_noStore as noStore } from 'next/cache'
import Link from 'next/link'
import { prisma } from '@/lib/prisma'
import { Mail, Phone, MapPin, Instagram, Facebook, Youtube, MessageCircle, Link2 } from 'lucide-react'

interface SocialItem { id: number; platform: string; label: string; url: string; enabled: boolean }

const DEFAULT_CONTACT = { email: 'contacto@landbruck.cl', phone: '', address: 'Santiago, Chile' }

function TikTokIcon({ size = 18 }: { size?: number }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" width={size} height={size}>
      <path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-2.88 2.5 2.89 2.89 0 01-2.89-2.89 2.89 2.89 0 012.89-2.89c.28 0 .54.04.79.1V9.01a6.33 6.33 0 00-.79-.05 6.34 6.34 0 00-6.34 6.34 6.34 6.34 0 006.34 6.34 6.34 6.34 0 006.33-6.34V9.13a8.25 8.25 0 004.83 1.56V7.25a4.86 4.86 0 01-1.06-.56z" />
    </svg>
  )
}

export default async function Footer() {
  noStore()
  const configs = await prisma.siteConfig.findMany()
  const configMap = Object.fromEntries(configs.map(c => [c.key, c.value as Record<string, string>]))
  const contact = { ...DEFAULT_CONTACT, ...(configMap.contact ?? {}) }
  const logoValue = (configMap.logo as { value?: string } | undefined)?.value || 'Landbruck'
  const socialRaw = configMap.social
  const socialItems: SocialItem[] = Array.isArray(socialRaw) ? socialRaw : []
  const activeSocial = socialItems.filter(s => s.enabled && s.url)

  const SOCIAL_ICON: Record<string, React.ElementType> = {
    instagram: Instagram, facebook: Facebook, youtube: Youtube, whatsapp: MessageCircle,
  }

  return (
    <footer className="bg-brand-900 text-white mt-20">
      <div className="max-w-7xl mx-auto px-4 py-12 grid grid-cols-1 md:grid-cols-3 gap-8">

        {/* Marca */}
        <div>
          <h3 className="text-xl font-bold mb-3">{logoValue}</h3>
          <p className="text-sm text-gray-300 leading-relaxed">
            Semillas y productos agrícolas de calidad para tu huerto, jardín y campo.
          </p>
          {activeSocial.length > 0 && (
            <div className="flex flex-wrap gap-3 mt-5">
              {activeSocial.map(item => {
                const Icon = SOCIAL_ICON[item.platform]
                return (
                  <a key={item.id} href={item.url} target="_blank" rel="noopener noreferrer"
                    title={item.label}
                    className="w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-gray-300 hover:text-white transition-colors">
                    {item.platform === 'tiktok'
                      ? <TikTokIcon size={18} />
                      : Icon
                        ? <Icon size={18} />
                        : <Link2 size={18} />
                    }
                  </a>
                )
              })}
            </div>
          )}
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
