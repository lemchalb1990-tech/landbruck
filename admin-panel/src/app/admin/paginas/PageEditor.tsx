'use client'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import Image from 'next/image'
import {
  Upload, Plus, Trash2, ChevronDown, ChevronUp,
  Sprout, Leaf, Wrench, FlaskConical, Sun, Droplets, Package, TreePine, Hammer,
  Award, Users, Star, Heart, ShieldCheck, Truck, CheckCircle,
} from 'lucide-react'

interface AboutValue { id: number; icon: string; title: string; desc: string; color: string }
interface Logo { type: 'text' | 'image'; value: string }
interface SiteInfo { name: string; description: string; favicon: string }
export interface Slide { id: number; image: string; tag: string; title: string; subtitle: string; cta: string; href: string }
export interface CategoryConfig { id: number; name: string; slug: string; icon: string; color: string; active: boolean }
export interface SectionsConfig {
  hero: boolean; categories: boolean; featured: boolean; benefits: boolean; cta: boolean
  nosotros: boolean; contacto: boolean
}
interface Config {
  logo: Logo
  siteInfo: SiteInfo
  heroSlides: Slide[]
  sections: SectionsConfig
  homepageCategories: CategoryConfig[]
  about: { title: string; content: string }
  contact: { email: string; phone: string; address: string }
}

const ICON_MAP: Record<string, React.ElementType> = {
  Sprout, Leaf, Wrench, FlaskConical, Sun, Droplets, Package, TreePine, Hammer,
}

const ABOUT_ICON_MAP: Record<string, React.ElementType> = {
  Sprout, Award, Users, Leaf, Star, Heart, ShieldCheck, Package, Truck, CheckCircle,
}

const ABOUT_COLOR_OPTIONS: Record<string, { label: string; bg: string; text: string }> = {
  green:   { label: 'Verde',     bg: 'bg-green-100',   text: 'text-green-700' },
  brand:   { label: 'Marca',     bg: 'bg-brand-100',   text: 'text-brand-700' },
  blue:    { label: 'Azul',      bg: 'bg-blue-100',    text: 'text-blue-700' },
  emerald: { label: 'Esmeralda', bg: 'bg-emerald-100', text: 'text-emerald-700' },
  amber:   { label: 'Ámbar',     bg: 'bg-amber-100',   text: 'text-amber-700' },
  red:     { label: 'Rojo',      bg: 'bg-red-100',     text: 'text-red-700' },
  purple:  { label: 'Morado',    bg: 'bg-purple-100',  text: 'text-purple-700' },
  orange:  { label: 'Naranja',   bg: 'bg-orange-100',  text: 'text-orange-700' },
}

const COLOR_OPTIONS: Record<string, { label: string; bg: string; text: string }> = {
  green:   { label: 'Verde',      bg: 'bg-green-100',   text: 'text-green-700' },
  amber:   { label: 'Ámbar',      bg: 'bg-amber-100',   text: 'text-amber-700' },
  blue:    { label: 'Azul',       bg: 'bg-blue-100',    text: 'text-blue-700' },
  emerald: { label: 'Esmeralda',  bg: 'bg-emerald-100', text: 'text-emerald-700' },
  red:     { label: 'Rojo',       bg: 'bg-red-100',     text: 'text-red-700' },
  purple:  { label: 'Morado',     bg: 'bg-purple-100',  text: 'text-purple-700' },
  orange:  { label: 'Naranja',    bg: 'bg-orange-100',  text: 'text-orange-700' },
  teal:    { label: 'Teal',       bg: 'bg-teal-100',    text: 'text-teal-700' },
}

const DEFAULT_SECTIONS: SectionsConfig = {
  hero: true, categories: true, featured: true, benefits: true, cta: true, nosotros: true, contacto: true,
}

