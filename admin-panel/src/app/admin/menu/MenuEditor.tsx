'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Trash2, Plus, Eye, EyeOff } from 'lucide-react'

interface MenuItem { id: number; label: string; url: string; order: number; visible: boolean; children: MenuItem[] }

export default function MenuEditor({ items }: { items: MenuItem[] }) {
  const [newLabel, setNewLabel] = useState('')
  const [newUrl, setNewUrl] = useState('')
  const router = useRouter()

  const addItem = async () => {
    if (!newLabel || !newUrl) return
    await fetch('/api/menu', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ label: newLabel, url: newUrl, order: items.length }),
    })
    setNewLabel(''); setNewUrl('')
    router.refresh()
  }

  const toggleVisible = async (id: number, visible: boolean) => {
    await fetch(`/api/menu/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ visible: !visible }),
    })
    router.refresh()
  }

  const deleteItem = async (id: number) => {
    await fetch(`/api/menu/${id}`, { method: 'DELETE' })
    router.refresh()
  }

  return (
    <div className="space-y-4">
      <div className="bg-white rounded-xl shadow-sm p-6">
        <h2 className="font-semibold text-gray-700 mb-4">Ítems del menú</h2>
        <div className="space-y-2">
          {items.map(item => (
            <div key={item.id} className="flex items-center gap-3 p-3 border border-gray-100 rounded-lg">
              <div className="flex-1">
                <p className="text-sm font-medium">{item.label}</p>
                <p className="text-xs text-gray-400">{item.url}</p>
              </div>
              <button onClick={() => toggleVisible(item.id, item.visible)}
                className={`p-1.5 rounded ${item.visible ? 'text-brand-600' : 'text-gray-300'}`}>
                {item.visible ? <Eye size={16} /> : <EyeOff size={16} />}
              </button>
              <button onClick={() => deleteItem(item.id)} className="p-1.5 rounded text-gray-300 hover:text-red-500">
                <Trash2 size={16} />
              </button>
            </div>
          ))}
          {items.length === 0 && <p className="text-sm text-gray-400 text-center py-4">Sin ítems en el menú</p>}
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm p-6">
        <h2 className="font-semibold text-gray-700 mb-4">Agregar ítem</h2>
        <div className="grid grid-cols-2 gap-3 mb-3">
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Etiqueta</label>
            <input value={newLabel} onChange={e => setNewLabel(e.target.value)} placeholder="Ej: Semillas"
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-600" />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">URL</label>
            <input value={newUrl} onChange={e => setNewUrl(e.target.value)} placeholder="Ej: /productos?categoria=semillas"
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-600" />
          </div>
        </div>
        <button onClick={addItem}
          className="flex items-center gap-2 bg-brand-600 hover:bg-brand-700 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors">
          <Plus size={15} /> Agregar
        </button>
      </div>
    </div>
  )
}
