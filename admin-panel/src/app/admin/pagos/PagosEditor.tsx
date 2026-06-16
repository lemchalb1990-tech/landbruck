'use client'

import { useState } from 'react'

interface MPConfig   { enabled: boolean; sandbox: boolean; publicKey: string; accessToken: string }
interface FlowConfig { enabled: boolean; sandbox: boolean; apiKey: string;   secretKey: string }
interface PaymentsConfig { mercadopago: MPConfig; flow: FlowConfig }

function Toggle({ checked, onChange }: { checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <button type="button" onClick={() => onChange(!checked)}
      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${checked ? 'bg-brand-600' : 'bg-gray-300'}`}>
      <span className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${checked ? 'translate-x-6' : 'translate-x-1'}`} />
    </button>
  )
}

function Field({ label, value, onChange, placeholder, type = 'text' }: {
  label: string; value: string; onChange: (v: string) => void; placeholder?: string; type?: string
}) {
  return (
    <div>
      <label className="block text-xs font-medium text-gray-600 mb-1">{label}</label>
      <input type={type} value={value} onChange={e => onChange(e.target.value)}
        placeholder={placeholder} autoComplete="off"
        className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-brand-500" />
    </div>
  )
}

export default function PagosEditor({ payments: initial }: { payments: PaymentsConfig }) {
  const [payments, setPayments] = useState(initial)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState('')

  function updMP(field: keyof MPConfig, value: string | boolean) {
    setPayments(p => ({ ...p, mercadopago: { ...p.mercadopago, [field]: value } }))
  }
  function updFlow(field: keyof FlowConfig, value: string | boolean) {
    setPayments(p => ({ ...p, flow: { ...p.flow, [field]: value } }))
  }

  async function save() {
    setSaving(true); setError('')
    const res = await fetch('/api/site-config', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ key: 'payments', value: payments }),
    })
    setSaving(false)
    if (!res.ok) { setError('Error al guardar'); return }
    setSaved(true)
    setTimeout(() => setSaved(false), 2500)
  }

  return (
    <div className="space-y-5">

      {/* MercadoPago */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
          <div>
            <p className="font-semibold text-gray-900">MercadoPago</p>
            <p className="text-xs text-gray-500 mt-0.5">Pagos con tarjeta, transferencia y más</p>
          </div>
          <Toggle checked={payments.mercadopago.enabled} onChange={v => updMP('enabled', v)} />
        </div>
        {payments.mercadopago.enabled && (
          <div className="px-5 py-4 space-y-4">
            <label className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer">
              <input type="checkbox" checked={payments.mercadopago.sandbox}
                onChange={e => updMP('sandbox', e.target.checked)} className="rounded" />
              Modo sandbox (pruebas)
            </label>
            <div className="grid grid-cols-1 gap-3">
              <Field label="Public Key" value={payments.mercadopago.publicKey}
                onChange={v => updMP('publicKey', v)} placeholder="APP_USR-xxxxxxxx..." />
              <Field label="Access Token" value={payments.mercadopago.accessToken}
                onChange={v => updMP('accessToken', v)} placeholder="APP_USR-xxxxxxxx..." type="password" />
            </div>
            <p className="text-xs text-gray-400">
              Webhook URL: <code className="bg-gray-100 px-1 rounded">/api/webhooks/mercadopago</code>
            </p>
          </div>
        )}
      </div>

      {/* Flow */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
          <div>
            <p className="font-semibold text-gray-900">Flow</p>
            <p className="text-xs text-gray-500 mt-0.5">Pagos con tarjeta de crédito/débito en Chile</p>
          </div>
          <Toggle checked={payments.flow.enabled} onChange={v => updFlow('enabled', v)} />
        </div>
        {payments.flow.enabled && (
          <div className="px-5 py-4 space-y-4">
            <label className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer">
              <input type="checkbox" checked={payments.flow.sandbox}
                onChange={e => updFlow('sandbox', e.target.checked)} className="rounded" />
              Modo sandbox (pruebas)
            </label>
            <div className="grid grid-cols-1 gap-3">
              <Field label="API Key" value={payments.flow.apiKey}
                onChange={v => updFlow('apiKey', v)} placeholder="Tu API Key de Flow" />
              <Field label="Secret Key" value={payments.flow.secretKey}
                onChange={v => updFlow('secretKey', v)} placeholder="Tu Secret Key de Flow" type="password" />
            </div>
            <p className="text-xs text-gray-400">
              URL Confirmación: <code className="bg-gray-100 px-1 rounded">/api/webhooks/flow</code>
            </p>
          </div>
        )}
      </div>

      {error && <p className="text-sm text-red-600">{error}</p>}

      <button onClick={save} disabled={saving}
        className="px-5 py-2 bg-brand-600 text-white rounded-lg text-sm font-medium hover:bg-brand-700 disabled:opacity-50 transition-colors">
        {saving ? 'Guardando...' : saved ? '¡Guardado!' : 'Guardar cambios'}
      </button>
    </div>
  )
}
