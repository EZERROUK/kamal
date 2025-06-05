import React from 'react'

export interface SoftwareData {
  name: string
  version?: string
  os_support?: string
  type: string
  license_included: boolean
  download_link?: string
  activation_instructions?: string
}

interface Props {
  data: SoftwareData
  setData: (field: keyof SoftwareData, value: any) => void
  errors?: Partial<Record<keyof SoftwareData, string>>
}

const SoftwareFields: React.FC<Props> = ({ data, setData, errors = {} }) => (
  <div className="grid grid-cols-2 gap-4 bg-blue-50 border border-blue-100 p-4 rounded mb-6">
    {[
      ['Nom',                  'name',                   'text'],
      ['Version',              'version',                'text'],
      ['OS supportés',         'os_support',             'text'],
      ['Type',                 'type',                   'text'],
    ].map(([label, key, type]) => (
      <div key={key as string} className="col-span-1">
        <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
        <input
          type={type}
          value={(data as any)[key as string] ?? ''}
          onChange={e => setData(key as keyof SoftwareData, e.target.value)}
          className="w-full px-2 py-1 border rounded text-sm text-gray-700 bg-blue-50"
        />
        {errors[key as keyof SoftwareData] && (
          <div className="text-xs text-red-600">{errors[key as keyof SoftwareData]}</div>
        )}
      </div>
    ))}

    {/* Lien de téléchargement avec préfixe */}
    <div className="col-span-2">
      <label className="block text-sm font-medium text-gray-700 mb-1">Lien de téléchargement</label>
      <div className="flex w-full">
        <span className="inline-flex items-center px-3 rounded-l border border-r-0 border-gray-300 bg-blue-100 text-gray-700 text-sm">
          https://
        </span>
        <input
          type="text"
          value={(data.download_link ?? '').replace(/^https?:\/\//, '')}
          onChange={e => setData('download_link', 'https://' + e.target.value)}
          className="w-full px-2 py-1 border border-gray-300 rounded-r text-sm text-gray-700 bg-blue-50"
        />
      </div>
      {errors.download_link && (
        <div className="text-xs text-red-600 mt-1">{errors.download_link}</div>
      )}
    </div>

    {/* Instructions d'activation */}
    <div className="col-span-2">
      <label className="block text-sm font-medium text-gray-700 mb-1">Instructions d'activation</label>
      <textarea
        value={data.activation_instructions ?? ''}
        onChange={e => setData('activation_instructions', e.target.value)}
        className="w-full px-2 py-1 border rounded text-sm text-gray-700 bg-blue-50"
        rows={4}
      />
      {errors.activation_instructions && (
        <div className="text-xs text-red-600">{errors.activation_instructions}</div>
      )}
    </div>

    {/* Licence incluse */}
    <div className="col-span-2 flex items-center gap-2">
      <input
        type="checkbox"
        checked={data.license_included}
        onChange={e => setData('license_included', e.target.checked)}
      />
      <label className="text-sm">Licence incluse</label>
      {errors.license_included && (
        <div className="text-xs text-red-600">{errors.license_included}</div>
      )}
    </div>
  </div>
)

export default SoftwareFields
