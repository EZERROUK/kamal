import React from 'react'

export interface PsuData {
  power: number
  efficiency_rating: string
  modular: boolean        // ← booléen
  form_factor: string
  connector_types?: string
  protection_features?: string
}

interface Props {
  data: PsuData
  setData: <K extends keyof PsuData>(f: K, v: PsuData[K]) => void
  errors?: Partial<Record<keyof PsuData, string>>
}

const PsuFields: React.FC<Props> = ({ data, setData, errors = {} }) => (
  <div className="grid grid-cols-2 gap-4 bg-blue-50 border border-blue-100 p-4 rounded mb-6">
    {/* Puissance */}
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">Puissance (W)</label>
      <input
        type="number" min={1}
        value={data.power}
        onChange={e => setData('power', Number(e.target.value))}
        className="w-full px-2 py-1 border rounded"
      />
      {errors.power && <p className="text-xs text-red-600">{errors.power}</p>}
    </div>

    {/* Rendement 80+ */}
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">Rendement 80+</label>
      <input
        value={data.efficiency_rating}
        onChange={e => setData('efficiency_rating', e.target.value)}
        className="w-full px-2 py-1 border rounded"
      />
      {errors.efficiency_rating &&
        <p className="text-xs text-red-600">{errors.efficiency_rating}</p>}
    </div>

    {/* Format */}
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">Form-factor</label>
      <input
        value={data.form_factor}
        onChange={e => setData('form_factor', e.target.value)}
        className="w-full px-2 py-1 border rounded"
      />
      {errors.form_factor && <p className="text-xs text-red-600">{errors.form_factor}</p>}
    </div>

    {/* Modulaire */}
    <div className="flex items-center">
      <input
        id="psu_modular"
        type="checkbox"
        checked={data.modular}
        onChange={e => setData('modular', e.target.checked)}
        className="h-4 w-4 text-indigo-600 border-gray-300 rounded"
      />
      <label htmlFor="psu_modular" className="ml-2 text-sm text-gray-700">
        Câbles modulaires
      </label>
      {errors.modular && <p className="text-xs text-red-600 ml-2">{errors.modular}</p>}
    </div>

    {/* Connecteurs & protections (ligne entière) */}
    <div className="col-span-2">
      <label className="block text-sm font-medium text-gray-700 mb-1">
        Types de connecteurs
      </label>
      <input
        value={data.connector_types ?? ''}
        onChange={e => setData('connector_types', e.target.value || undefined)}
        placeholder="Ex. 2×CPU 8 pin · 3×PCI-E 8 pin"
        className="w-full px-2 py-1 border rounded"
      />
      {errors.connector_types &&
        <p className="text-xs text-red-600">{errors.connector_types}</p>}
    </div>

    <div className="col-span-2">
      <label className="block text-sm font-medium text-gray-700 mb-1">
        Protections (OVP, OCP…)
      </label>
      <input
        value={data.protection_features ?? ''}
        onChange={e => setData('protection_features', e.target.value || undefined)}
        className="w-full px-2 py-1 border rounded"
      />
      {errors.protection_features &&
        <p className="text-xs text-red-600">{errors.protection_features}</p>}
    </div>
  </div>
)

export default PsuFields
