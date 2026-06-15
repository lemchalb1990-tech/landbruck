'use client'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import Image from 'next/image'
import { Upload, Plus, Trash2, ChevronDown, ChevronUp } from 'lucide-react'

interface Logo { type: 'text' | 'image'; value: string }
export interface Slide {
  id: number
  image: string
  tag: string
  title: string
  subtitle: string
  cta: string
  href: string
}
interface Config {
  logo: Logo
  heroSlides: Slide[]
  about: { title: string; content: string }
  contact: { email: string; phone: string; address: string }
}

export default function PageEditor({ config }: { config: Config }) {
  const [activeTab, setActiveTab] = useState<'logo' | 'hero' | 'about' | 'contact'>('logo')
  const [saved, setSaved] = useState(false)
  const [logo, setLogo] = useState<Logo>(config.logo)
  const [uploading, setUploading] = useState(false)
  const [slides, setSlides] = useState<Slide[]>(config.heroSlides ?? [])
  const [expandedSlide, setExpandedSlide] = useState<number | null>(0)
  const [uploadingSlide, setUploadingSlide] = useState<number | null>(null)
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

  const handleSlideImageUpload = async (index: number, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setUploadingSlide(index)
    try {
      const form = new FormData()
      form.append('file', file)
      const res = await fetch('/api/upload', { method: 'POST', body: form })
      const { url } = await res.json()
      updateSlide(index, 'image', url)
    } finally {
      setUploadingSlide(null)
    }
  }

  const updateSlide = (index: number, field: keyof Slide, value: string | number) => {
    setSlides(prev => prev.map((s, i) => i === index ? { ...s, [field]: value } : s))
  }

  const addSlide = () => {
    const newSlide: Slide = {
      id: Date.now(),
      image: '',
      tag: 'Nuevo slide',
      title: 'Título del slide',
      subtitle: '',
      cta: 'Ver productos',
      href: '/productos',
    }
    setSlides(prev => [...prev, newSlide])
    setExpandedSlide(slides.length)
  }

  const deleteSlide = (index: number) => {
    setSlides(prev => prev.filter((_, i) => i !== index))
    if (expandedSlide === index) setExpandedSlide(null)
  }

  const onSubmit = async (data: Config) => {
    await Promise.all([
      fetch('/api/site-config', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ key: 'logo', value: logo }) }),
      fetch('/api/site-config', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ key: 'heroSlides', value: slides }) }),
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

        {/* ── Logo ── */}
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

        {/* ── Hero / Inicio ── */}
        {activeTab === 'hero' && (
          <div className="space-y-3">
            <p className="text-sm text-gray-500">
              Configura los slides del carousel. Cada slide tiene imagen de fondo, etiqueta, título, subtítulo y botón de acción.
            </p>

            {slides.map((slide, index) => (
              <div key={slide.id} className="border border-gray-200 rounded-lg overflow-hidden">
                {/* Cabecera del slide */}
                <div
                  className="flex items-center justify-between px-4 py-3 bg-gray-50 cursor-pointer select-none"
                  onClick={() => setExpandedSlide(expandedSlide === index ? null : index)}
                >
                  <div className="flex items-center gap-3">
                    {slide.image && (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={slide.image} alt="" className="w-14 h-9 object-cover rounded" />
                    )}
                    <span className="text-sm font-medium text-gray-700">
                      Slide {index + 1}{slide.tag ? ` — ${slide.tag}` : ''}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={e => { e.stopPropagation(); deleteSlide(index) }}
                      className="p-1 text-red-400 hover:text-red-600 rounded transition-colors"
                      title="Eliminar slide"
                    >
                      <Trash2 size={15} />
                    </button>
                    {expandedSlide === index
                      ? <ChevronUp size={16} className="text-gray-400" />
                      : <ChevronDown size={16} className="text-gray-400" />
                    }
                  </div>
                </div>

                {/* Cuerpo del slide */}
                {expandedSlide === index && (
                  <div className="p-4 space-y-4 border-t border-gray-100">
                    {/* Imagen */}
                    <div>
                      <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Imagen de fondo</label>
                      <div className="flex gap-2 items-start">
                        <input
                          type="text"
                          placeholder="https://... (URL de la imagen)"
                          value={slide.image}
                          onChange={e => updateSlide(index, 'image', e.target.value)}
                          className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-600"
                        />
                        <label className="flex items-center gap-1.5 cursor-pointer bg-gray-50 hover:bg-gray-100 border border-dashed border-gray-300 rounded-lg px-3 py-2 text-xs text-gray-600 transition-colors whitespace-nowrap shrink-0">
                          <Upload size={13} />
                          {uploadingSlide === index ? 'Subiendo…' : 'Subir'}
                          <input
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={e => handleSlideImageUpload(index, e)}
                            disabled={uploadingSlide !== null}
                          />
                        </label>
                      </div>
                      {slide.image && (
                        <div className="mt-2 relative h-28 rounded-lg overflow-hidden bg-gray-100">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img src={slide.image} alt="preview" className="w-full h-full object-cover" />
                          <span className="absolute bottom-1.5 right-2 text-white/70 text-xs font-medium drop-shadow">Vista previa</span>
                        </div>
                      )}
                    </div>

                    {/* Tag */}
                    <SlideField
                      label="Etiqueta (tag)"
                      value={slide.tag}
                      onChange={e => updateSlide(index, 'tag', e.target.value)}
                      placeholder="Temporada de siembra"
                    />

                    {/* Título */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Título</label>
                      <textarea
                        rows={2}
                        value={slide.title}
                        onChange={e => updateSlide(index, 'title', e.target.value)}
                        placeholder="Título del slide"
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-600"
                      />
                      <p className="text-xs text-gray-400 mt-0.5">Puedes usar Enter para dividir el título en dos líneas.</p>
                    </div>

                    {/* Subtítulo */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Subtítulo</label>
                      <textarea
                        rows={2}
                        value={slide.subtitle}
                        onChange={e => updateSlide(index, 'subtitle', e.target.value)}
                        placeholder="Descripción breve del slide"
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-600"
                      />
                    </div>

                    {/* CTA */}
                    <div className="grid grid-cols-2 gap-3">
                      <SlideField
                        label="Texto del botón"
                        value={slide.cta}
                        onChange={e => updateSlide(index, 'cta', e.target.value)}
                        placeholder="Ver productos"
                      />
                      <SlideField
                        label="URL del botón"
                        value={slide.href}
                        onChange={e => updateSlide(index, 'href', e.target.value)}
                        placeholder="/productos"
                      />
                    </div>
                  </div>
                )}
              </div>
            ))}

            <button
              type="button"
              onClick={addSlide}
              className="flex items-center justify-center gap-2 w-full text-sm font-medium text-brand-600 hover:text-brand-700 border border-dashed border-brand-300 hover:border-brand-500 px-4 py-2.5 rounded-lg transition-colors"
            >
              <Plus size={16} />
              Agregar slide
            </button>
          </div>
        )}

        {/* ── Nosotros ── */}
        {activeTab === 'about' && (
          <>
            <Field label="Título" {...register('about.title')} />
            <Field label="Contenido" {...register('about.content')} textarea rows={6} />
          </>
        )}

        {/* ── Contacto ── */}
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

function SlideField({ label, ...props }: { label: string } & React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
      <input
        className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-600"
        {...props}
      />
    </div>
  )
}
