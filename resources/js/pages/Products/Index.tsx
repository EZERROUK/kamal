/* resources/js/Pages/Products/Index.tsx */
import React, { useMemo, useState, useEffect } from 'react'
import { Head, Link, router } from '@inertiajs/react'
import { PageProps, Product } from '@/types'
import AppLayout from '@/layouts/app-layout'
import { Button } from '@/components/ui/button'
import {
  Eye, Pencil, Trash2, Plus, RotateCcw, ChevronDown, Filter, X,
  SlidersHorizontal, AlertTriangle, CheckCircle, Search, Box
} from 'lucide-react'
import { route } from 'ziggy-js'

/* ----- Types ---------------------------------------------------- */
interface Pagination<T> {
  data: T[]
  current_page: number
  last_page: number
  per_page: number
  total: number
}

type SortDirection = 'asc' | 'desc'
type FilterType = { field: 'name' | 'category' | 'status'; value: string }

interface Flash { success?: string; error?: string }

interface Props extends PageProps<{
  products: Pagination<Product>
  flash?: Flash
}> {}

export default function ProductsIndex ({ products, flash }: Props) {
  const productArray = products.data

  /* ---------- UI state ----------------------------------------- */
  const [rowsPerPage, setRowsPerPage] = useState(10)
  const [currentPage, setCurrentPage] = useState(1)
  const [sortField, setSortField]   = useState<'name' | 'status' | 'created_at'>('created_at')
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc')
  const [selectedIds, setSelectedIds] = useState<string[]>([])

  const [activeFilters, setActiveFilters] = useState<FilterType[]>([])
  const [showFilterPanel, setShowFilterPanel] = useState(false)
  const [currentFilterField, setCurrentFilterField] =
    useState<FilterType['field']>('name')
  const [currentFilterValue, setCurrentFilterValue] = useState('')

  const [showSuccess, setShowSuccess] = useState(false)
  const [showError,   setShowError]   = useState(false)

  /* ---------- Flash messages fade‑out --------------------------- */
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

  /* ---------- Filter helpers ----------------------------------- */
  const filterOptions = [
    { value: 'name',     label: 'Nom' },
    { value: 'category', label: 'Catégorie' },
    { value: 'status',   label: 'Statut' },
  ]
  const addFilter = () => {
    if (currentFilterValue)
      setActiveFilters(p => [...p, { field: currentFilterField, value: currentFilterValue }])
    setCurrentFilterValue('')
  }
  const clearAllFilters = () => setActiveFilters([])

  /* ---------- Data pipeline ------------------------------------ */
  const filtered = useMemo(() => productArray.filter(prod =>
    activeFilters.every(f => {
      switch (f.field) {
        case 'name':
          return prod.name.toLowerCase().includes(f.value.toLowerCase())
        case 'category':
          return prod.category?.name.toLowerCase().includes(f.value.toLowerCase())
        case 'status':
          if (f.value.toLowerCase() === 'actif')      return !prod.deleted_at
          if (f.value.toLowerCase() === 'désactivé')  return !!prod.deleted_at
          return true
        default: return true
      }
    })
  ), [productArray, activeFilters])

  const sorted = useMemo(() => {
    return [...filtered].sort((a, b) => {
      if (sortField === 'status') {
        const cmp = (!a.deleted_at && b.deleted_at) ? -1 : (a.deleted_at && !b.deleted_at) ? 1 : 0
        return sortDirection === 'asc' ? cmp : -cmp
      }
      if (sortField === 'created_at') {
        return sortDirection === 'asc'
          ? new Date(a.created_at!).getTime() - new Date(b.created_at!).getTime()
          : new Date(b.created_at!).getTime() - new Date(a.created_at!).getTime()
      }
      const cmp = a.name.localeCompare(b.name)
      return sortDirection === 'asc' ? cmp : -cmp
    })
  }, [filtered, sortField, sortDirection])

  const paginated = useMemo(() => {
    if (rowsPerPage === -1) return sorted
    const start = (currentPage - 1) * rowsPerPage
    return sorted.slice(start, start + rowsPerPage)
  }, [sorted, rowsPerPage, currentPage])

  const totalPages = rowsPerPage === -1 ? 1 : Math.ceil(filtered.length / rowsPerPage)

  /* ---------- CRUD / actions ----------------------------------- */
  const restoreOne = (id: string) => {
    if (confirm('Restaurer ce produit ?'))
      router.post(route('products.restore', { id }), {}, { preserveScroll: true })
  }
  const deleteOne = (id: string) => {
    if (confirm('Supprimer ce produit ?'))
      router.delete(route('products.destroy', { id }), { preserveScroll: true })
  }

  const deleteSelected = () => {
    if (!selectedIds.length) return
    if (confirm(`Supprimer ${selectedIds.length} produit(s) ?`))
      Promise.all(selectedIds.map(id => router.delete(route('products.destroy', { id }), { preserveScroll: true })))
        .then(() => setSelectedIds([]))
  }
  const restoreSelected = () => {
    if (!selectedIds.length) return
    if (confirm(`Restaurer ${selectedIds.length} produit(s) ?`))
      Promise.all(selectedIds.map(id => router.post(route('products.restore', { id }), {}, { preserveScroll: true })))
        .then(() => setSelectedIds([]))
  }

  /* ---------- Sélection lignes --------------------------------- */
  const toggleSelect = (id: string) =>
    setSelectedIds(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id])

  const toggleSelectAll = () => {
    if (!paginated.length) return
    const firstActive = !paginated[0].deleted_at
    const ids = paginated.filter(p => !p.deleted_at === firstActive).map(p => p.id)
    setSelectedIds(prev => prev.length === ids.length ? [] : ids)
  }

  const allSelected = paginated.length > 0 && selectedIds.length === paginated.length
  const anyInactive   = selectedIds.some(id => productArray.find(p => p.id === id)?.deleted_at)
  const anyActive     = selectedIds.some(id => !productArray.find(p => p.id === id)?.deleted_at)

  /* ---------- Render ------------------------------------------- */
  return (
    <>
      <Head title='Produits' />
      <AppLayout breadcrumbs={[{ title: 'Dashboard', href: '/dashboard' }, { title: 'Produits', href: '/products' }]}>
        <div className='p-4'>

          {/* Flash messages */}
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

          {/* Toolbar ------------------------------------------------ */}
          <div className='flex justify-between items-center mb-6'>
            <h1 className='text-2xl font-bold'>Liste des produits</h1>
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
              <Link href={route('products.create')}>
                <Button className='bg-gray-600 hover:bg-gray-700'><Plus className='w-4 h-4' /> Ajouter un produit</Button>
              </Link>
            </div>
          </div>

          {/* Filtres & rows‑per‑page -------------------------------- */}
          <div className='bg-white p-4 rounded-lg shadow-sm mb-6'>
            <div className='flex flex-wrap items-start justify-between gap-4'>
              {/* Filtre panneau gauche */}
              <div className='flex flex-col gap-4 w-full lg:w-auto'>
                <div className='flex items-center gap-3'>
                  <Button onClick={() => setShowFilterPanel(!showFilterPanel)}
                          className={`flex items-center gap-2 transition-colors ${showFilterPanel ? 'bg-gray-600 text-white' : 'bg-gray-50 text-gray-600'}`}>
                    <Filter className='w-4 h-4' /> {showFilterPanel ? 'Masquer' : 'Filtres'}
                  </Button>
                  {activeFilters.length > 0 && (
                    <Button variant='outline' onClick={clearAllFilters} className='flex items-center gap-1.5'>
                      <X className='w-4 h-4' /> Effacer filtres
                    </Button>
                  )}
                </div>

                {showFilterPanel && (
                  <div className='bg-gray-50 p-4 rounded-lg border w-full lg:max-w-xl'>
                    <h3 className='text-sm font-medium flex items-center gap-2 mb-3'>
                      <SlidersHorizontal className='w-4 h-4' /> Filtrer les produits
                    </h3>

                    <div className='grid grid-cols-1 sm:grid-cols-3 gap-3 mb-3'>
                      <select value={currentFilterField} onChange={e => setCurrentFilterField(e.target.value as any)}
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
                              <input type='text' value={currentFilterValue}
                                     onChange={e => setCurrentFilterValue(e.target.value)}
                                     onKeyDown={e => e.key === 'Enter' && addFilter()}
                                     placeholder={`Filtrer par ${currentFilterField}`}
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
                        <span className='font-medium'>{filterOptions.find(o => o.value === f.field)?.label}:</span>
                        <span>{f.value}</span>
                        <button onClick={() => setActiveFilters(prev => prev.filter((_, idx) => idx !== i))}>
                          <X className='w-3.5 h-3.5' />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Rows per page select */}
              <div className='relative min-w-[220px]'>
                <select value={rowsPerPage} onChange={e => { setRowsPerPage(+e.target.value); setCurrentPage(1) }}
                        className='appearance-none w-full bg-gray-50 border border-gray-200 rounded-lg pl-4 pr-10 py-2.5 text-sm text-gray-600'>
                  {[5,10,20,50].map(n => <option key={n} value={n}>{n} lignes/page</option>)}
                  <option value={-1}>Tous</option>
                </select>
                <ChevronDown className='absolute right-3 top-3 w-4 h-4 text-gray-400 pointer-events-none' />
              </div>
            </div>
          </div>

          {/* Table --------------------------------------------------- */}
          <div className='bg-white overflow-hidden rounded-lg shadow-sm'>
            <table className='min-w-full divide-y divide-gray-200 text-sm'>
              <thead className='bg-gray-50'>
                <tr>
                  <th className='px-4 py-3'>
                    <input type='checkbox' checked={allSelected} onChange={toggleSelectAll}
                           className='rounded border-gray-300 text-indigo-600' />
                  </th>
                  <th className='px-4 py-3 cursor-pointer' onClick={() => {
                    setSortField('name'); setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc')
                  }}>
                    <div className='flex items-center gap-1'>
                      Nom {sortField === 'name' && (sortDirection === 'asc' ? '▲' : '▼')}
                    </div>
                  </th>
                  <th className='px-4 py-3'>Catégorie</th>
                  <th className='px-4 py-3'>Prix</th>
                  <th className='px-4 py-3 text-center'>Stock</th>
                  <th className='px-4 py-3 text-center cursor-pointer'
                      onClick={() => {
                        setSortField('status'); setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc')
                      }}>
                    <div className='flex justify-center gap-1'>
                      Statut {sortField === 'status' && (sortDirection === 'asc' ? '▲' : '▼')}
                    </div>
                  </th>
                                    <th className='px-4 py-3 text-center cursor-pointer' onClick={() => {
                    setSortField('created_at'); setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc')
                  }}>
                    <div className='flex justify-center gap-1'>
                      Date de création {sortField === 'created_at' && (sortDirection === 'asc' ? '▲' : '▼')}
                    </div>
                  </th>
                  <th className='px-4 py-3 text-center'>Actions</th>
                </tr>
              </thead>
              <tbody className='divide-y divide-gray-200 bg-white'>
                {paginated.length === 0 ? (
                  <tr>
                    <td colSpan={7} className='px-4 py-8 text-center text-gray-500'>
                      <div className='flex flex-col items-center gap-2'>
                        <X className='w-8 h-8 text-gray-400' />
                        <p>Aucun produit trouvé.</p>
                        {activeFilters.length > 0 && (
                          <Button variant='outline' onClick={clearAllFilters}>Effacer les filtres</Button>
                        )}
                      </div>
                    </td>
                  </tr>
                ) : paginated.map(p => (
                  <tr key={p.id} className={`${p.deleted_at ? 'bg-red-50' : ''} hover:bg-gray-50`}>
                    <td className='px-4 py-3 text-center'>
                      <input type='checkbox' checked={selectedIds.includes(p.id)} onChange={() => toggleSelect(p.id)}
                             className='rounded border-gray-300 text-indigo-600' />
                    </td>
                    <td className='px-4 py-3 font-medium'>{p.name}</td>
                    <td className='px-4 py-3 text-gray-500'>{p.category?.name}</td>
                    <td className='px-4 py-3'>{p.price} {p.currency?.symbol}</td>
                    <td className='px-4 py-3 text-center'>{p.stock_quantity}</td>
                    <td className='px-4 py-3 text-center'>
                      {p.deleted_at ? (
                        <span className='px-2 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800'>Désactivé</span>
                      ) : (
                        <span className='px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800'>Actif</span>
                      )}
                    </td>
                                        <td className='px-4 py-3 text-center'>
                      {new Date(p.created_at!).toLocaleString('fr-FR', {
                    day: '2-digit',
                    month: '2-digit',
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                    second: '2-digit'
                    })}
                    </td>
                    <td className='px-4 py-3 text-center'>
                      <div className='flex justify-center gap-2'>
                        {p.deleted_at ? (
                          <button onClick={() => restoreOne(p.id)} className='text-gray-600 hover:text-gray-900 p-1'>
                            <RotateCcw className='w-5 h-5' />
                          </button>
                        ) : (
                          <>
                           <Link
                             href={route('products.show', p.id)}
                             className='text-blue-600 hover:text-blue-900 p-1 rounded-full hover:bg-blue-50'
                             aria-label='Voir'
                           >
                             <Eye className='w-5 h-5' />
                           </Link>
                            <Link href={route('products.edit', p.id)} className='text-yellow-600 hover:text-yellow-900 p-1'>
                              <Pencil className='w-5 h-5' />
                            </Link>
                            <button onClick={() => deleteOne(p.id)} className='text-red-600 hover:text-red-900 p-1'>
                              <Trash2 className='w-5 h-5' />
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination locale simple */}
          <div className='flex flex-col sm:flex-row justify-between items-center mt-4 bg-white p-4 rounded-lg shadow-sm gap-4'>
            <span className='text-sm text-gray-600'>
              {rowsPerPage === -1
                ? `Tous les ${filtered.length} résultats`
                : `Affichage ${Math.min((currentPage - 1) * rowsPerPage + 1, filtered.length)}‑${Math.min(currentPage * rowsPerPage, filtered.length)} sur ${filtered.length}`}
            </span>
            {rowsPerPage !== -1 && totalPages > 1 && (
              <div className='flex items-center gap-2'>
                <Button variant='outline' disabled={currentPage === 1}
                        onClick={() => setCurrentPage(currentPage - 1)}>Précédent</Button>

                {/* numérotation max 5 */}
                {Array.from({ length: Math.min(5, totalPages) }).map((_, i) => {
                  let pageNum = i + 1
                  if (totalPages > 5) {
                    if (currentPage <= 3) pageNum = i + 1
                    else if (currentPage >= totalPages - 2) pageNum = totalPages - 4 + i
                    else pageNum = currentPage - 2 + i
                  }
                  return (
                    <Button key={pageNum} variant={currentPage === pageNum ? 'default' : 'outline'}
                            onClick={() => setCurrentPage(pageNum)}
                            className={currentPage === pageNum ? 'bg-gray-600 hover:bg-gray-700' : undefined}>
                      {pageNum}
                    </Button>
                  )
                })}

                <Button variant='outline' disabled={currentPage === totalPages}
                        onClick={() => setCurrentPage(currentPage + 1)}>Suivant</Button>
              </div>
            )}
          </div>

        </div>
      </AppLayout>
    </>
  )
}
