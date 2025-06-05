import React from 'react'

export interface DesktopData {
  cpu: string
  ram: number
  graphic_card: string
  keyboard: string
  condition: 'new' | 'used' | 'refurbished'
  storage: number
  storage_type: 'SSD' | 'HDD'
  form_factor?: string
  internal_drives_count: number
}

export default function DesktopFields({
  data, setData, errors = {}
}: {
  data: DesktopData
  setData: <K extends keyof DesktopData>(field: K, value: DesktopData[K]) => void
  errors?: Partial<Record<keyof DesktopData, string>>
}) {
  return (
    <div className="grid grid-cols-2 gap-4 bg-blue-50 border border-blue-100 p-4 rounded mb-6">
      {/* CPU (obligatoire) */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">CPU</label>
        <input
          type="text"
          value={data.cpu}
          onChange={e => setData('cpu', e.target.value)}
          className="w-full px-2 py-1 border rounded"
          required
          maxLength={100}
          placeholder="Intel Core i5, Ryzen 7..."
        />
        {errors.cpu && <div className="text-xs text-red-600">{errors.cpu}</div>}
      </div>

      {/* RAM (obligatoire) */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">RAM (Go)</label>
        <input
          type="number"
          value={data.ram}
          onChange={e => setData('ram', Number(e.target.value))}
          className="w-full px-2 py-1 border rounded"
          min={1}
          max={1024}
          step={1}
          required
          placeholder="Ex : 16"
        />
        {errors.ram && <div className="text-xs text-red-600">{errors.ram}</div>}
      </div>

      {/* Carte graphique */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Carte graphique</label>
        <input
          type="text"
          value={data.graphic_card}
          onChange={e => setData('graphic_card', e.target.value)}
          className="w-full px-2 py-1 border rounded"
          maxLength={100}
          placeholder="NVIDIA GTX 1660, Radeon RX..."
        />
        {errors.graphic_card && <div className="text-xs text-red-600">{errors.graphic_card}</div>}
      </div>

      {/* Clavier */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Clavier</label>
        <input
          type="text"
          value={data.keyboard}
          onChange={e => setData('keyboard', e.target.value)}
          className="w-full px-2 py-1 border rounded"
          maxLength={100}
          placeholder="AZERTY, QWERTY, sans clavier..."
        />
        {errors.keyboard && <div className="text-xs text-red-600">{errors.keyboard}</div>}
      </div>

      {/* Stockage (obligatoire) */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Stockage (Go)</label>
        <input
          type="number"
          value={data.storage}
          onChange={e => setData('storage', Number(e.target.value))}
          className="w-full px-2 py-1 border rounded"
          min={64}
          max={8192}
          step={64}
          required
          placeholder="Ex : 512"
        />
        {errors.storage && <div className="text-xs text-red-600">{errors.storage}</div>}
      </div>

      {/* Type de stockage */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Type de stockage</label>
        <select
          value={data.storage_type}
          onChange={e => setData('storage_type', e.target.value as 'SSD' | 'HDD')}
          className="w-full px-2 py-1 border rounded"
        >
          <option value="SSD">SSD</option>
          <option value="HDD">HDD</option>
        </select>
        {errors.storage_type && <div className="text-xs text-red-600">{errors.storage_type}</div>}
      </div>

      {/* Form factor */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Facteur de forme</label>
        <input
          type="text"
          value={data.form_factor ?? ''}
          onChange={e => setData('form_factor', e.target.value)}
          className="w-full px-2 py-1 border rounded"
          maxLength={50}
          placeholder="Ex : Tower, Mini-ITX"
        />
        {errors.form_factor && <div className="text-xs text-red-600">{errors.form_factor}</div>}
      </div>

      {/* Nombre de disques */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Disques internes</label>
        <input
          type="number"
          value={data.internal_drives_count}
          onChange={e => setData('internal_drives_count', Number(e.target.value))}
          className="w-full px-2 py-1 border rounded"
          min={1}
          max={10}
          step={1}
          placeholder="Ex : 2"
        />
        {errors.internal_drives_count && <div className="text-xs text-red-600">{errors.internal_drives_count}</div>}
      </div>

      {/* État (obligatoire) */}
      <div className="col-span-2">
        <label className="block text-sm font-medium text-gray-700 mb-1">État</label>
        <select
          value={data.condition}
          onChange={e => setData('condition', e.target.value as 'new' | 'used' | 'refurbished')}
          className="w-full px-2 py-1 border rounded"
          required
        >
          <option value="new">Neuf</option>
          <option value="used">Occasion</option>
          <option value="refurbished">Reconditionné</option>
        </select>
        {errors.condition && <div className="text-xs text-red-600">{errors.condition}</div>}
      </div>
    </div>
  )
}
