'use client'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import Image from 'next/image'
import { Upload } from 'lucide-react'

interface Logo { type: 'text' | 'image'; value: string }
interface Config {
  logo: Logo
  hero: { title: string; subtitle: string; buttonText: string; buttonUrl: string }
  about: { title: string; content: string }
  contact: { email: string; phone: string; address: string }
}

export default function PageEditor({ config }: { config: Config }) {
  const [activeTab, setActiveTab] = useState<'logo' | 'hero' | 'about' | 'contact'>('logo')
  const [saved, setSaved] = useState(false)
  const [logo, setLogo] = useState<Logo>(config.logo)
  const [uploading, setUploading] = useState(false)
  const { register, handleSubmit } = useForm({ defaultValues: config })

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setUploading(true)
    try {
      const form = new FormData()
      form.append('file', file)
      const res = await fetch('/api/upload', { method: 'POST', body: form })
      const { url } = await res.json()
      setLogo({ type: 'image', value: url })
    } finally {
      setUploading(false)
    }
  }

  const onSubmit = async (data: Config) => {
    await Promise.all([
      fetch('/api/site-config', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ key: 'logo', value: logo }) }),
      fetch('/api/site-config', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ key: 'hero', value: data.hero }) }),
      fetch('/api/site-config', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ key: 'about', value: data.about }) }),
      fetch('/api/site-config', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ key: 'contact', value: data.contact }) }),
    ])
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  const tabs = [
    { key: 'logo', label: 'Logo' },
    { key: 'hero', label: 'Hero / Inicio' },
    { key: 'about', label: 'Nosotros' },
    { key: 'contact', label: 'Contacto' },
  ] as const

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <div className="flex flex-wrap gap-2 mb-5">
        {tabs.map(t => (
          <button key={t.key} type="button" onClick={() => setActiveTab(t.key)}
            className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${activeTab === t.key ? 'bg-brand-600 text-white' : 'bg-white text-gray-600 border border-gray-200 hover:border-brand-600'}`}>
            {t.label}
          </button>
        ))}
      </div>

      <div className="bg-white rounded-xl shadow-sm p-6 space-y-4">

        {activeTab === 'logo' && (
          <div className="space-y-4">
            <p className="text-sm text-gray-500">Elige si el logo es un texto o una imagen.</p>

            <div className="flex gap-3">
              <button type="button" onClick={() => setLogo({ type: 'text', value: logo.type === 'text' ? logo.value : 'Landbruck' })}
                className={`px-4 py-2 text-sm font-medium rounded-lg border transition-colors ${logo.type === 'text' ? 'bg-brand-600 text-white border-brand-600' : 'bg-white text-gray-600 border-gray-200 hover:border-brand-600'}`}>
                Texto
              </button>
              <button type="button" onClick={() => setLogo({ type: 'image', value: logo.type === 'image' ? logo.value : '' })}
                className={`px-4 py-2 text-sm font-medium rounded-lg border transition-colors ${logo.type === 'image' ? 'bg-brand-600 text-white border-brand-600' : 'bg-white text-gray-600 border-gray-200 hover:border-brand-600'}`}>
                Imagen
              </button>
            </div>

            {logo.type === 'text' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Texto del logo</label>
                <input
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-600"
                  value={logo.value}
                  onChange={e => setLogo({ type: 'text', value: e.target.value })}
                  placeholder="Landbruck"
                />
              </div>
            )}

            {logo.type === 'image' && (
              <div className="space-y-3">
                {/* Previsualización con marco exacto del navbar */}
                <div>
                  <p className="text-xs font-medium text-gray-500 mb-1.5">Vista previa (tamaño real en navbar)</p>
                  <div className="inline-flex items-center bg-white border border-gray-200 rounded-lg px-4 h-16 shadow-sm">
                    {logo.value ? (
                      <Image src={logo.value} alt="Logo" width={140} height={40} className="object-contain h-10 w-auto" />
                    ) : (
                      <span className="text-sm text-gray-300 italic">Sin imagen</span>
                    )}
                  </div>
                </div>

                <div className="bg-blue-50 border border-blue-100 rounded-lg px-4 py-3 text-xs text-blue-700 space-y-1">
                  <p className="font-semibold">Resolución recomendada</p>
                  <p>• Tamaño: <strong>300 × 80 px</strong> (o proporcional)</p>
                  <p>• Formato: <strong>PNG</strong> con fondo transparente</p>
                  <p>• El logo se mostrará con máx. 140px de ancho y 40px de alto</p>
                </div>

                <label className="flex items-center gap-2 cursor-pointer bg-gray-50 hover:bg-gray-100 border border-dashed border-gray-300 rounded-lg px-4 py-3 w-fit text-sm text-gray-600 transition-colors">
                  <Upload size={16} />
                  {uploading ? 'Subiendo...' : logo.value ? 'Cambiar imagen' : 'Subir imagen'}
                  <input type="file" accept="image/*" className="hidden" onChange={handleLogoUpload} disabled={uploading} />
                </label>
              </div>
            )}
          </div>
        )}

        {activeTab === 'hero' && (
          <>
            <Field label="Título" {...register('hero.title')} />
            <Field label="Subtítulo" {...register('hero.subtitle')} textarea />
            <Field label="Texto del botón" {...register('hero.buttonText')} />
            <Field label="URL del botón" {...register('hero.buttonUrl')} />
          </>
        )}
        {activeTab === 'about' && (
          <>
            <Field label="Título" {...register('about.title')} />
            <Field label="Contenido" {...register('about.content')} textarea rows={6} />
          </>
        )}
        {activeTab === 'contact' && (
          <>
            <Field label="Email" {...register('contact.email')} />
            <Field label="Teléfono" {...register('contact.phone')} />
            <Field label="Dirección" {...register('contact.address')} />
          </>
        )}

        <div className="pt-2">
          <button type="submit"
            className="bg-brand-600 hover:bg-brand-700 text-white font-medium px-6 py-2 rounded-lg text-sm transition-colors">
            {saved ? '✓ Guardado' : 'Guardar cambios'}
          </button>
        </div>
      </div>
    </form>
  )
}

function Field({ label, textarea, rows, ...props }: { label: string; textarea?: boolean; rows?: number } & React.InputHTMLAttributes<HTMLInputElement | HTMLTextAreaElement>) {
  const className = "w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-600"
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
      {textarea
        ? <textarea className={className} rows={rows ?? 3} {...props as React.TextareaHTMLAttributes<HTMLTextAreaElement>} />
        : <input className={className} {...props as React.InputHTMLAttributes<HTMLInputElement>} />
      }
    </div>
  )
}