export default function PageEditor({ config }: { config: Config }) {
  const [activeTab, setActiveTab] = useState<'logo' | 'hero' | 'about' | 'contact' | 'sections' | 'categories'>('logo')
  const [saved, setSaved] = useState(false)

  // Logo
  const [logo, setLogo] = useState<Logo>(config.logo)
  const [uploading, setUploading] = useState(false)
  const DEFAULT_SITE_INFO: SiteInfo = { name: 'Landbruck', description: 'Semillas y productos agrícolas para tu huerto y jardín.', favicon: '' }
  const [siteInfo, setSiteInfo] = useState<SiteInfo>({ ...DEFAULT_SITE_INFO, ...config.siteInfo })
  const [uploadingFavicon, setUploadingFavicon] = useState(false)

  // Hero slides
  const [slides, setSlides] = useState<Slide[]>(config.heroSlides ?? [])
  const [expandedSlide, setExpandedSlide] = useState<number | null>(0)
  const [uploadingSlide, setUploadingSlide] = useState<number | null>(null)

  // Sections
  const [sections, setSections] = useState<SectionsConfig>({ ...DEFAULT_SECTIONS, ...(config.sections ?? {}) })

  // Categories
  const [cats, setCats] = useState<CategoryConfig[]>(config.homepageCategories ?? [])

  // WhatsApp (contacto)
  const DEFAULT_WHATSAPP = { enabled: true, title: '¿Prefieres WhatsApp?', description: 'Respondemos rápido, de lunes a viernes.', buttonText: 'Escribir por WhatsApp', phone: '56912345678' }
  const contactExt = config.contact as typeof config.contact & { whatsapp?: typeof DEFAULT_WHATSAPP }
  const [whatsapp, setWhatsapp] = useState({ ...DEFAULT_WHATSAPP, ...(contactExt.whatsapp ?? {}) })

  // Valores Nosotros
  const DEFAULT_ABOUT_VALUES: AboutValue[] = [
    { id: 1, icon: 'Sprout', title: 'Calidad en semillas', desc: 'Selección rigurosa de variedades adaptadas al clima chileno.', color: 'green' },
    { id: 2, icon: 'Award', title: 'Experiencia comprobada', desc: 'Años acompañando a agricultores y huerteros de todo Chile.', color: 'brand' },
    { id: 3, icon: 'Users', title: 'Atención personalizada', desc: 'Asesoría real antes y después de tu compra.', color: 'blue' },
    { id: 4, icon: 'Leaf', title: 'Compromiso con la tierra', desc: 'Promovemos prácticas sostenibles y responsables.', color: 'emerald' },
  ]
  const aboutExtBase = config.about as typeof config.about & { values?: AboutValue[]; cta?: typeof DEFAULT_ABOUT_CTA }
  const [aboutValues, setAboutValues] = useState<AboutValue[]>(aboutExtBase.values ?? DEFAULT_ABOUT_VALUES)

  // CTA Nosotros
  const DEFAULT_ABOUT_CTA = { enabled: true, title: '¿Tienes alguna pregunta?', description: 'Estamos aquí para ayudarte.', buttonText: 'Contáctanos', buttonUrl: '/contacto' }
  const aboutExt = config.about as typeof config.about & { cta?: typeof DEFAULT_ABOUT_CTA }
  const [aboutCta, setAboutCta] = useState({ ...DEFAULT_ABOUT_CTA, ...(aboutExt.cta ?? {}) })

  const { register, handleSubmit } = useForm({ defaultValues: config })

  /* ── Handlers ── */
  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]; if (!file) return
    setUploading(true)
    try {
      const form = new FormData(); form.append('file', file)
      const { url } = await fetch('/api/upload', { method: 'POST', body: form }).then(r => r.json())
      setLogo({ type: 'image', value: url })
    } finally { setUploading(false) }
  }

  const handleFaviconUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]; if (!file) return
    setUploadingFavicon(true)
    try {
      const form = new FormData(); form.append('file', file)
      const { url } = await fetch('/api/upload', { method: 'POST', body: form }).then(r => r.json())
      setSiteInfo(s => ({ ...s, favicon: url }))
    } finally { setUploadingFavicon(false) }
  }

  const handleSlideImageUpload = async (index: number, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]; if (!file) return
    setUploadingSlide(index)
    try {
      const form = new FormData(); form.append('file', file)
      const { url } = await fetch('/api/upload', { method: 'POST', body: form }).then(r => r.json())
      updateSlide(index, 'image', url)
    } finally { setUploadingSlide(null) }
  }

  const updateSlide = (i: number, field: keyof Slide, v: string | number) =>
    setSlides(prev => prev.map((s, idx) => idx === i ? { ...s, [field]: v } : s))

  const addSlide = () => {
    setSlides(prev => [...prev, { id: Date.now(), image: '', tag: 'Nuevo slide', title: 'Título', subtitle: '', cta: 'Ver productos', href: '/productos' }])
    setExpandedSlide(slides.length)
  }

  const updateCat = (i: number, field: keyof CategoryConfig, v: string | number | boolean) =>
    setCats(prev => prev.map((c, idx) => idx === i ? { ...c, [field]: v } : c))

  const addCat = () =>
    setCats(prev => [...prev, { id: Date.now(), name: 'Nueva categoría', slug: 'nueva-categoria', icon: 'Sprout', color: 'green', active: true }])

  const onSubmit = async (data: Config) => {
    await Promise.all([
      post('logo', logo),
      post('siteInfo', siteInfo),
      post('heroSlides', slides),
      post('sections', sections),
      post('homepageCategories', cats),
      post('about', { ...data.about, values: aboutValues, cta: aboutCta }),
      post('contact', { ...data.contact, whatsapp }),
    ])
    setSaved(true); setTimeout(() => setSaved(false), 2000)
  }

  const post = (key: string, value: unknown) =>
    fetch('/api/site-config', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ key, value }) })

  const tabs = [
    { key: 'logo',       label: 'Logo' },
    { key: 'hero',       label: 'Hero / Inicio' },
    { key: 'about',      label: 'Nosotros' },
    { key: 'contact',    label: 'Contacto' },
    { key: 'sections',   label: 'Secciones' },
    { key: 'categories', label: 'Categorías' },
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
                <input className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-600"
                  value={logo.value} onChange={e => setLogo({ type: 'text', value: e.target.value })} placeholder="Landbruck" />
              </div>
            )}
            {logo.type === 'image' && (
              <div className="space-y-3">
                <div>
                  <p className="text-xs font-medium text-gray-500 mb-1.5">Vista previa (tamaño real en navbar)</p>
                  <div className="inline-flex items-center bg-white border border-gray-200 rounded-lg px-4 h-16 shadow-sm">
                    {logo.value
                      ? <Image src={logo.value} alt="Logo" width={140} height={40} className="object-contain h-10 w-auto" />
                      : <span className="text-sm text-gray-300 italic">Sin imagen</span>}
                  </div>
                </div>
                <div className="bg-blue-50 border border-blue-100 rounded-lg px-4 py-3 text-xs text-blue-700 space-y-1">
                  <p className="font-semibold">Resolución recomendada</p>
                  <p>• Tamaño: <strong>300 × 80 px</strong> (o proporcional)</p>
                  <p>• Formato: <strong>PNG</strong> con fondo transparente</p>
                </div>
                <label className="flex items-center gap-2 cursor-pointer bg-gray-50 hover:bg-gray-100 border border-dashed border-gray-300 rounded-lg px-4 py-3 w-fit text-sm text-gray-600 transition-colors">
                  <Upload size={16} />
                  {uploading ? 'Subiendo...' : logo.value ? 'Cambiar imagen' : 'Subir imagen'}
                  <input type="file" accept="image/*" className="hidden" onChange={handleLogoUpload} disabled={uploading} />
                </label>
              </div>
            )}
            {/* ── Información del sitio ── */}
            <div className="pt-4 border-t border-gray-100 space-y-3">
              <h3 className="text-sm font-semibold text-gray-700">Información del sitio</h3>
              <p className="text-xs text-gray-400">Aparece en la pestaña del navegador y en resultados de búsqueda.</p>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nombre del sitio</label>
                <input className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-600"
                  value={siteInfo.name} onChange={e => setSiteInfo(s => ({ ...s, name: e.target.value }))} placeholder="Landbruck" />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Eslogan / descripción corta</label>
                <input className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-600"
                  value={siteInfo.description} onChange={e => setSiteInfo(s => ({ ...s, description: e.target.value }))} placeholder="Semillas y productos agrícolas" />
                <p className="text-xs text-gray-400 mt-0.5">Pestaña: <span className="font-medium">{siteInfo.name || 'Nombre'} — {siteInfo.description || 'Eslogan'}</span></p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Favicon (ícono del navegador)</label>
                {siteInfo.favicon && (
                  <div className="flex items-center gap-2 mb-2">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={siteInfo.favicon} alt="favicon" className="w-8 h-8 object-contain border border-gray-200 rounded p-0.5 bg-white" />
                    <span className="text-xs text-gray-400">Vista previa del ícono</span>
                  </div>
                )}
                <div className="bg-blue-50 border border-blue-100 rounded-lg px-4 py-3 text-xs text-blue-700 space-y-0.5 mb-2">
                  <p className="font-semibold">Resolución recomendada</p>
                  <p>• Tamaño: <strong>32 × 32 px</strong> o <strong>512 × 512 px</strong></p>
                  <p>• Formato: <strong>PNG</strong> con fondo transparente</p>
                </div>
                <label className="flex items-center gap-2 cursor-pointer bg-gray-50 hover:bg-gray-100 border border-dashed border-gray-300 rounded-lg px-4 py-3 w-fit text-sm text-gray-600 transition-colors">
                  <Upload size={16} />
                  {uploadingFavicon ? 'Subiendo...' : siteInfo.favicon ? 'Cambiar ícono' : 'Subir ícono'}
                  <input type="file" accept="image/png,image/x-icon,image/svg+xml" className="hidden" onChange={handleFaviconUpload} disabled={uploadingFavicon} />
                </label>
              </div>
            </div>
          </div>
        )}

        {/* ── Hero ── */}
        {activeTab === 'hero' && (
          <div className="space-y-3">
            <p className="text-sm text-gray-500">Configura los slides del carousel. Cada slide tiene imagen, etiqueta, título, subtítulo y botón.</p>
            {slides.map((slide, index) => (
              <div key={slide.id} className="border border-gray-200 rounded-lg overflow-hidden">
                <div className="flex items-center justify-between px-4 py-3 bg-gray-50 cursor-pointer select-none"
                  onClick={() => setExpandedSlide(expandedSlide === index ? null : index)}>
                  <div className="flex items-center gap-3">
                    {slide.image && <img src={slide.image} alt="" className="w-14 h-9 object-cover rounded" />}
                    <span className="text-sm font-medium text-gray-700">Slide {index + 1}{slide.tag ? ` — ${slide.tag}` : ''}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <button type="button" onClick={e => { e.stopPropagation(); setSlides(p => p.filter((_, i) => i !== index)); if (expandedSlide === index) setExpandedSlide(null) }}
                      className="p-1 text-red-400 hover:text-red-600 rounded transition-colors"><Trash2 size={15} /></button>
                    {expandedSlide === index ? <ChevronUp size={16} className="text-gray-400" /> : <ChevronDown size={16} className="text-gray-400" />}
                  </div>
                </div>
                {expandedSlide === index && (
                  <div className="p-4 space-y-4 border-t border-gray-100">
                    <div>
                      <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Imagen de fondo</label>
                      <div className="flex gap-2 items-start">
                        <input type="text" placeholder="https://..." value={slide.image}
                          onChange={e => updateSlide(index, 'image', e.target.value)}
                          className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-600" />
                        <label className="flex items-center gap-1.5 cursor-pointer bg-gray-50 hover:bg-gray-100 border border-dashed border-gray-300 rounded-lg px-3 py-2 text-xs text-gray-600 transition-colors whitespace-nowrap shrink-0">
                          <Upload size={13} />{uploadingSlide === index ? 'Subiendo…' : 'Subir'}
                          <input type="file" accept="image/*" className="hidden" onChange={e => handleSlideImageUpload(index, e)} disabled={uploadingSlide !== null} />
                        </label>
                      </div>
                      {slide.image && <div className="mt-2 relative h-28 rounded-lg overflow-hidden bg-gray-100">
                        <img src={slide.image} alt="preview" className="w-full h-full object-cover" />
                        <span className="absolute bottom-1.5 right-2 text-white/70 text-xs font-medium drop-shadow">Vista previa</span>
                      </div>}
                    </div>
                    <SlideField label="Etiqueta (tag)" value={slide.tag} onChange={e => updateSlide(index, 'tag', e.target.value)} placeholder="Temporada de siembra" />
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Título</label>
                      <textarea rows={2} value={slide.title} onChange={e => updateSlide(index, 'title', e.target.value)} placeholder="Título del slide"
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-600" />
                      <p className="text-xs text-gray-400 mt-0.5">Usa Enter para dividir el título en dos líneas.</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Subtítulo</label>
                      <textarea rows={2} value={slide.subtitle} onChange={e => updateSlide(index, 'subtitle', e.target.value)} placeholder="Descripción breve"
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-600" />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <SlideField label="Texto del botón" value={slide.cta} onChange={e => updateSlide(index, 'cta', e.target.value)} placeholder="Ver productos" />
                      <SlideField label="URL del botón" value={slide.href} onChange={e => updateSlide(index, 'href', e.target.value)} placeholder="/productos" />
                    </div>
                  </div>
                )}
              </div>
            ))}
            <button type="button" onClick={addSlide}
              className="flex items-center justify-center gap-2 w-full text-sm font-medium text-brand-600 hover:text-brand-700 border border-dashed border-brand-300 hover:border-brand-500 px-4 py-2.5 rounded-lg transition-colors">
              <Plus size={16} />Agregar slide
            </button>
          </div>
        )}

        {/* ── Nosotros ── */}
        {activeTab === 'about' && (
          <>
            <Field label="Título de la página" {...register('about.title')} />
            <Field label="Descripción / contenido" {...register('about.content')} textarea rows={6} />

            {/* Tarjetas de valores */}
            <div className="pt-4 border-t border-gray-100 space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold text-gray-700">Tarjetas de valores</p>
                  <p className="text-xs text-gray-400 mt-0.5">Las 4 tarjetas que aparecen debajo del texto</p>
                </div>
              </div>
              {aboutValues.map((val, index) => {
                const Icon = ABOUT_ICON_MAP[val.icon] ?? Leaf
                const c = ABOUT_COLOR_OPTIONS[val.color] ?? ABOUT_COLOR_OPTIONS.green
                return (
                  <div key={val.id} className="border border-gray-200 rounded-lg p-4 space-y-3">
                    <div className="flex items-center gap-3">
                      <div className={`w-9 h-9 shrink-0 rounded-lg flex items-center justify-center ${c.bg} ${c.text}`}>
                        <Icon size={18} />
                      </div>
                      <input value={val.title} onChange={e => setAboutValues(p => p.map((v, i) => i === index ? { ...v, title: e.target.value } : v))}
                        className="flex-1 border border-gray-300 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-600" placeholder="Título" />
                      <button type="button" onClick={() => setAboutValues(p => p.filter((_, i) => i !== index))}
                        className="p-1.5 text-red-400 hover:text-red-600 rounded transition-colors shrink-0"><Trash2 size={15} /></button>
                    </div>
                    <textarea value={val.desc} rows={2} onChange={e => setAboutValues(p => p.map((v, i) => i === index ? { ...v, desc: e.target.value } : v))}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-600" placeholder="Descripción" />
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-gray-500">Ícono:</span>
                        <select value={val.icon} onChange={e => setAboutValues(p => p.map((v, i) => i === index ? { ...v, icon: e.target.value } : v))}
                          className="border border-gray-300 rounded-lg px-2 py-1 text-xs focus:outline-none focus:ring-2 focus:ring-brand-600">
                          {Object.keys(ABOUT_ICON_MAP).map(k => <option key={k} value={k}>{k}</option>)}
                        </select>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-gray-500">Color:</span>
                        <div className="flex gap-1">
                          {Object.entries(ABOUT_COLOR_OPTIONS).map(([key, { bg }]) => (
                            <button key={key} type="button" title={key} onClick={() => setAboutValues(p => p.map((v, i) => i === index ? { ...v, color: key } : v))}
                              className={`w-5 h-5 rounded-full ${bg} border-2 transition-all ${val.color === key ? 'border-gray-600 scale-110' : 'border-transparent'}`} />
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                )
              })}
              <button type="button"
                onClick={() => setAboutValues(p => [...p, { id: Date.now(), icon: 'Sprout', title: 'Nueva tarjeta', desc: '', color: 'green' }])}
                className="flex items-center justify-center gap-2 w-full text-sm font-medium text-brand-600 hover:text-brand-700 border border-dashed border-brand-300 hover:border-brand-500 px-4 py-2.5 rounded-lg transition-colors">
                <Plus size={16} />Agregar tarjeta
              </button>
            </div>

            <div className="pt-4 border-t border-gray-100 space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold text-gray-700">Sección llamada a la acción</p>
                  <p className="text-xs text-gray-400 mt-0.5">Banner al final de la página Nosotros</p>
                </div>
                <Toggle checked={aboutCta.enabled} onChange={v => setAboutCta(s => ({ ...s, enabled: v }))} />
              </div>
              {aboutCta.enabled && (
                <div className="space-y-3">
                  <SlideField label="Título" value={aboutCta.title} onChange={e => setAboutCta(s => ({ ...s, title: e.target.value }))} />
                  <SlideField label="Descripción" value={aboutCta.description} onChange={e => setAboutCta(s => ({ ...s, description: e.target.value }))} />
                  <div className="grid grid-cols-2 gap-3">
                    <SlideField label="Texto del botón" value={aboutCta.buttonText} onChange={e => setAboutCta(s => ({ ...s, buttonText: e.target.value }))} />
                    <SlideField label="URL del botón" value={aboutCta.buttonUrl} onChange={e => setAboutCta(s => ({ ...s, buttonUrl: e.target.value }))} placeholder="/contacto" />
                  </div>
                </div>
              )}
            </div>
          </>
        )}

        {/* ── Contacto ── */}
        {activeTab === 'contact' && (
          <>
            <Field label="Email" {...register('contact.email')} />
            <Field label="Teléfono" {...register('contact.phone')} />
            <Field label="Dirección" {...register('contact.address')} />

            <div className="pt-4 border-t border-gray-100 space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold text-gray-700">Sección WhatsApp</p>
                  <p className="text-xs text-gray-400 mt-0.5">Banner de WhatsApp al final de la página Contacto</p>
                </div>
                <Toggle checked={whatsapp.enabled} onChange={v => setWhatsapp(s => ({ ...s, enabled: v }))} />
              </div>
              {whatsapp.enabled && (
                <div className="space-y-3">
                  <SlideField label="Título" value={whatsapp.title} onChange={e => setWhatsapp(s => ({ ...s, title: e.target.value }))} />
                  <SlideField label="Descripción" value={whatsapp.description} onChange={e => setWhatsapp(s => ({ ...s, description: e.target.value }))} />
                  <SlideField label="Texto del botón" value={whatsapp.buttonText} onChange={e => setWhatsapp(s => ({ ...s, buttonText: e.target.value }))} />
                  <SlideField label="Número de WhatsApp (sin +)" value={whatsapp.phone} onChange={e => setWhatsapp(s => ({ ...s, phone: e.target.value }))} placeholder="56912345678" />
                </div>
              )}
            </div>
          </>
        )}

        {/* ── Secciones ── */}
        {activeTab === 'sections' && (
          <div className="space-y-3">
            <p className="text-sm text-gray-500">Activa o desactiva secciones y páginas del sitio.</p>
            <div className="space-y-2">
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide px-1">Inicio</p>
              <SectionRow label="Hero / Carousel" desc="El slider de imágenes en la portada" checked={sections.hero} onChange={v => setSections(s => ({ ...s, hero: v }))} />
              <SectionRow label="Categorías" desc="Grilla de categorías de productos" checked={sections.categories} onChange={v => setSections(s => ({ ...s, categories: v }))} />
              <SectionRow label="Productos destacados" desc="Productos marcados como destacados" checked={sections.featured} onChange={v => setSections(s => ({ ...s, featured: v }))} />
              <SectionRow label="Beneficios" desc="Íconos con ventajas (envío, calidad, seguridad...)" checked={sections.benefits} onChange={v => setSections(s => ({ ...s, benefits: v }))} />
              <SectionRow label="Banner WhatsApp" desc="CTA al final de la portada" checked={sections.cta} onChange={v => setSections(s => ({ ...s, cta: v }))} />
            </div>
            <div className="space-y-2 pt-2 border-t border-gray-100">
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide px-1 pt-1">Páginas</p>
              <SectionRow label="Página Nosotros" desc="La página /nosotros" checked={sections.nosotros} onChange={v => setSections(s => ({ ...s, nosotros: v }))} />
              <SectionRow label="Página Contacto" desc="La página /contacto" checked={sections.contacto} onChange={v => setSections(s => ({ ...s, contacto: v }))} />
            </div>
          </div>
        )}

        {/* ── Categorías ── */}
        {activeTab === 'categories' && (
          <div className="space-y-3">
            <p className="text-sm text-gray-500">Gestiona las categorías del inicio. Actívalas, edita su nombre, ícono y color.</p>
            {cats.map((cat, index) => {
              const Icon = ICON_MAP[cat.icon] ?? Sprout
              const c = COLOR_OPTIONS[cat.color] ?? COLOR_OPTIONS.green
              return (
                <div key={cat.id} className={`border rounded-lg p-4 space-y-3 transition-colors ${cat.active ? 'border-gray-200' : 'border-gray-100 bg-gray-50 opacity-60'}`}>
                  {/* Fila superior: toggle + icono + nombre + slug */}
                  <div className="flex items-center gap-3">
                    <Toggle checked={cat.active} onChange={v => updateCat(index, 'active', v)} />
                    <div className={`w-9 h-9 shrink-0 rounded-lg flex items-center justify-center ${c.bg} ${c.text}`}>
                      <Icon size={18} />
                    </div>
                    <input value={cat.name} onChange={e => updateCat(index, 'name', e.target.value)}
                      className="flex-1 border border-gray-300 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-600" placeholder="Nombre" />
                    <input value={cat.slug} onChange={e => updateCat(index, 'slug', e.target.value)}
                      className="w-32 border border-gray-300 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-600" placeholder="slug" />
                    <button type="button" onClick={() => setCats(p => p.filter((_, i) => i !== index))}
                      className="p-1.5 text-red-400 hover:text-red-600 rounded transition-colors shrink-0"><Trash2 size={15} /></button>
                  </div>
                  {/* Fila inferior: icono + color */}
                  <div className="flex items-center gap-4 pl-12">
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-gray-500">Ícono:</span>
                      <select value={cat.icon} onChange={e => updateCat(index, 'icon', e.target.value)}
                        className="border border-gray-300 rounded-lg px-2 py-1 text-xs focus:outline-none focus:ring-2 focus:ring-brand-600">
                        {Object.keys(ICON_MAP).map(k => <option key={k} value={k}>{k}</option>)}
                      </select>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-gray-500">Color:</span>
                      <div className="flex gap-1">
                        {Object.entries(COLOR_OPTIONS).map(([key, { bg }]) => (
                          <button key={key} type="button" title={key} onClick={() => updateCat(index, 'color', key)}
                            className={`w-5 h-5 rounded-full ${bg} border-2 transition-all ${cat.color === key ? 'border-gray-600 scale-110' : 'border-transparent'}`} />
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              )
            })}
            <button type="button" onClick={addCat}
              className="flex items-center justify-center gap-2 w-full text-sm font-medium text-brand-600 hover:text-brand-700 border border-dashed border-brand-300 hover:border-brand-500 px-4 py-2.5 rounded-lg transition-colors">
              <Plus size={16} />Agregar categoría
            </button>
          </div>
        )}

        <div className="pt-2">
          <button type="submit" className="bg-brand-600 hover:bg-brand-700 text-white font-medium px-6 py-2 rounded-lg text-sm transition-colors">
            {saved ? '✓ Guardado' : 'Guardar cambios'}
          </button>
        </div>
      </div>
    </form>
  )
}

/* ── Sub-components ── */

function Toggle({ checked, onChange }: { checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <button type="button" onClick={() => onChange(!checked)}
      className={`relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-colors focus:outline-none ${checked ? 'bg-brand-600' : 'bg-gray-200'}`}>
      <span className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${checked ? 'translate-x-6' : 'translate-x-1'}`} />
    </button>
  )
}

function SectionRow({ label, desc, checked, onChange }: { label: string; desc?: string; checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <div className={`flex items-center justify-between px-4 py-3.5 rounded-lg border transition-colors ${checked ? 'border-brand-200 bg-brand-50/40' : 'border-gray-100 bg-gray-50'}`}>
      <div>
        <p className={`text-sm font-medium ${checked ? 'text-gray-800' : 'text-gray-400'}`}>{label}</p>
        {desc && <p className="text-xs text-gray-400 mt-0.5">{desc}</p>}
      </div>
      <Toggle checked={checked} onChange={onChange} />
    </div>
  )
}

function Field({ label, textarea, rows, ...props }: { label: string; textarea?: boolean; rows?: number } & React.InputHTMLAttributes<HTMLInputElement | HTMLTextAreaElement>) {
  const cls = "w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-600"
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
      {textarea
        ? <textarea className={cls} rows={rows ?? 3} {...props as React.TextareaHTMLAttributes<HTMLTextAreaElement>} />
        : <input className={cls} {...props as React.InputHTMLAttributes<HTMLInputElement>} />}
    </div>
  )
}

function SlideField({ label, ...props }: { label: string } & React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
      <input className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-600" {...props} />
    </div>
  )
}
