import React from 'react'

/* ---------- Typage aligné sur la table `graphic_cards` --------------- */
export interface GraphicCardData {
  gpu_chipset:        string
  vram:               number            // GB
  memory_type:        string            // GDDR6…
  core_clock:         number            // MHz
  boost_clock?:       number | null     // MHz
  power_consumption?: number | null     // W
  ports?:             string | null     // ex: “3×DP / 1×HDMI”
}

interface Props {
  data:    GraphicCardData
  setData: <K extends keyof GraphicCardData>(f: K, v: GraphicCardData[K]) => void
  errors?: Partial<Record<keyof GraphicCardData, string>>
}

const GraphicCardFields: React.FC<Props> = ({ data, setData, errors = {} }) => (
  <div className="grid grid-cols-2 gap-4 bg-blue-50 border border-blue-100 p-4 rounded mb-6">

    {/** GPU / Chipset */}
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">GPU / Chipset</label>
      <input
        value={data.gpu_chipset}
        onChange={e => setData('gpu_chipset', e.target.value)}
        className="w-full px-2 py-1 border rounded"
      />
      {errors.gpu_chipset && <p className="text-xs text-red-600">{errors.gpu_chipset}</p>}
    </div>

    {/** VRAM */}
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">VRAM (GB)</label>
      <input
        type="number" min={1}
        value={data.vram}
        onChange={e => setData('vram', Number(e.target.value))}
        className="w-full px-2 py-1 border rounded"
      />
      {errors.vram && <p className="text-xs text-red-600">{errors.vram}</p>}
    </div>

    {/** Type mémoire */}
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">Type mémoire</label>
      <input
        value={data.memory_type}
        onChange={e => setData('memory_type', e.target.value)}
        className="w-full px-2 py-1 border rounded"
      />
      {errors.memory_type && <p className="text-xs text-red-600">{errors.memory_type}</p>}
    </div>

    {/** Core clock */}
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">Core clock (MHz)</label>
      <input
        type="number" min={1}
        value={data.core_clock}
        onChange={e => setData('core_clock', Number(e.target.value))}
        className="w-full px-2 py-1 border rounded"
      />
      {errors.core_clock && <p className="text-xs text-red-600">{errors.core_clock}</p>}
    </div>

    {/** Boost clock */}
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">Boost (MHz)</label>
      <input
        type="number" min={0}
        value={data.boost_clock ?? ''}
        onChange={e =>
          setData('boost_clock', e.target.value === '' ? null : Number(e.target.value))
        }
        className="w-full px-2 py-1 border rounded"
      />
      {errors.boost_clock && <p className="text-xs text-red-600">{errors.boost_clock}</p>}
    </div>

    {/** Conso W */}
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">Conso. (W)</label>
      <input
        type="number" min={0}
        value={data.power_consumption ?? ''}
        onChange={e =>
          setData('power_consumption', e.target.value === '' ? null : Number(e.target.value))
        }
        className="w-full px-2 py-1 border rounded"
      />
      {errors.power_consumption && <p className="text-xs text-red-600">{errors.power_consumption}</p>}
    </div>

    {/** Ports – ligne complète */}
    <div className="col-span-2">
      <label className="block text-sm font-medium text-gray-700 mb-1">Ports vidéo</label>
      <input
        value={data.ports ?? ''}
        onChange={e => setData('ports', e.target.value || null)}
        placeholder="Ex. 3×DP 1.4 / 1×HDMI 2.1"
        className="w-full px-2 py-1 border rounded"
      />
      {errors.ports && <p className="text-xs text-red-600">{errors.ports}</p>}
    </div>

  </div>
)

export default GraphicCardFields
