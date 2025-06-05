import React from 'react'

/* ---------- Typage aligné sur la table network_cards -------------- */
export interface NicData {
  interface:       string   // PCIe…
  speed:           number   // Gbps
  ports:           number
  connector_type:  string   // RJ-45, SFP+
  chipset?:        string   // facultatif
}

interface Props {
  data:    NicData
  setData: <K extends keyof NicData>(f: K, v: NicData[K]) => void
  errors?: Partial<Record<keyof NicData,string>>
}

const NicFields: React.FC<Props> = ({ data, setData, errors = {} }) => (
  <div className="grid grid-cols-2 gap-4 bg-blue-50 border border-blue-100 p-4 rounded mb-6">
    {[
      ['Interface',      'interface',      'text'  ],
      ['Débit (Gbps)',   'speed',          'number', 1],
      ['Nbr ports',      'ports',          'number', 1],
      ['Connecteur',     'connector_type', 'text'  ],
      ['Chipset',        'chipset',        'text'  ],   // ← NOUVEAU
    ].map(([label, key, type, step]) => (
      <div key={key as string}>
        <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
        <input
          type={type as string}
          step={step as number | undefined}
          min={type === 'number' ? 0 : undefined}
          value={(data as any)[key as string] ?? ''}
          onChange={e => setData(
            key as keyof NicData,
            type === 'number' ? Number(e.target.value) : e.target.value,
          )}
          className="w-full px-2 py-1 border rounded"
        />
        {errors[key as keyof NicData] &&
          <p className="text-xs text-red-600">{errors[key as keyof NicData]}</p>}
      </div>
    ))}
  </div>
)

export default NicFields
