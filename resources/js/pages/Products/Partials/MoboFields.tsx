import React from 'react'

/* -------- typage aligné sur la table « motherboards » ---------------- */
export interface MoboData {
  socket:            string
  chipset:           string
  form_factor:       string            // ATX, m-ITX…
  ram_slots:         number
  max_ram:           number            // GB
  supported_ram_type:string
  sata_ports:        number
  nvme_slots:        number
  pcie_slots:        number
  usb_ports:         number
  lan_ports:         number
  supports_raid:     boolean
}

type Setter = <K extends keyof MoboData>(f: K, v: MoboData[K]) => void
interface Props {
  data:    MoboData
  setData: Setter
  errors?: Partial<Record<keyof MoboData, string>>
}

/* --------------------------------------------------------------------- */
const fieldList: Array<[string, keyof MoboData, 'text' | 'number' | 'checkbox', number?]> = [
  ['Socket',              'socket',              'text'   ],
  ['Chipset',             'chipset',             'text'   ],
  ['Format (ATX…)',       'form_factor',         'text'   ],
  ['Slots RAM',           'ram_slots',           'number', 1],
  ['RAM max (GB)',        'max_ram',             'number', 1],
  ['Type RAM pris en charge','supported_ram_type','text'   ],
  ['Ports SATA',          'sata_ports',          'number', 1],
  ['Slots NVMe',          'nvme_slots',          'number', 1],
  ['Slots PCIe',          'pcie_slots',          'number', 1],
  ['Ports USB',           'usb_ports',           'number', 1],
  ['Ports LAN',           'lan_ports',           'number', 1],
];

/* --------------------------------------------------------------------- */
const MoboFields: React.FC<Props> = ({ data, setData, errors = {} }) => (
  <div className="grid grid-cols-2 gap-4 bg-blue-50 border border-blue-100 p-4 rounded mb-6">

    {fieldList.map(([label, key, type, step]) => (
      <div key={key as string}>
        <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
        <input
          type={type}
          step={step}
          min={type === 'number' ? 0 : undefined}
          value={(data as any)[key] ?? ''}
          onChange={e =>
            setData(
              key,
              type === 'number' ? Number(e.target.value) : (e.target.type === 'checkbox' ? e.target.checked : e.target.value)
            )
          }
          className="w-full px-2 py-1 border rounded"
        />
        {errors[key] && <p className="text-xs text-red-600">{errors[key]}</p>}
      </div>
    ))}

    {/* case à cocher RAID */}
    <div className="col-span-2 flex items-center mt-1">
      <input
        id="supports_raid"
        type="checkbox"
        checked={data.supports_raid}
        onChange={e => setData('supports_raid', e.target.checked)}
        className="h-4 w-4 text-indigo-600 border-gray-300 rounded"
      />
      <label htmlFor="supports_raid" className="ml-2 text-sm text-gray-700">
        Supporte le RAID
      </label>
      {errors.supports_raid && <p className="text-xs text-red-600 ml-3">{errors.supports_raid}</p>}
    </div>
  </div>
)

export default MoboFields
