import React from 'react'

export interface CpuData {
  model: string
  socket: string
  cores: number
  threads: number
  base_clock: number
  turbo_clock?: number | null
  lithography?: number | null
  tdp?: number | null
  cache_l1?: number | null
  cache_l2?: number | null
  cache_l3?: number | null
  hyperthreading: boolean
  integrated_graphics: boolean
}

interface Props {
  data: CpuData
  setData: <K extends keyof CpuData>(field: K, value: CpuData[K]) => void
  errors?: Partial<Record<keyof CpuData, string>>
}

const CpuFields: React.FC<Props> = ({ data, setData, errors = {} }) => (
  <div className="grid grid-cols-2 gap-4 bg-blue-50 border border-blue-100 p-4 rounded mb-6">

    {/* ---------- Champs requis ------------------------------------- */}
    <Input
      label="Modèle"
      value={data.model}
      onChange={v => setData('model', v)}
      error={errors.model}
    />
    <Input
      label="Socket"
      value={data.socket}
      onChange={v => setData('socket', v)}
      error={errors.socket}
    />

    {/* ---------- Entiers positifs ---------------------------------- */}
    {(['cores', 'threads'] as const).map(key => (
      <Input
        key={key}
        type="number"
        min={1}
        label={key === 'cores' ? 'Cœurs' : 'Threads'}
        value={data[key]}
        onChange={v => setData(key, Number(v))}
        error={errors[key]}
      />
    ))}

    {/* ---------- Fréquences --------------------------------------- */}
    {(['base_clock', 'turbo_clock'] as const).map(key => (
      <Input
        key={key}
        type="number"
        step={0.01}
        min={0}
        label={key === 'base_clock' ? 'Fréquence base (GHz)' : 'Boost (GHz)'}
        value={data[key] ?? ''}
        onChange={v => setData(key, v === '' ? null : Number(v))}
        error={errors[key]}
      />
    ))}

    {/* ---------- Lithographie / TDP ------------------------------- */}
    {(['lithography', 'tdp'] as const).map(key => (
      <Input
        key={key}
        type="number"
        min={0}
        label={key === 'lithography' ? 'Lithographie (nm)' : 'TDP (W)'}
        value={data[key] ?? ''}
        onChange={v => setData(key, v === '' ? null : Number(v))}
        error={errors[key]}
      />
    ))}

    {/* ---------- Caches ------------------------------------------- */}
    {(['cache_l1', 'cache_l2', 'cache_l3'] as const).map(key => (
      <Input
        key={key}
        type="number"
        min={0}
        label={{ cache_l1: 'Cache L1 (KB)', cache_l2: 'Cache L2 (KB)', cache_l3: 'Cache L3 (MB)' }[key]}
        value={data[key] ?? ''}
        onChange={v => setData(key, v === '' ? null : Number(v))}
        error={errors[key]}
      />
    ))}

    {/* ---------- Booléens (checkbox) ------------------------------ */}
    <Checkbox
      label="Processeur avec iGPU intégré"
      checked={data.integrated_graphics}
      onChange={v => setData('integrated_graphics', v)}
      error={errors.integrated_graphics}
    />
    <Checkbox
      label="Hyper-Threading activé"
      checked={data.hyperthreading}
      onChange={v => setData('hyperthreading', v)}
      error={errors.hyperthreading}
    />
  </div>
)

/* ---------- Input réutilisable ---------------------------------- */
interface InputProps {
  label: string
  value: string | number
  onChange: (value: string) => void
  error?: string
  type?: 'text' | 'number'
  min?: number
  step?: number
}

const Input: React.FC<InputProps> = ({
  label, value, onChange, error, type = 'text', ...rest
}) => {
  const isRequired = ['Modèle', 'Socket'].includes(label)

  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">
        {label}
        {isRequired && <span className="text-red-500 ml-1">*</span>}
      </label>
      <input
        type={type}
        value={value}
        onChange={e => onChange(e.target.value)}
        className="w-full px-2 py-1 border rounded"
        {...rest}
      />
      {error && <p className="text-xs text-red-600">{error}</p>}
    </div>
  )
}

/* ---------- Checkbox réutilisable ------------------------------- */
interface CheckboxProps {
  label: string
  checked: boolean
  onChange: (value: boolean) => void
  error?: string
}

const Checkbox: React.FC<CheckboxProps> = ({ label, checked, onChange, error }) => (
  <div className="col-span-2 flex items-center space-x-2">
    <input
      id={label}
      type="checkbox"
      checked={checked}
      onChange={e => onChange(e.target.checked)}
      className="h-4 w-4 text-blue-600 border-gray-300 rounded"
    />
    <label htmlFor={label} className="text-sm text-gray-700">{label}</label>
    {error && <p className="text-xs text-red-600">{error}</p>}
  </div>
)

export default CpuFields
