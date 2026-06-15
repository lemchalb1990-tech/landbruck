'use client'
import { useState, useEffect } from 'react'

interface ThemeConfig {
  primaryColor: string
  buttonRadius: string
  fontFamily: string
}

const FONTS = [
  { value: 'system-ui', label: 'Sistema', note: 'Fuente por defecto del SO' },
  { value: 'Inter', label: 'Inter', note: 'Moderna y legible' },
  { value: 'Poppins', label: 'Poppins', note: 'Geométrica y amigable' },
  { value: 'Montserrat', label: 'Montserrat', note: 'Elegante y profesional' },
  { value: 'Roboto', label: 'Roboto', note: 'Limpia y versátil' },
  { value: 'Nunito', label: 'Nunito', note: 'Suave y redondeada' },
]

const BUTTON_STYLES = [
  { value: '9999px', label: 'Píldora', preview: 9999 },
  { value: '8px',    label: 'Redondeado', preview: 8 },
  { value: '0px',    label: 'Cuadrado', preview: 0 },
]

function hexToRgb(hex: string): [number, number, number] | null {
  const clean = hex.replace('#', '')
  if (!/^[0-9a-fA-F]{6}$/.test(clean)) return null
  return [parseInt(clean.slice(0, 2), 16), parseInt(clean.slice(2, 4), 16), parseInt(clean.slice(4, 6), 16)]
}

function rgbToHex(r: number, g: number, b: number): string {
  return '#' + [r, g, b].map(v => Math.min(255, Math.max(0, Math.round(v))).toString(16).padStart(2, '0')).join('')
}

function deriveShades(hex: string) {
  const rgb = hexToRgb(hex)
  if (!rgb) return null
  const [r, g, b] = rgb
  const mix = (t: number) => rgbToHex(r + (255 - r) * t, g + (255 - g) * t, b + (255 - b) * t)
  const dark = (t: number) => rgbToHex(r * (1 - t), g * (1 - t), b * (1 - t))
  return { '50': mix(0.95), '100': mix(0.88), '500': mix(0.1), '600': hex, '700': dark(0.12), '900': dark(0.35) }
}

function isLight(hex: string): boolean {
  const rgb = hexToRgb(hex)
  if (!rgb) return true
  const [r, g, b] = rgb
  return (r * 299 + g * 587 + b * 114) / 1000 > 128
}

