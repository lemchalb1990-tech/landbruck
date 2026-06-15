'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Trash2, Plus, Eye, EyeOff, ChevronUp, ChevronDown } from 'lucide-react'

interface MenuItem {
  id: number
  label: string
  url: string
  order: number
  visible: boolean
}

export default function MenuEditor({ items: initialItems }: { items: MenuItem[] }) {
  const [items, setItems] = useState<MenuItem[]>(initialItems)
  const [deletedIds, setDeletedIds] = useState<number[]>([])
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const router = useRouter()

  const update = (id: number, field: keyof MenuItem, value: string | boolean | number) =>
    setItems(prev => prev.map(i => i.id === id ? { ...i, [field]: value } : i))

  const moveUp = (index: number) => {
    if (index === 0) return
    setItems(prev => {
      const next = [...prev]
      ;[next[index - 1], next[index]] = [next[index], next[index - 1]]
      return next.map((item, i) => ({ ...item, order: i }))
    })
  }

  const moveDown = (index: number) => {
    setItems(prev => {
      if (index === prev.length - 1) return prev
      const next = [...prev]
      ;[next[index], next[index + 1]] = [next[index + 1], next[index]]
      return next.map((item, i) => ({ ...item, order: i }))
    })
  }

  const remove = (id: number) => {
    setItems(prev => prev.filter(i => i.id !== id))
    if (id > 0) setDeletedIds(prev => [...prev, id])
  }

  const addItem = () => {
    const tempId = -Date.now()
    setItems(prev => [...prev, { id: tempId, label: '', url: '/', order: prev.length, visible: true }])
  }

  const handleSave = async () => {
    const invalid = items.find(i => !i.label.trim() || !i.url.trim())
    if (invalid) {
      alert('Todos los ítems deben tener etiqueta y URL.')
      return
    }
    setSaving(true)
    try {
      await Promise.all([
        ...items.map((item, index) => {
          const body = { label: item.label, url: item.url, visible: item.visible, order: index }
          if (item.id > 0) {
            return fetch(`/api/menu/${item.id}`, {
              method: 'PATCH',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(body),
            })
          } else {
            return fetch('/api/menu', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(body),
            })
          }
        }),
        ...deletedIds.map(id => fetch(`/api/menu/${id}`, { method: 'DELETE' })),
      ])
      setDeletedIds([])
      setSaved(true)
      setTimeout(() => setSaved(false), 2500)
      router.refresh()
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="space-y-5">
      <div className="bg-white rounded-xl shadow-sm p-6 space-y-3">
        <div className="flex items-center justify-between mb-2">
          <div>
            <h2 className="font-semibold text-gray-700">Ítems del menú</h2>
            <p className="text-xs text-gray-400 mt-0.5">Edita el texto y URL de cada enlace. Usa las flechas para reordenar.</p>
          </div>
          <button
            onClick={handleSave}
            disabled={saving}
            className="bg-brand-600 hover:bg-brand-700 disabled:opacity-60 text-white text-sm font-medium px-5 py-2 rounded-lg transition-colors">
            {saved ? '✓ Guardado' : saving ? 'Guardando…' : 'Guardar menú'}
          </button>
        </div>

        {/* Header labels */}
        <div className="grid grid-cols-[32px_1fr_1fr_32px_32px_32px] gap-2 px-1 mb-1">
          <div />
          <span className="text-[11px] font-medium text-gray-400 uppercase tracking-wide">Etiqueta</span>
          <span className="text-[11px] font-medium text-gray-400 uppercase tracking-wide">URL</span>
          <div /><div /><div />
        </div>

        <div className="space-y-2">
          {items.map((item, index) => (
            <div key={item.id}
              className={`grid grid-cols-[32px_1fr_1fr_32px_32px_32px] gap-2 items-center p-2 rounded-lg border ${item.visible ? 'border-gray-200 bg-white' : 'border-dashed border-gray-200 bg-gray-50 opacity-60'}`}>

              {/* Reorder */}
              <div className="flex flex-col gap-0.5">
                <button onClick={() => moveUp(index)} disabled={index === 0}
                  className="p-0.5 text-gray-300 hover:text-gray-600 disabled:opacity-30 transition-colors">
                  <ChevronUp size={14} />
                </button>
                <button onClick={() => moveDown(index)} disabled={index === items.length - 1}
                  className="p-0.5 text-gray-300 hover:text-gray-600 disabled:opacity-30 transition-colors">
                  <ChevronDown size={14} />
                </button>
              </div>

              {/* Label */}
              <input
                value={item.label}
                onChange={e => update(item.id, 'label', e.target.value)}
                placeholder="Ej: Productos"
                className="border border-gray-300 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-600 w-full"
              />

              {/* URL */}
              <input
                value={item.url}
                onChange={e => update(item.id, 'url', e.target.value)}
                placeholder="/ruta"
                className="border border-gray-300 rounded-lg px-3 py-1.5 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-brand-600 w-full"
              />

              {/* Toggle visible */}
              <button
                onClick={() => update(item.id, 'visible', !item.visible)}
                title={item.visible ? 'Ocultar del menú' : 'Mostrar en el menú'}
                className={`p-1.5 rounded-lg transition-colors ${item.visible ? 'text-brand-600 hover:bg-brand-50' : 'text-gray-300 hover:bg-gray-100'}`}>
                {item.visible ? <Eye size={16} /> : <EyeOff size={16} />}
              </button>

              {/* Delete */}
              <button
                onClick={() => remove(item.id)}
                title="Eliminar"
                className="p-1.5 rounded-lg text-gray-300 hover:text-red-500 hover:bg-red-50 transition-colors">
                <Trash2 size={16} />
              </button>

              {/* spacer */}
              <div />
            </div>
          ))}
        </div>

        <button
          onClick={addItem}
          className="flex items-center gap-2 text-sm font-medium text-brand-600 hover:text-brand-700 mt-2 transition-colors">
          <Plus size={15} />
          Agregar ítem
        </button>
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
        <p className="text-sm text-blue-700">
          <span className="font-semibold">Nota:</span> Los cambios se aplican en la tienda al guardar. Ítems con el ojo cerrado no aparecen en el menú público.
        </p>
      </div>
    </div>
  )
}
