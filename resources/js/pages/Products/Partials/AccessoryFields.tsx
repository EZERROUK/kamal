import React from 'react'

export interface AccessoryData {
  type: string
  compatibility?: string
  material?: string
  dimensions?: string
}

interface Props {
  data: AccessoryData
  setData: (field: keyof AccessoryData, value: any) => void
  errors?: Partial<Record<keyof AccessoryData, string>>
}

const groupedTypes = [
  { label: 'Transport & protection', options: ['Sacoche', 'Housse', 'Étui', 'Pochette', 'Mallette', 'Coque rigide'] },
  { label: 'Alimentation', options: ['Chargeur', 'Adaptateur secteur', 'Batterie externe', 'Power bank', 'Station de charge'] },
  { label: 'Connectique', options: ['Câble USB', 'Câble HDMI', 'Câble Ethernet', 'Câble VGA', 'Câble DisplayPort', 'Convertisseur / Adaptateur', 'Répartiteur USB'] },
  { label: 'Périphériques', options: ['Souris', 'Clavier', 'Tapis de souris', 'Webcam', 'Manette', 'Lecteur de carte'] },
  { label: 'Support & ergonomie', options: ['Support PC', 'Support écran', 'Support tablette', 'Rehausseur', 'Bras articulé', 'Station d’accueil', 'Hub USB', 'Ventilateur / Refroidisseur'] },
  { label: 'Audio & vidéo', options: ['Casque audio', 'Microphone', 'Haut-parleur', 'Enceinte Bluetooth'] },
  { label: 'Entretien', options: ['Kit de nettoyage', 'Bombe à air', 'Chiffon microfibre'] },
  { label: 'Sécurité', options: ['Verrou Kensington', 'Filtre de confidentialité'] },
  { label: 'Autres', options: ['Étiquette câble', 'Accessoire imprimante', 'Accessoire réseau', 'Accessoire stockage', 'Antenne Wi-Fi'] },
]

const materials = [
  'Plastique', 'Métal', 'Aluminium', 'Cuir', 'Tissu', 'Caoutchouc', 'Silicone', 'Verre trempé'
]

const AccessoryFields: React.FC<Props> = ({ data, setData, errors = {} }) => (
  <div className="grid grid-cols-2 gap-4 bg-blue-50 border border-blue-100 p-4 rounded mb-6">

    {/* Type */}
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
      <select
        value={data.type}
        onChange={e => setData('type', e.target.value)}
        className="w-full px-2 py-1 border rounded text-sm font-medium text-gray-900"
        required
      >
        <option value="" className="text-gray-500 text-sm font-medium">
          Sélectionnez un type...
        </option>
        {groupedTypes.map(group => (
      <optgroup key={group.label} label={group.label}>
        {group.options.map(opt => (
          <option key={opt} value={opt}>{opt}</option>
        ))}
      </optgroup>
    ))}

      </select>
      {errors.type && <div className="text-xs text-red-600">{errors.type}</div>}
    </div>

    {/* Compatibilité */}
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">Compatibilité</label>
      <input
        type="text"
        value={data.compatibility ?? ''}
        onChange={e => setData('compatibility', e.target.value)}
        className="w-full px-2 py-1 border rounded text-sm font-medium text-gray-900"
        maxLength={100}
      />
      {errors.compatibility && <div className="text-xs text-red-600">{errors.compatibility}</div>}
    </div>

    {/* Matériau */}
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">Matériau</label>
      <select
        value={data.material ?? ''}
        onChange={e => setData('material', e.target.value || null)}
        className="w-full px-2 py-1 border rounded text-sm font-medium text-gray-900"
      >
        <option value="" className="text-gray-500 text-sm font-medium">
          Sélectionnez un matériau...
        </option>
        {materials.map((m) => (
          <option key={m} value={m}>{m}</option>
        ))}
      </select>
      {errors.material && <div className="text-xs text-red-600">{errors.material}</div>}
    </div>

    {/* Dimensions */}
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">Dimensions</label>
      <input
        type="text"
        value={data.dimensions ?? ''}
        onChange={e => setData('dimensions', e.target.value)}
        className="w-full px-2 py-1 border rounded text-sm font-medium text-gray-900"
        maxLength={30}
      />
      {errors.dimensions && <div className="text-xs text-red-600">{errors.dimensions}</div>}
    </div>
  </div>
)

export default AccessoryFields
