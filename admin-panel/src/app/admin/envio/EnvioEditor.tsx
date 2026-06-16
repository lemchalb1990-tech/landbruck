'use client'

import { useState } from 'react'
import { Plus, Trash2 } from 'lucide-react'

interface Region { name: string; cost: number }

interface ShippingConfig {
  enabled:       boolean
  apiUrl:        string
  apiKey:        string
  accountNumber: string
  originCity:    string
  originAddress: string
  originPhone:   string
  service:       string
  shippingCost:  number
  regions:       Region[]
}

function Toggle({ checked, onChange }: { checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <button type="button" onClick={() => onChange(!checked)}
      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${checked ? 'bg-brand-600' : 'bg-gray-300'}`}>
      <span className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${checked ? 'translate-x-6' : 'translate-x-1'}`} />
    </button>
  )
}

function Field({ label, value, onChange, placeholder, type = 'text', hint }: {
  label: string; value: string | number; onChange: (v: string) => void
  placeholder?: string; type?: string; hint?: string
}) {
  return (
    <div>
      <label className="block text-xs font-medium text-gray-600 mb-1">{label}</label>
      <input type={type} value={value} onChange={e => onChange(e.target.value)}
        placeholder={placeholder} autoComplete="off"
        className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-brand-500" />
      {hint && <p className="text-xs text-gray-400 mt-1">{hint}</p>}
    </div>
  )
}

export default function EnvioEditor({ shipping: init }: { shipping: ShippingConfig }) {
  const [cfg, setCfg]       = useState(init)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved]   = useState(false)
  const [error, setError]   = useState('')

  function upd(field: keyof ShippingConfig, v: string | boolean | number | Region[]) {
    setCfg(c => ({ ...c, [field]: v }))
  }

  function updRegion(i: number, field: keyof Region, v: string) {
    const regions = cfg.regions.map((r, idx) =>
      idx === i ? { ...r, [field]: field === 'cost' ? (parseInt(v) || 0) : v } : r
    )
    upd('regions', regions)
  }

  function addRegion() {
    upd('regions', [...cfg.regions, { name: '', cost: 0 }])
  }

  function removeRegion(i: number) {
    upd('regions', cfg.regions.filter((_, idx) => idx !== i))
  }

  async function save() {
    setSaving(true); setError('')
    const res = await fetch('/api/site-config', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ key: 'shipping', value: cfg }),
    })
    setSaving(false)
    if (!res.ok) { setError('Error al guardar'); return }
    setSaved(true)
    setTimeout(() => setSaved(false), 2500)
  }

  return (
    <div className="space-y-5">

      {/* Credenciales Starken */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
          <div>
            <p className="font-semibold text-gray-900">Starken API</p>
            <p className="text-xs text-gray-500 mt-0.5">Activar integración de despacho con Starken</p>
          </div>
          <Toggle checked={cfg.enabled} onChange={v => upd('enabled', v)} />
        </div>

        {cfg.enabled && (
          <div className="px-5 py-4 space-y-4">
            <Field label="URL API" value={cfg.apiUrl} onChange={v => upd('apiUrl', v)}
              placeholder="https://api.starken.cl" hint="No modificar salvo indicación de Starken" />
            <Field label="API Key" value={cfg.apiKey} onChange={v => upd('apiKey', v)}
              placeholder="Tu clave de API Starken" type="password" />
            <Field label="Número de cuenta" value={cfg.accountNumber} onChange={v => upd('accountNumber', v)}
              placeholder="Ej: 123456" />
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Tipo de servicio</label>
              <select value={cfg.service} onChange={e => upd('service', e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500">
                <option value="NORMAL">Normal</option>
                <option value="EXPRESS">Express</option>
                <option value="SOBRE">Sobre</option>
              </select>
            </div>
          </div>
        )}
      </div>

      {/* Origen */}
      {cfg.enabled && (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-100">
            <p className="font-semibold text-gray-900">Datos de origen</p>
            <p className="text-xs text-gray-500 mt-0.5">Desde dónde se despachan los pedidos</p>
          </div>
          <div className="px-5 py-4 space-y-4">
            <Field label="Ciudad origen" value={cfg.originCity} onChange={v => upd('originCity', v)} placeholder="Santiago" />
            <Field label="Dirección bodega" value={cfg.originAddress} onChange={v => upd('originAddress', v)} placeholder="Av. Ejemplo 1234, Bodega 5" />
            <Field label="Teléfono contacto" value={cfg.originPhone} onChange={v => upd('originPhone', v)} placeholder="+56 9 1234 5678" />
          </div>
        </div>
      )}

      {/* Tarifas por región */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-100">
          <p className="font-semibold text-gray-900">Tarifas por región</p>
          <p className="text-xs text-gray-500 mt-0.5">
            El costo se selecciona según la ciudad ingresada en el checkout. Si no hay coincidencia se usa el costo por defecto.
          </p>
        </div>
        <div className="px-5 py-4 space-y-3">

          {cfg.regions.length > 0 && (
            <div className="space-y-2">
              <div className="grid grid-cols-[1fr_120px_32px] gap-2 text-xs font-medium text-gray-500 px-1">
                <span>Región / ciudad</span>
                <span>Costo (CLP)</span>
                <span />
              </div>
              {cfg.regions.map((r, i) => (
                <div key={i} className="grid grid-cols-[1fr_120px_32px] gap-2 items-center">
                  <input
                    value={r.name}
                    onChange={e => updRegion(i, 'name', e.target.value)}
                    placeholder="Ej: Temuco"
                    className="border border-gray-300 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
                  />
                  <input
                    type="number"
                    value={r.cost}
                    onChange={e => updRegion(i, 'cost', e.target.value)}
                    placeholder="6990"
                    className="border border-gray-300 rounded-lg px-3 py-1.5 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-brand-500"
                  />
                  <button type="button" onClick={() => removeRegion(i)}
                    className="flex items-center justify-center w-8 h-8 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors">
                    <Trash2 size={14} />
                  </button>
                </div>
              ))}
            </div>
          )}

          <button type="button" onClick={addRegion}
            className="flex items-center gap-1.5 text-xs font-medium text-brand-600 hover:text-brand-700 transition-colors">
            <Plus size={14} />
            Agregar región
          </button>

          <div className="pt-3 border-t border-gray-100">
            <Field
              label="Costo por defecto (CLP)"
              value={cfg.shippingCost}
              onChange={v => upd('shippingCost', parseInt(v) || 0)}
              placeholder="5000"
              type="number"
              hint="Se aplica cuando la ciudad del cliente no coincide con ninguna región. Ingresa 0 para envío gratis."
            />
          </div>
        </div>
      </div>

      {error && <p className="text-sm text-red-600">{error}</p>}

      <button onClick={save} disabled={saving}
        className="px-5 py-2 bg-brand-600 text-white rounded-lg text-sm font-medium hover:bg-brand-700 disabled:opacity-50 transition-colors">
        {saving ? 'Guardando...' : saved ? '¡Guardado!' : 'Guardar cambios'}
      </button>
    </div>
  )
}
