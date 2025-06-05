import React from 'react'

/** ---------- Typage cohérent avec la table « licenses » ------------- */
export interface LicenseData {
  software_name:     string
  version?:          string | null
  license_type:      string
  validity_period?:  string | null
  activation_method?:string | null
  platform?:         string | null
}

type Setter = <K extends keyof LicenseData>(f: K, v: LicenseData[K]) => void

interface Props {
  data:    LicenseData
  setData: Setter
  errors?: Partial<Record<keyof LicenseData, string>>
}

/** ---------- Listes prédéfinies ---------- */
const licenseTypes = [
  'OEM',
  'Retail',
  'Volume',
  'E-SD',
  'Subscription',
  'Trial',
  'Free',
  'Open Source',
  'Site',
  'Academic',
]

const durations = [
  '6 mois', '1 an', '2 ans', '3 ans', '4 ans',
  '5 ans', '7 ans', '10 ans'
]

/** ---------- Composant principal ---------- */
const LicenseFields: React.FC<Props> = ({ data, setData, errors = {} }) => {
  const textField = (
    label: string,
    key: keyof LicenseData,
    required = false
  ) => (
    <div key={key as string}>
      <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
      <input
        type="text"
        value={(data[key] ?? '') as string}
        onChange={e => setData(key, e.target.value || null)}
        className="w-full px-2 py-1 border rounded"
        maxLength={100}
        required={required}
      />
      {errors[key] && <p className="text-xs text-red-600">{errors[key]}</p>}
    </div>
  )

  return (
    <div className="grid grid-cols-2 gap-4 bg-blue-50 border border-blue-100 p-4 rounded mb-6">

      {/* Nom du logiciel */}
      {textField('Logiciel', 'software_name', true)}

      {/* Version */}
      {textField('Version', 'version')}

      {/* Type de licence */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Type de licence</label>
        <select
          value={data.license_type}
          onChange={e => setData('license_type', e.target.value)}
          className="w-full px-2 py-1 border rounded"
          required
        >
          <option value="">—</option>
          {licenseTypes.map(type => (
            <option key={type} value={type}>{type}</option>
          ))}
        </select>
        {errors.license_type && <p className="text-xs text-red-600">{errors.license_type}</p>}
      </div>

      {/* Validité */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Validité</label>
        <select
          value={data.validity_period ?? ''}
          onChange={e => setData('validity_period', e.target.value || null)}
          className="w-full px-2 py-1 border rounded"
        >
          <option value="">—</option>
          {durations.map(d => (
            <option key={d} value={d}>{d}</option>
          ))}
        </select>
        {errors.validity_period && <p className="text-xs text-red-600">{errors.validity_period}</p>}
      </div>

      {/* Méthode d’activation */}
      {textField('Méthode d’activation', 'activation_method')}

      {/* Plateforme */}
      {textField('Plate-forme', 'platform')}
    </div>
  )
}

export default LicenseFields
