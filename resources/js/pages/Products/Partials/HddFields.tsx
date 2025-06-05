import React from 'react'

/** Typage aligné sur la table hard_drives */
export interface HddData {
  type:            string   // HDD / SSD / NVMe
  interface:       string   // SATA, PCIe…
  capacity:        number   // GB
  form_factor:     string   // 2.5", 3.5"
  rpm?:            number | null
  read_speed?:     number | null
  write_speed?:    number | null
  /* nouveaux champs facultatifs */
  nand_type?:      string | null
  mtbf?:           number | null   // heures
  warranty?:       number | null   // mois
}

type Setter = <K extends keyof HddData>(f: K, v: HddData[K]) => void
interface Props {
  data:    HddData
  setData: Setter
  errors?: Partial<Record<keyof HddData, string>>
}

const HddFields: React.FC<Props> = ({ data, setData, errors = {} }) => {
  /* helper pour factoriser le rendu */
  const field = (
    label: string,
    key:   keyof HddData,
    type:  'text' | 'number',
    step?: number,
  ) => (
    <div key={key as string}>
      <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
      <input
        type={type}
        step={step}
        min={type === 'number' ? 0 : undefined}
        value={(data[key] ?? '') as any}
        onChange={e =>
          setData(
            key,
            type === 'number'
              ? (e.target.value === '' ? null : Number(e.target.value))
              : (e.target.value || null),
          )
        }
        className="w-full px-2 py-1 border rounded"
      />
      {errors[key] && <p className="text-xs text-red-600">{errors[key]}</p>}
    </div>
  )

  return (
    <div className="grid grid-cols-2 gap-4 bg-blue-50 border border-blue-100 p-4 rounded mb-6">
      {field('Type',            'type',         'text')}
      {field('Interface',       'interface',    'text')}
      {field('Capacité (GB)',   'capacity',     'number', 1)}
      {field('Form-factor',     'form_factor',  'text')}
      {field('RPM',             'rpm',          'number', 1)}
      {field('Lecture (MB/s)',  'read_speed',   'number', 1)}
      {field('Écriture (MB/s)', 'write_speed',  'number', 1)}
      {/* nouveaux champs  */}
      {field('Type NAND',       'nand_type',    'text')}
      {field('MTBF (h)',        'mtbf',         'number', 1)}
      {field('Garantie (mois)', 'warranty',     'number', 1)}
    </div>
  )
}

export default HddFields
