export const dynamic = 'force-dynamic'

import { redirect } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import { Mail, Phone, MapPin } from 'lucide-react'

const DEFAULT_CONTACT = { email: 'contacto@landbruck.cl', phone: '', address: 'Santiago, Chile' }

export default async function ContactoPage() {
  const configs = await prisma.siteConfig.findMany()
  const configMap = Object.fromEntries(configs.map(c => [c.key, c.value as Record<string, unknown>]))
  const sections = configMap.sections as { contacto?: boolean } | undefined
  if (sections?.contacto === false) redirect('/')
  const contact = { ...DEFAULT_CONTACT, ...((configMap.contact ?? {}) as Record<string, string>) }

  return (
    <div className="max-w-4xl mx-auto px-4 py-16">
      <div className="text-center mb-12">
        <h1 className="text-3xl md:text-4xl font-bold text-gray-900">Contacto</h1>
        <p className="text-gray-500 mt-3 max-w-md mx-auto">
          Estamos para ayudarte. Escríbenos o visítanos.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
        {contact.email && (
          <div className="bg-white border border-gray-100 rounded-2xl p-6 flex flex-col items-center text-center gap-3 shadow-sm">
            <div className="w-12 h-12 bg-brand-50 rounded-full flex items-center justify-center text-brand-600">
              <Mail size={22} />
            </div>
            <h3 className="font-semibold text-gray-800">Email</h3>
            <a href={`mailto:${contact.email}`} className="text-sm text-brand-600 hover:underline break-all">
              {contact.email}
            </a>
          </div>
        )}
        {contact.phone && (
          <div className="bg-white border border-gray-100 rounded-2xl p-6 flex flex-col items-center text-center gap-3 shadow-sm">
            <div className="w-12 h-12 bg-green-50 rounded-full flex items-center justify-center text-green-600">
              <Phone size={22} />
            </div>
            <h3 className="font-semibold text-gray-800">Teléfono</h3>
            <a href={`tel:${contact.phone}`} className="text-sm text-gray-600 hover:text-brand-600">
              {contact.phone}
            </a>
          </div>
        )}
        {contact.address && (
          <div className="bg-white border border-gray-100 rounded-2xl p-6 flex flex-col items-center text-center gap-3 shadow-sm">
            <div className="w-12 h-12 bg-amber-50 rounded-full flex items-center justify-center text-amber-600">
              <MapPin size={22} />
            </div>
            <h3 className="font-semibold text-gray-800">Dirección</h3>
            <p className="text-sm text-gray-600">{contact.address}</p>
          </div>
        )}
      </div>

      <div className="bg-brand-700 rounded-2xl p-8 text-center text-white">
        <h2 className="text-xl font-bold mb-2">¿Prefieres WhatsApp?</h2>
        <p className="text-brand-100 mb-6 text-sm">Respondemos rápido, de lunes a viernes.</p>
        <a
          href={`https://wa.me/${contact.phone?.replace(/\D/g, '') || '56912345678'}`}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 bg-white text-brand-700 font-semibold px-8 py-3 rounded-full hover:bg-brand-50 transition-colors"
        >
          Escribir por WhatsApp
        </a>
      </div>
    </div>
  )
}
