import React, { useEffect, useMemo, useState } from 'react'
import { Head, Link, router } from '@inertiajs/react'
import { PageProps, TaxRate } from '@/types'
import AppLayout from '@/layouts/app-layout'
import { Button } from '@/components/ui/button'
import {
  Pencil, Trash2, Plus, RotateCcw, ChevronDown, Filter, X,
  SlidersHorizontal, AlertTriangle, CheckCircle, Search, Eye
} from 'lucide-react'
import { route } from 'ziggy-js'

interface Pagination<T> {
  data: T[]
  current_page: number
  last_page: number
  per_page: number
  total: number
}
type SortDirection = 'asc' | 'desc'
type FilterType = { field: 'name' | 'status'; value: string }
interface Flash { success?: string; error?: string }

interface Props extends PageProps<{
  taxRates: Pagination<TaxRate>
  flash?: Flash
}> {}

export default function TaxRatesIndex({ taxRates, flash }: Props) {
  const taxRatesArray = taxRates.data

  // States
  const [rowsPerPage, setRowsPerPage] = useState(10)
  const [currentPage, setCurrentPage] = useState(1)
  const [sortField, setSortField] = useState<'name' | 'status'>('name')
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc')
  const [selectedIds, setSelectedIds] = useState<number[]>([])

  const [activeFilters, setActiveFilters] = useState<FilterType[]>([])
  const [showFilterPanel, setShowFilterPanel] = useState(false)
  const [currentFilterField, setCurrentFilterField] =
    useState<FilterType['field']>('name')
  const [currentFilterValue, setCurrentFilterValue] = useState('')

  const [showSuccess, setShowSuccess] = useState(false)
  const [showError, setShowError] = useState(false)

  // Flash timeout
  useEffect(() => {
    if (flash?.success) {
      setShowSuccess(true)
      const t = setTimeout(() => setShowSuccess(false), 5000)
      return () => clearTimeout(t)
    }
  }, [flash?.success])

  useEffect(() => {
    if (flash?.error) {
      setShowError(true)
      const t = setTimeout(() => setShowError(false), 5000)
      return () => clearTimeout(t)
    }
  }, [flash?.error])

  // Filters
  const filterOptions = [
    { value: 'name', label: 'Nom' },
    { value: 'status', label: 'Statut' },
  ]
  const addFilter = () => {
    if (currentFilterValue)
      setActiveFilters(p => [...p, { field: currentFilterField, value: currentFilterValue }])
    setCurrentFilterValue('')
  }
  const clearAllFilters = () => setActiveFilters([])

  // Data pipeline
  const filtered = useMemo(() => taxRatesArray.filter(tr =>
    activeFilters.every(f => {
      switch (f.field) {
        case 'name':
          return tr.name.toLowerCase().includes(f.value.toLowerCase())
        case 'status':
          if (f.value.toLowerCase() === 'actif') return !tr.deleted_at
          if (f.value.toLowerCase() === 'désactivé') return !!tr.deleted_at
          return true
        default: return true
      }
    })
  ), [taxRatesArray, activeFilters])

  const sorted = useMemo(() => {
    return [...filtered].sort((a, b) => {
      if (sortField === 'status') {
        const cmp = (!a.deleted_at && b.deleted_at) ? -1 : (a.deleted_at && !b.deleted_at) ? 1 : 0
        return sortDirection === 'asc' ? cmp : -cmp
      }
      return sortDirection === 'asc'
        ? a.name.localeCompare(b.name)
        : b.name.localeCompare(a.name)
    })
  }, [filtered, sortField, sortDirection])

  const paginated = useMemo(() => {
    if (rowsPerPage === -1) return sorted
    const start = (currentPage - 1) * rowsPerPage
    return sorted.slice(start, start + rowsPerPage)
  }, [sorted, rowsPerPage, currentPage])

  const totalPages = rowsPerPage === -1 ? 1 : Math.ceil(filtered.length / rowsPerPage)

  // CRUD
  const restoreOne = (id: number) => {
    if (confirm('Restaurer ce taux de TVA ?'))
      router.post(route('taxrates.restore', { id }), {}, { preserveScroll: true })
  }
  const deleteOne = (id: number) => {
    if (confirm('Supprimer ce taux de TVA ?'))
      router.delete(route('taxrates.destroy', { id }), { preserveScroll: true })
  }
  const deleteSelected = () => {
    if (!selectedIds.length) return
    if (confirm(`Supprimer ${selectedIds.length} taux de TVA ?`))
      Promise.all(selectedIds.map(id => router.delete(route('taxrates.destroy', { id }), { preserveScroll: true })))
        .then(() => setSelectedIds([]))
  }
  const restoreSelected = () => {
    if (!selectedIds.length) return
    if (confirm(`Restaurer ${selectedIds.length} taux de TVA ?`))
      Promise.all(selectedIds.map(id => router.post(route('taxrates.restore', { id }), {}, { preserveScroll: true })))
        .then(() => setSelectedIds([]))
  }

  // Sélection lignes
  const toggleSelect = (id: number) =>
    setSelectedIds(p => p.includes(id) ? p.filter(i => i !== id) : [...p, id])

  const toggleSelectAll = () => {
    if (!paginated.length) return
    const targetActive = !paginated[0].deleted_at
    const ids = paginated.filter(tr => (!tr.deleted_at) === targetActive).map(tr => tr.id)
    setSelectedIds(p => p.length === ids.length ? [] : ids)
  }

  const allSelected = paginated.length > 0 && selectedIds.length === paginated.length
  const anyInactive = selectedIds.some(
    id => !!taxRatesArray.find(tr => tr.id === id)?.deleted_at
  )
  const anyActive = selectedIds.some(
    id => !taxRatesArray.find(tr => tr.id === id)?.deleted_at
  )

  // Render
  return (
    <>
      <Head title='Taux de TVA' />
      <AppLayout breadcrumbs={[
        { title: 'Dashboard', href: '/dashboard' },
        { title: 'Taux de TVA', href: '/tax-rates' }]}
      >
        <div className='p-4'>

          {/* Flash */}
          {flash?.success && showSuccess && (
            <div className='mb-4 p-4 rounded-lg bg-green-50 border border-green-200 text-green-800 flex items-start gap-3 animate-fade-in'>
              <CheckCircle className='w-5 h-5 text-green-600 mt-0.5' />
              <span className='flex-1 font-medium'>{flash.success}</span>
              <button onClick={() => setShowSuccess(false)}><X className='w-4 h-4' /></button>
            </div>
          )}
          {flash?.error && showError && (
            <div className='mb-4 p-4 rounded-lg bg-red-50 border border-red-200 text-red-800 flex items-start gap-3 animate-fade-in'>
              <AlertTriangle className='w-5 h-5 text-red-600 mt-0.5' />
              <span className='flex-1 font-medium'>{flash.error}</span>
              <button onClick={() => setShowError(false)}><X className='w-4 h-4' /></button>
            </div>
          )}

          {/* Toolbar */}
          <div className='flex justify-between items-center mb-6'>
            <h1 className='text-2xl font-bold'>Liste des taux de TVA</h1>
            <div className='flex items-center gap-2'>
              {selectedIds.length > 0 && (
                <>
                  {anyInactive && (
                    <Button variant='secondary' onClick={restoreSelected} className='flex items-center gap-1.5'>
                      <RotateCcw className='w-4 h-4' /> Restaurer ({selectedIds.length})
                    </Button>
                  )}
                  {anyActive && (
                    <Button variant='destructive' onClick={deleteSelected} className='flex items-center gap-1.5'>
                      <Trash2 className='w-4 h-4' /> Supprimer ({selectedIds.length})
                    </Button>
                  )}
                </>
              )}
              <Link href={route('taxrates.create')}>
                <Button className='bg-gray-600 hover:bg-gray-700'><Plus className='w-4 h-4' /> Ajouter</Button>
              </Link>
            </div>
          </div>

          {/* Filtres & rows-per-page */}
          <div className='bg-white p-4 rounded-lg shadow-sm mb-6'>
            <div className='flex flex-wrap items-start justify-between gap-4'>

              {/* Filtres */}
              <div className='flex flex-col gap-4 w-full lg:w-auto'>
                <div className='flex items-center gap-3'>
                  <Button onClick={() => setShowFilterPanel(!showFilterPanel)}
                          className={`flex items-center gap-2 ${showFilterPanel ? 'bg-gray-600 text-white' : 'bg-gray-50 text-gray-600'}`}>
                    <Filter className='w-4 h-4' /> {showFilterPanel ? 'Masquer' : 'Filtres'}
                  </Button>
                  {activeFilters.length > 0 && (
                    <Button variant='outline' onClick={clearAllFilters}
                            className='flex items-center gap-1.5 border-gray-200 text-gray-600'>
                      <X className='w-4 h-4' /> Effacer filtres
                    </Button>
                  )}
                </div>

                {showFilterPanel && (
                  <div className='bg-gray-50 p-4 rounded-lg border w-full lg:max-w-xl'>
                    <h3 className='text-sm font-medium flex items-center gap-2 mb-3'>
                      <SlidersHorizontal className='w-4 h-4' /> Filtrer les taux
                    </h3>
                    <div className='grid grid-cols-1 sm:grid-cols-3 gap-3 mb-3'>
                      <select value={currentFilterField}
                              onChange={e => setCurrentFilterField(e.target.value as any)}
                              className='w-full border rounded-lg px-3 py-2 text-sm bg-white'>
                        {filterOptions.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                      </select>
                      <div className='sm:col-span-2'>
                        {currentFilterField === 'status' ? (
                          <select value={currentFilterValue} onChange={e => setCurrentFilterValue(e.target.value)}
                                  className='w-full border rounded-lg px-3 py-2 text-sm bg-white'>
                            <option value=''>Sélectionner</option>
                            <option value='actif'>Actif</option>
                            <option value='désactivé'>Désactivé</option>
                          </select>
                        ) : (
                          <div className='flex items-center gap-2'>
                            <div className='relative flex-1'>
                              <Search className='absolute left-3 top-2.5 w-4 h-4 text-gray-400' />
                              <input value={currentFilterValue}
                                     onChange={e => setCurrentFilterValue(e.target.value)}
                                     onKeyDown={e => e.key === 'Enter' && addFilter()}
                                     placeholder='Filtrer par nom'
                                     className='w-full border rounded-lg pl-9 pr-3 py-2 text-sm' />
                            </div>
                            <Button onClick={addFilter} disabled={!currentFilterValue}>Ajouter</Button>
                          </div>
                        )}
                      </div>
                    </div>
                    {currentFilterField === 'status' && (
                      <Button onClick={addFilter} disabled={!currentFilterValue}>Ajouter le filtre</Button>
                    )}
                  </div>
                )}
                {activeFilters.length > 0 && (
                  <div className='flex flex-wrap gap-2 mt-2'>
                    {activeFilters.map((f, i) => (
                      <div key={i} className='flex items-center gap-2 bg-indigo-50 text-indigo-700 px-3 py-1.5 rounded-lg text-sm'>
                        <span className='font-medium'>
                          {filterOptions.find(o => o.value === f.field)?.label}:
                        </span>
                        <span>{f.value}</span>
                        <button onClick={() => setActiveFilters(p => p.filter((_, idx) => idx !== i))}>
                          <X className='w-3.5 h-3.5' />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Sélecteur lignes/page */}
              <div className='relative min-w-[220px]'>
                <select
                  value={rowsPerPage}
                  onChange={e => { setRowsPerPage(+e.target.value); setCurrentPage(1) }}
                  className='appearance-none w-full bg-gray-50 border border-gray-200 rounded-lg
                             pl-4 pr-10 py-2.5 text-sm text-gray-600 focus:outline-none focus:ring-2
                             focus:ring-indigo-500 focus:border-transparent'
                >
                  {[5, 10, 20, 50].map(n => (
                    <option key={n} value={n}>{n} lignes/page</option>
                  ))}
                  <option value={-1}>Tous</option>
                </select>
                <ChevronDown className='absolute right-3 top-3 w-4 h-4 text-gray-400 pointer-events-none' />
              </div>
            </div>
          </div>

          {/* Table */}
          <div className='bg-white overflow-hidden rounded-lg shadow-sm'>
            <table className='min-w-full divide-y divide-gray-200 text-sm'>
              <thead className='bg-gray-50'>
                <tr>
                  <th className='px-4 py-3 text-center w-12'>
                    <input
                      type='checkbox'
                      checked={allSelected}
                      onChange={toggleSelectAll}
                      className='rounded border-gray-300 text-indigo-600'
                    />
                  </th>
                  <th
                    className='px-4 py-3 cursor-pointer min-w-[180px] text-left'
                    onClick={() => {
                      setSortField('name')
                      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc')
                    }}
                  >
                    <div className='flex items-center gap-1'>
                      Nom {sortField === 'name' && (sortDirection === 'asc' ? '▲' : '▼')}
                    </div>
                  </th>
                  <th className='px-2 py-3 text-center w-20'>Taux</th>
                  <th
                    className='px-2 py-3 cursor-pointer text-center min-w-[75px] w-1'
                    onClick={() => {
                      setSortField('status')
                      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc')
                    }}
                  >
                    <div className='flex justify-center gap-1'>
                      Statut {sortField === 'status' && (sortDirection === 'asc' ? '▲' : '▼')}
                    </div>
                  </th>
                  <th className='px-2 py-3 text-center w-16'>Actions</th>
                </tr>
              </thead>
              <tbody className='divide-y divide-gray-200 bg-white'>
                {paginated.length === 0 ? (
                  <tr>
                    <td colSpan={5} className='px-4 py-8 text-center text-gray-500'>
                      <div className='flex flex-col items-center gap-2'>
                        <X className='w-8 h-8 text-gray-400' />
                        <p>Aucun taux de TVA trouvé.</p>
                        {activeFilters.length > 0 && (
                          <Button variant='outline' onClick={clearAllFilters}>Effacer les filtres</Button>
                        )}
                      </div>
                    </td>
                  </tr>
                ) : paginated.map(tr => (
                  <tr key={tr.id} className={`${tr.deleted_at ? 'bg-red-50' : ''} hover:bg-gray-50`}>
                    <td className='px-4 py-3 text-center w-12'>
                      <input
                        type='checkbox'
                        checked={selectedIds.includes(tr.id)}
                        onChange={() => toggleSelect(tr.id)}
                        className='rounded border-gray-300 text-indigo-600'
                      />
                    </td>
                    <td className='px-4 py-3 font-medium min-w-[180px]'>{tr.name}</td>
                    <td className='px-2 py-3 text-center w-20'>{Number(tr.rate).toFixed(2)}%</td>
                    <td className='px-2 py-3 text-center min-w-[75px] w-1'>
                      {tr.deleted_at ? (
                        <span className='px-2 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800 whitespace-nowrap'>
                          Désactivé
                        </span>
                      ) : (
                        <span className='px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 whitespace-nowrap'>
                          Actif
                        </span>
                      )}
                    </td>
                    <td className='px-2 py-3 text-center w-16'>
                      <div className='flex justify-center gap-2'>
                        {!tr.deleted_at && (
                          <Link
                            href={route('taxrates.show', tr.id)}
                            className='text-blue-600 hover:text-blue-900 p-1 rounded-full hover:bg-blue-50'
                            aria-label='Voir'
                          >
                            <Eye className='w-5 h-5' />
                          </Link>
                        )}
                        {!tr.deleted_at && (
                          <Link
                            href={route('taxrates.edit', tr.id)}
                            className='text-yellow-600 hover:text-yellow-900 p-1 rounded-full hover:bg-yellow-50'
                            aria-label='Modifier'
                          >
                            <Pencil className='w-5 h-5' />
                          </Link>
                        )}
                        {tr.deleted_at ? (
                          <button
                            onClick={() => restoreOne(tr.id)}
                            className='text-gray-600 hover:text-gray-900 p-1 rounded-full hover:bg-gray-100'
                            aria-label='Restaurer'
                          >
                            <RotateCcw className='w-5 h-5' />
                          </button>
                        ) : (
                          <button
                            onClick={() => deleteOne(tr.id)}
                            className='text-red-600 hover:text-red-900 p-1 rounded-full hover:bg-red-50'
                            aria-label='Supprimer'
                          >
                            <Trash2 className='w-5 h-5' />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className='flex flex-col sm:flex-row justify-between items-center mt-4 bg-white p-4 rounded-lg shadow-sm gap-4'>
            <span className='text-sm text-gray-600'>
              {rowsPerPage === -1
                ? `Tous les ${filtered.length} résultats`
                : `Affichage ${Math.min((currentPage - 1) * rowsPerPage + 1, filtered.length)}‑${Math.min(currentPage * rowsPerPage, filtered.length)} sur ${filtered.length}`}
            </span>
            {rowsPerPage !== -1 && totalPages > 1 && (
              <div className='flex items-center gap-2'>
                <Button variant='outline' disabled={currentPage === 1}
                        onClick={() => setCurrentPage(p => p - 1)}>Précédent</Button>
                {Array.from({ length: Math.min(5, totalPages) }).map((_, i) => {
                  let n = i + 1
                  if (totalPages > 5) {
                    if (currentPage <= 3) n = i + 1
                    else if (currentPage >= totalPages - 2) n = totalPages - 4 + i
                    else n = currentPage - 2 + i
                  }
                  return (
                    <Button key={n} variant={currentPage === n ? 'default' : 'outline'}
                            onClick={() => setCurrentPage(n)}
                            className={currentPage === n ? 'bg-gray-600 hover:bg-gray-700' : undefined}>
                      {n}
                    </Button>
                  )
                })}
                <Button variant='outline' disabled={currentPage === totalPages}
                        onClick={() => setCurrentPage(p => p + 1)}>Suivant</Button>
              </div>
            )}
          </div>

        </div>
      </AppLayout>
    </>
  )
}