export default function TemaEditor({ config }: { config: ThemeConfig }) {
  const [theme, setTheme] = useState<ThemeConfig>(config)
  const [hexInput, setHexInput] = useState(config.primaryColor)
  const [saved, setSaved] = useState(false)

  const shades = deriveShades(theme.primaryColor)

  // Cargar Google Font en el admin para previsualizar
  useEffect(() => {
    if (!theme.fontFamily || theme.fontFamily === 'system-ui') return
    const id = 'admin-font-preview'
    document.getElementById(id)?.remove()
    const link = document.createElement('link')
    link.id = id
    link.rel = 'stylesheet'
    link.href = `https://fonts.googleapis.com/css2?family=${encodeURIComponent(theme.fontFamily)}:wght@400;500;600;700&display=swap`
    document.head.appendChild(link)
  }, [theme.fontFamily])

  const handleHexChange = (val: string) => {
    setHexInput(val)
    if (/^#[0-9a-fA-F]{6}$/.test(val)) setTheme(t => ({ ...t, primaryColor: val }))
  }

  const handleSave = async () => {
    await fetch('/api/site-config', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ key: 'theme', value: theme }),
    })
    setSaved(true)
    setTimeout(() => setSaved(false), 2500)
  }

  const previewFont = theme.fontFamily !== 'system-ui' ? `'${theme.fontFamily}', system-ui, sans-serif` : undefined

  return (
    <div className="space-y-5">

      {/* ── Color primario ── */}
      <div className="bg-white rounded-xl shadow-sm p-6 space-y-4">
        <div>
          <h2 className="text-sm font-semibold text-gray-700">Color primario</h2>
          <p className="text-xs text-gray-400 mt-0.5">Define el color de botones, enlaces, bordes activos y fondos de acento</p>
        </div>

        <div className="flex items-center gap-3">
          <input
            type="color"
            value={theme.primaryColor}
            onChange={e => { setHexInput(e.target.value); setTheme(t => ({ ...t, primaryColor: e.target.value })) }}
            className="w-12 h-10 rounded-lg border border-gray-300 cursor-pointer p-0.5 bg-white"
          />
          <input
            type="text"
            value={hexInput}
            onChange={e => handleHexChange(e.target.value)}
            maxLength={7}
            placeholder="#16a34a"
            className="w-28 border border-gray-300 rounded-lg px-3 py-2 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-brand-600"
          />
        </div>

        {shades && (
          <div>
            <p className="text-xs text-gray-400 mb-2">Tonos generados automáticamente</p>
            <div className="flex gap-2 flex-wrap">
              {Object.entries(shades).map(([shade, hex]) => (
                <div key={shade} className="flex flex-col items-center gap-1">
                  <div
                    className="w-9 h-9 rounded-lg border border-black/10 shadow-sm flex items-center justify-center"
                    style={{ background: hex }}
                  >
                    <span className="text-[9px] font-bold" style={{ color: isLight(hex) ? '#374151' : '#fff' }}>
                      {shade}
                    </span>
                  </div>
                  <span className="text-[9px] text-gray-400 font-mono">{hex}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* ── Tipografía ── */}
      <div className="bg-white rounded-xl shadow-sm p-6 space-y-4">
        <div>
          <h2 className="text-sm font-semibold text-gray-700">Tipografía</h2>
          <p className="text-xs text-gray-400 mt-0.5">Fuente aplicada en todo el sitio</p>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {FONTS.map(font => {
            const fontStyle = font.value !== 'system-ui' ? `'${font.value}', system-ui, sans-serif` : undefined
            const isSelected = theme.fontFamily === font.value
            return (
              <label key={font.value} className={`cursor-pointer border-2 rounded-xl p-3 transition-all ${isSelected ? 'border-brand-600 bg-brand-50' : 'border-gray-200 hover:border-gray-300'}`}>
                <input type="radio" name="fontFamily" value={font.value}
                  checked={isSelected}
                  onChange={() => setTheme(t => ({ ...t, fontFamily: font.value }))}
                  className="sr-only" />
                <p className="text-sm font-semibold text-gray-800" style={{ fontFamily: fontStyle }}>{font.label}</p>
                <p className="text-xs text-gray-500 mt-0.5" style={{ fontFamily: fontStyle }}>Aa Bb Cc 123</p>
                <p className="text-[10px] text-gray-400 mt-1">{font.note}</p>
              </label>
            )
          })}
        </div>
      </div>

      {/* ── Botones ── */}
      <div className="bg-white rounded-xl shadow-sm p-6 space-y-4">
        <div>
          <h2 className="text-sm font-semibold text-gray-700">Estilo de botones</h2>
          <p className="text-xs text-gray-400 mt-0.5">Forma de los bordes en botones y elementos de acción del sitio</p>
        </div>
        <div className="flex gap-4">
          {BUTTON_STYLES.map(style => {
            const isSelected = theme.buttonRadius === style.value
            return (
              <label key={style.value} className={`flex-1 cursor-pointer border-2 rounded-xl p-4 text-center transition-all ${isSelected ? 'border-brand-600 bg-brand-50' : 'border-gray-200 hover:border-gray-300'}`}>
                <input type="radio" name="buttonRadius" value={style.value}
                  checked={isSelected}
                  onChange={() => setTheme(t => ({ ...t, buttonRadius: style.value }))}
                  className="sr-only" />
                <div className="flex justify-center mb-3">
                  <span
                    className="px-5 py-2 text-xs font-semibold text-white inline-block"
                    style={{ background: theme.primaryColor, borderRadius: style.value }}>
                    Botón
                  </span>
                </div>
                <p className={`text-xs font-semibold ${isSelected ? 'text-brand-700' : 'text-gray-700'}`}>{style.label}</p>
              </label>
            )
          })}
        </div>
      </div>

      {/* ── Vista previa ── */}
      <div className="bg-white rounded-xl shadow-sm p-6 space-y-3">
        <h2 className="text-sm font-semibold text-gray-700">Vista previa del sitio</h2>
        <div
          className="border border-gray-200 rounded-xl p-6 bg-gray-50 space-y-4"
          style={{ fontFamily: previewFont }}
        >
          {/* Mini navbar */}
          <div className="flex items-center justify-between pb-3 border-b border-gray-200">
            <span className="font-bold text-gray-900" style={{ color: theme.primaryColor }}>Landbruck</span>
            <div className="flex gap-4">
              {['Inicio', 'Productos', 'Nosotros'].map(l => (
                <span key={l} className="text-xs text-gray-500">{l}</span>
              ))}
            </div>
          </div>

          {/* Hero mini */}
          <div>
            <span
              className="inline-block text-xs font-semibold px-3 py-1 mb-2 rounded-full"
              style={{ background: shades?.['50'] ?? '#f0fdf4', color: theme.primaryColor }}>
              Temporada de siembra
            </span>
            <h3 className="text-xl font-bold text-gray-900 leading-tight">Semillas de alta<br/>calidad genética</h3>
            <p className="text-gray-500 text-xs mt-1 mb-4">Variedades seleccionadas para el clima chileno.</p>
            <div className="flex gap-3 flex-wrap">
              <span
                className="px-5 py-2 text-xs font-semibold text-white inline-block"
                style={{ background: theme.primaryColor, borderRadius: theme.buttonRadius }}>
                Ver productos
              </span>
              <span
                className="px-5 py-2 text-xs font-semibold inline-block border-2"
                style={{ borderColor: theme.primaryColor, color: theme.primaryColor, borderRadius: theme.buttonRadius, background: shades?.['50'] ?? '#f0fdf4' }}>
                Conocer más
              </span>
            </div>
          </div>

          {/* Mini cards */}
          <div className="grid grid-cols-3 gap-2 pt-2 border-t border-gray-200">
            {['Semillas', 'Herramientas', 'Insumos'].map(cat => (
              <div key={cat}
                className="rounded-xl p-3 text-center border"
                style={{ background: shades?.['50'] ?? '#f0fdf4', borderColor: shades?.['100'] ?? '#dcfce7' }}>
                <p className="text-xs font-semibold" style={{ color: theme.primaryColor }}>{cat}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Guardar ── */}
      <div className="flex items-center gap-4">
        <button
          onClick={handleSave}
          className="bg-brand-600 hover:bg-brand-700 text-white font-medium px-6 py-2.5 rounded-lg text-sm transition-colors">
          {saved ? '✓ Guardado' : 'Guardar tema'}
        </button>
        <p className="text-xs text-gray-400">Los cambios se aplican de inmediato en el sitio público.</p>
      </div>
    </div>
  )
}
