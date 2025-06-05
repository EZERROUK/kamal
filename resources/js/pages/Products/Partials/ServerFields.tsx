// --- ServerFields.tsx ---
import React from 'react'

export interface ServerData {
  cpu_sockets: number
  cpu_model?: string
  installed_memory: number
  max_memory: number
  memory_type?: 'DDR3' | 'DDR4' | 'DDR5'

  drive_bays: number
  storage_type: 'HDD' | 'SSD' | 'Hybrid'
  storage_capacity: number
  raid_support: 'None' | 'RAID 0' | 'RAID 1' | 'RAID 5' | 'RAID 10'

  ethernet_ports: number
  ethernet_speed: '1Gbps' | '10Gbps' | '25Gbps' | '40Gbps' | '100Gbps'
  fiber_channel: boolean

  rack_units: number
  form_factor?: 'Rack' | 'Tower' | 'Blade'
  redundant_power_supplies: boolean
  condition: 'new' | 'used' | 'refurbished'
}

export default function ServerFields({
  data, setData, errors = {}
}: {
  data: ServerData
  setData: <K extends keyof ServerData>(field: K, value: ServerData[K]) => void
  errors?: Partial<Record<keyof ServerData, string>>
}) {
  return (
    <div className="grid grid-cols-2 gap-4 bg-blue-50 border border-blue-100 p-4 rounded mb-6">
      {/* CPU sockets */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">CPU sockets</label>
        <input type="number" min={1} max={8} value={data.cpu_sockets}
               onChange={e => setData('cpu_sockets', Number(e.target.value))}
               className="w-full px-2 py-1 border rounded text-sm text-gray-700" required />
        {errors.cpu_sockets && <div className="text-xs text-red-600">{errors.cpu_sockets}</div>}
      </div>

      {/* CPU model */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">CPU model</label>
        <input type="text" value={data.cpu_model ?? ''}
               onChange={e => setData('cpu_model', e.target.value)}
               className="w-full px-2 py-1 border rounded text-sm text-gray-700" maxLength={100} />
        {errors.cpu_model && <div className="text-xs text-red-600">{errors.cpu_model}</div>}
      </div>

      {/* Installed memory */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Installed memory (GB)</label>
        <input type="number" min={0} max={4096} value={data.installed_memory}
               onChange={e => setData('installed_memory', Number(e.target.value))}
               className="w-full px-2 py-1 border rounded text-sm text-gray-700" />
        {errors.installed_memory && <div className="text-xs text-red-600">{errors.installed_memory}</div>}
      </div>

      {/* Max memory */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Max memory (GB)</label>
        <input type="number" min={1} max={4096} value={data.max_memory}
               onChange={e => setData('max_memory', Number(e.target.value))}
               className="w-full px-2 py-1 border rounded text-sm text-gray-700" required />
        {errors.max_memory && <div className="text-xs text-red-600">{errors.max_memory}</div>}
      </div>

      {/* Memory type */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Memory type</label>
        <select value={data.memory_type ?? ''}
                onChange={e => setData('memory_type', e.target.value as ServerData['memory_type'])}
                className="w-full px-2 py-1 border rounded text-sm text-gray-700 bg-blue-50">
          <option value="">--</option>
          <option value="DDR3">DDR3</option>
          <option value="DDR4">DDR4</option>
          <option value="DDR5">DDR5</option>
        </select>
        {errors.memory_type && <div className="text-xs text-red-600">{errors.memory_type}</div>}
      </div>

      {/* Drive bays */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Drive bays</label>
        <input type="number" min={0} max={24} value={data.drive_bays}
               onChange={e => setData('drive_bays', Number(e.target.value))}
               className="w-full px-2 py-1 border rounded text-sm text-gray-700" />
        {errors.drive_bays && <div className="text-xs text-red-600">{errors.drive_bays}</div>}
      </div>

      {/* Storage type */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Storage type</label>
        <select value={data.storage_type}
                onChange={e => setData('storage_type', e.target.value as ServerData['storage_type'])}
                className="w-full px-2 py-1 border rounded text-sm text-gray-700 bg-blue-50" required>
          <option value="HDD">HDD</option>
          <option value="SSD">SSD</option>
          <option value="Hybrid">Hybrid</option>
        </select>
        {errors.storage_type && <div className="text-xs text-red-600">{errors.storage_type}</div>}
      </div>

      {/* Storage capacity */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Storage capacity (GB)</label>
        <input type="number" min={0} max={16384} value={data.storage_capacity}
               onChange={e => setData('storage_capacity', Number(e.target.value))}
               className="w-full px-2 py-1 border rounded text-sm text-gray-700" />
        {errors.storage_capacity && <div className="text-xs text-red-600">{errors.storage_capacity}</div>}
      </div>

      {/* RAID support */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">RAID support</label>
        <select value={data.raid_support}
                onChange={e => setData('raid_support', e.target.value as ServerData['raid_support'])}
                className="w-full px-2 py-1 border rounded text-sm text-gray-700 bg-blue-50">
          <option value="None">None</option>
          <option value="RAID 0">RAID 0</option>
          <option value="RAID 1">RAID 1</option>
          <option value="RAID 5">RAID 5</option>
          <option value="RAID 10">RAID 10</option>
        </select>
        {errors.raid_support && <div className="text-xs text-red-600">{errors.raid_support}</div>}
      </div>

      {/* Ethernet ports */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Ethernet ports</label>
        <input type="number" min={1} max={8} value={data.ethernet_ports}
               onChange={e => setData('ethernet_ports', Number(e.target.value))}
               className="w-full px-2 py-1 border rounded text-sm text-gray-700" />
        {errors.ethernet_ports && <div className="text-xs text-red-600">{errors.ethernet_ports}</div>}
      </div>

      {/* Ethernet speed */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Ethernet speed</label>
        <select value={data.ethernet_speed}
                onChange={e => setData('ethernet_speed', e.target.value as ServerData['ethernet_speed'])}
                className="w-full px-2 py-1 border rounded text-sm text-gray-700 bg-blue-50">
          <option value="1Gbps">1Gbps</option>
          <option value="10Gbps">10Gbps</option>
          <option value="25Gbps">25Gbps</option>
          <option value="40Gbps">40Gbps</option>
          <option value="100Gbps">100Gbps</option>
        </select>
        {errors.ethernet_speed && <div className="text-xs text-red-600">{errors.ethernet_speed}</div>}
      </div>

      {/* Fiber Channel */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Fiber Channel</label>
        <input type="checkbox" checked={data.fiber_channel}
               onChange={e => setData('fiber_channel', e.target.checked)}
               className="mr-2" />
        <span className="text-sm text-gray-700">Présent</span>
        {errors.fiber_channel && <div className="text-xs text-red-600">{errors.fiber_channel}</div>}
      </div>

      {/* Rack units */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Rack units (U)</label>
        <input type="number" min={1} max={10} value={data.rack_units}
               onChange={e => setData('rack_units', Number(e.target.value))}
               className="w-full px-2 py-1 border rounded text-sm text-gray-700" required />
        {errors.rack_units && <div className="text-xs text-red-600">{errors.rack_units}</div>}
      </div>

      {/* Form factor */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Form factor</label>
        <select value={data.form_factor ?? ''}
                onChange={e => setData('form_factor', e.target.value as ServerData['form_factor'])}
                className="w-full px-2 py-1 border rounded text-sm text-gray-700 bg-blue-50">
          <option value="">--</option>
          <option value="Rack">Rack</option>
          <option value="Tower">Tower</option>
          <option value="Blade">Blade</option>
        </select>
        {errors.form_factor && <div className="text-xs text-red-600">{errors.form_factor}</div>}
      </div>

      {/* Redundant PSU */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Redundant power supplies</label>
        <input type="checkbox" checked={data.redundant_power_supplies}
               onChange={e => setData('redundant_power_supplies', e.target.checked)}
               className="mr-2" />
        <span className="text-sm text-gray-700">Présentes</span>
        {errors.redundant_power_supplies && <div className="text-xs text-red-600">{errors.redundant_power_supplies}</div>}
      </div>

      {/* Condition */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">État</label>
        <select value={data.condition}
                onChange={e => setData('condition', e.target.value as ServerData['condition'])}
                className="w-full px-2 py-1 border rounded text-sm text-gray-700 bg-blue-50" required>
          <option value="new">Neuf</option>
          <option value="used">Occasion</option>
          <option value="refurbished">Reconditionné</option>
        </select>
        {errors.condition && <div className="text-xs text-red-600">{errors.condition}</div>}
      </div>
    </div>
  )
}
