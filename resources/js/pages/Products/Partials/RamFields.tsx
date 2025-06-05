/* ------------------------------------------------------------------
   RamFields.tsx  –  Formulaire limité selon la migration `rams`
   ------------------------------------------------------------------
   - type, form_factor : VARCHAR(10)  → maxLength={10}
   - capacity, speed   : UNSIGNED SMALLINT (0-65535)
   - voltage           : DECIMAL(3,2)  (0.00-9.99)  → step 0.01, max 9.99
   - module_count      : TINYINT (0-255)
------------------------------------------------------------------- */

import React from 'react'

export interface RamData {
  type: string
  form_factor: string
  capacity: number
  speed: number
  voltage: string
  ecc: boolean
  buffered: boolean
  rank?: string
  module_count: number
}

interface Props {
  data: RamData
  setData: <K extends keyof RamData>(field: K, value: RamData[K]) => void
  errors?: Partial<Record<keyof RamData, string>>
}

export const RamFields: React.FC<Props> = ({ data, setData, errors = {} }) => (
  <div className="grid grid-cols-2 gap-4 bg-blue-50 border border-blue-100 p-4 rounded mb-6">
    {/* Type (10 car. max) ------------------------------------------------ */}
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
      <input
        type="text"
        maxLength={10}
        placeholder="DDR4"
        value={data.type}
        onChange={e => setData('type', e.target.value)}
        className="w-full px-2 py-1 border rounded"
      />
      {errors.type && <p className="text-xs text-red-600">{errors.type}</p>}
    </div>

    {/* Form-factor (DIMM, SO-DIMM…) ------------------------------------- */}
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">Form-factor</label>
      <input
        type="text"
        maxLength={10}
        placeholder="DIMM"
        value={data.form_factor}
        onChange={e => setData('form_factor', e.target.value)}
        className="w-full px-2 py-1 border rounded"
      />
      {errors.form_factor && <p className="text-xs text-red-600">{errors.form_factor}</p>}
    </div>

    {/* Capacity --------------------------------------------------------- */}
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">Capacité (GB)</label>
      <input
        type="number"
        min={1}
        max={65535}
        value={data.capacity}
        onChange={e => setData('capacity', Number(e.target.value))}
        className="w-full px-2 py-1 border rounded"
      />
      {errors.capacity && <p className="text-xs text-red-600">{errors.capacity}</p>}
    </div>

    {/* Speed ------------------------------------------------------------ */}
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">Fréquence (MHz)</label>
      <input
        type="number"
        min={1}
        max={65535}
        value={data.speed}
        onChange={e => setData('speed', Number(e.target.value))}
        className="w-full px-2 py-1 border rounded"
      />
      {errors.speed && <p className="text-xs text-red-600">{errors.speed}</p>}
    </div>

    {/* Voltage ---------------------------------------------------------- */}
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">Tension (V)</label>
      <input
        type="number"
        step={0.01}
        min={0}
        max={9.99}
        placeholder="1.20"
        value={data.voltage}
        onChange={e => setData('voltage', e.target.value)}
        className="w-full px-2 py-1 border rounded"
      />
      {errors.voltage && <p className="text-xs text-red-600">{errors.voltage}</p>}
    </div>

    {/* ECC -------------------------------------------------------------- */}
    <div className="flex items-center">
      <input
        id="ram-ecc"
        type="checkbox"
        checked={data.ecc}
        onChange={e => setData('ecc', e.target.checked)}
        className="h-4 w-4 text-indigo-600 border-gray-300 rounded"
      />
      <label htmlFor="ram-ecc" className="ml-2 text-sm text-gray-700">ECC</label>
    </div>

    {/* Buffered --------------------------------------------------------- */}
    <div className="flex items-center">
      <input
        id="ram-buffered"
        type="checkbox"
        checked={data.buffered}
        onChange={e => setData('buffered', e.target.checked)}
        className="h-4 w-4 text-indigo-600 border-gray-300 rounded"
      />
      <label htmlFor="ram-buffered" className="ml-2 text-sm text-gray-700">Buffered</label>
    </div>

    {/* Rank ------------------------------------------------------------- */}
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">Rank</label>
      <input
        type="text"
        maxLength={20}
        value={data.rank ?? ''}
        onChange={e => setData('rank', e.target.value)}
        className="w-full px-2 py-1 border rounded"
      />
      {errors.rank && <p className="text-xs text-red-600">{errors.rank}</p>}
    </div>

    {/* Module count ----------------------------------------------------- */}
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">Nb modules</label>
      <input
        type="number"
        min={1}
        max={255}
        value={data.module_count}
        onChange={e => setData('module_count', Number(e.target.value))}
        className="w-full px-2 py-1 border rounded"
      />
      {errors.module_count && <p className="text-xs text-red-600">{errors.module_count}</p>}
    </div>
  </div>
)
