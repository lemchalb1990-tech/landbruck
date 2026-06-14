'use client'
import { useState } from 'react'
import { useForm } from 'react-hook-form'

interface Config {
  hero: { title: string; subtitle: string; buttonText: string; buttonUrl: string }
  about: { title: string; content: string }
  contact: { email: string; phone: string; address: string }
}

export default function PageEditor({ config }: { config: Config }) {
  const [activeTab, setActiveTab] = useState<'hero' | 'about' | 'contact'>('hero')
  const [saved, setSaved] = useState(false)
  const { register, handleSubmit } = useForm({ defaultValues: config })

  const onSubmit = async (data: Config) => {
    await Promise.all([
      fetch('/api/site-config', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ key: 'hero', value: data.hero }) }),
      fetch('/api/site-config', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ key: 'about', value: data.about }) }),
      fetch('/api/site-config', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ key: 'contact', value: data.contact }) }),
    ])
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  const tabs = [
    { key: 'hero', label: 'Hero / Inicio' },
    { key: 'about', label: 'Nosotros' },
    { key: 'contact', label: 'Contacto' },
  ] as const

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <div className="flex gap-2 mb-5">
        {tabs.map(t => (
          <button key={t.key} type="button" onClick={() => setActiveTab(t.key)}
            className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${activeTab === t.key ? 'bg-brand-600 text-white' : 'bg-white text-gray-600 border border-gray-200 hover:border-brand-600'}`}>
            {t.label}
          </button>
        ))}
      </div>

      <div className="bg-white rounded-xl shadow-sm p-6 space-y-4">
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
