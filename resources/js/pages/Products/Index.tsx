/* resources/js/Pages/Products/Index.tsx */
import React, { useEffect, useMemo, useState } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import { PageProps, Product } from '@/types';
import AppLayout from '@/layouts/app-layout';
import { Button } from '@/components/ui/button';
import {
  Eye, Pencil, Trash2, Plus, RotateCcw, ChevronDown, Filter, X,
  SlidersHorizontal, AlertTriangle, CheckCircle, Search,
  ChevronsLeft, ChevronLeft, ChevronRight, ChevronsRight,
} from 'lucide-react';
import { route } from 'ziggy-js';

/* -------------------------------------------------------------------------- */
/* Types                                                                      */
/* -------------------------------------------------------------------------- */
interface Pagination<T> {
  data: T[];
  current_page: number;
  last_page: number;
  per_page: number;
  total: number;
  from: number;
  to: number;
}

type FilterField = 'search' | 'name' | 'category' | 'status';
type FilterType  = { field: FilterField; value: string };
interface Flash { success?: string; error?: string }

interface Props extends PageProps<{
  products: Pagination<Product>;
  filters : { search?:string; name?:string; category?:string; status?:string };
  sort    : 'name' | 'status' | 'created_at';
  dir     : 'asc'  | 'desc';
  flash?  : Flash;
}> {}

/* -------------------------------------------------------------------------- */
/* Component                                                                  */
/* -------------------------------------------------------------------------- */
export default function ProductsIndex ({
  products, filters, sort, dir, flash,
}: Props) {

  /* --------------------------- état UI --------------------------------- */
  const [showFilterPanel, setShowFilterPanel] = useState(false);
  const [currentFilterField, setCurrentFilterField] =
    useState<FilterField>('search');
  const [currentFilterValue, setCurrentFilterValue] = useState('');

  const [activeFilters, setActiveFilters] = useState<FilterType[]>(() => {
    const arr: FilterType[] = [];
    if (filters.search)   filters.search.split(/\s+/).forEach(v => arr.push({ field:'search',   value:v }));
    if (filters.name)     arr.push({ field:'name',     value:filters.name });
    if (filters.category) arr.push({ field:'category', value:filters.category });
    if (filters.status)   arr.push({ field:'status',   value:filters.status });
    return arr;
  });

  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [showSuccess, setShowSuccess] = useState(false);
  const [showError,   setShowError]   = useState(false);

  /* --------------------- flash auto dismiss ---------------------------- */
  useEffect(() => {
    if (flash?.success) { setShowSuccess(true); const t=setTimeout(()=>setShowSuccess(false),5000); return()=>clearTimeout(t); }
  }, [flash?.success]);
  useEffect(() => {
    if (flash?.error)   { setShowError(true);   const t=setTimeout(()=>setShowError(false),5000);   return()=>clearTimeout(t); }
  }, [flash?.error]);

  /* --------------------- helpers Inertia -------------------------------- */
  const inertiaOpts = { preserveScroll:true, preserveState:true,
                        only:['products','filters','sort','dir','flash'] } as const;

  /** Construit l’objet querystring et lance la requête Inertia */
  const go = (filtersList: FilterType[], extra: Record<string, any> = {}) => {
    const payload: Record<string, any> = { ...extra };

    // concatène tous les "search"
    const searchTerms = filtersList
      .filter(f => f.field === 'search')
      .map(f => f.value)
      .join(' ');
    if (searchTerms) payload.search = searchTerms;

    // prend la dernière occurrence pour les autres clés
    (['name','category','status'] as FilterField[]).forEach(k => {
      const v = filtersList.findLast(f => f.field === k)?.value;
      if (v) payload[k] = v;
    });

    router.get(route('products.index'), payload, inertiaOpts);
  };

  /* --------------------- add / remove filter --------------------------- */
  const addFilter = () => {
    if (!currentFilterValue) return;
    const next = [...activeFilters, { field: currentFilterField, value: currentFilterValue }];
    setActiveFilters(next);
    setCurrentFilterValue('');
    go(next, { page:1, per_page:products.per_page, sort, dir });
  };

  const removeFilter = (idx:number) => {
    const next = activeFilters.filter((_, i) => i !== idx);
    setActiveFilters(next);
    go(next, { page:1, per_page:products.per_page, sort, dir });
  };

  const resetFilters = () => {
    setActiveFilters([]);
    router.get(route('products.index'),
      { page:1, per_page:products.per_page }, inertiaOpts);
  };

  /* --------------------- pagination / tri ------------------------------ */
  const changePage = (p:number) => go(activeFilters,
    { page:p, per_page:products.per_page, sort, dir });

  const changePer  = (n:number) => go(activeFilters,
    { page:1, per_page:n, sort, dir });

  const changeSort = (field:'name'|'status'|'created_at') => {
    const newDir = sort===field ? (dir==='asc'?'desc':'asc') : 'asc';
    go(activeFilters, { page:1, per_page:products.per_page, sort:field, dir:newDir });
  };

  /* --------------------- sélection lignes ------------------------------ */
  const toggleSelect = (id:string) =>
    setSelectedIds(prev => prev.includes(id) ? prev.filter(i=>i!==id) : [...prev,id]);

  const toggleSelectAll = () => {
    const ids = products.data.map(p=>p.id);
    setSelectedIds(prev => prev.length===ids.length ? [] : ids);
  };

  const anyInactive = selectedIds.some(id=>products.data.find(p=>p.id===id)?.deleted_at);
  const anyActive   = selectedIds.some(id=>!products.data.find(p=>p.id===id)?.deleted_at);

  /* --------------------- bulk actions ---------------------------------- */
  const restoreSelected = () => {
    if (!selectedIds.length) return;
    if (confirm(`Restaurer ${selectedIds.length} produit(s) ?`))
      Promise.all(selectedIds.map(id =>
        router.post(route('products.restore',{id}), {}, inertiaOpts)))
        .then(()=>setSelectedIds([]));
  };
  const deleteSelected = () => {
    if (!selectedIds.length) return;
    if (confirm(`Supprimer ${selectedIds.length} produit(s) ?`))
      Promise.all(selectedIds.map(id =>
        router.delete(route('products.destroy',{id}), inertiaOpts)))
        .then(()=>setSelectedIds([]));
  };

  /* --------------------- fenêtre de pagination ------------------------- */
  const windowPages = useMemo(() => {
    const win=5, c=products.current_page, l=products.last_page, out:(number|'…')[]=[];
    const push=(v:number|'…')=>out.push(v);
    if(l<=win+2){for(let i=1;i<=l;i++)push(i);}
    else{
      push(1);
      const s=Math.max(2,c-1), e=Math.min(l-1,c+1);
      if(s>2)push('…');
      for(let i=s;i<=e;i++)push(i);
      if(e<l-1)push('…');
      push(l);
    }
    return out;
  },[products]);

  /* -------------------------------------------------------------------- */
  const filterOptions = [
    { value:'search',   label:'Plein texte' },
    { value:'name',     label:'Nom' },
    { value:'category', label:'Catégorie' },
    { value:'status',   label:'Statut' },
  ];

  return (
    <>
      <Head title="Produits" />
      <AppLayout breadcrumbs={[{title:'Dashboard',href:'/dashboard'},{title:'Produits',href:'/products'}]}>
        <div className="p-4">

          {/* ---------------- flash ----------------------------------- */}
          {flash?.success && showSuccess && (
            <div className="mb-4 p-4 rounded-lg bg-green-50 border border-green-200 text-green-800 flex items-start gap-3">
              <CheckCircle className="w-5 h-5 text-green-600 mt-0.5"/>
              <span className="flex-1 font-medium">{flash.success}</span>
              <button onClick={()=>setShowSuccess(false)}><X className="w-4 h-4"/></button>
            </div>
          )}
          {flash?.error && showError && (
            <div className="mb-4 p-4 rounded-lg bg-red-50 border border-red-200 text-red-800 flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-red-600 mt-0.5"/>
              <span className="flex-1 font-medium">{flash.error}</span>
              <button onClick={()=>setShowError(false)}><X className="w-4 h-4"/></button>
            </div>
          )}

          {/* ---------------- toolbar --------------------------------- */}
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-bold">Liste des produits</h1>
            <div className="flex items-center gap-2">
              {selectedIds.length>0 && (
                <>
                  {anyInactive && (
                    <Button variant="secondary" onClick={restoreSelected}
                            className="flex items-center gap-1.5">
                      <RotateCcw className="w-4 h-4"/> Restaurer ({selectedIds.length})
                    </Button>
                  )}
                  {anyActive && (
                    <Button variant="destructive" onClick={deleteSelected}
                            className="flex items-center gap-1.5">
                      <Trash2 className="w-4 h-4"/> Supprimer ({selectedIds.length})
                    </Button>
                  )}
                </>
              )}
              <Link href={route('products.create')}>
                <Button className="bg-gray-600 hover:bg-gray-700">
                  <Plus className="w-4 h-4"/> Ajouter un produit
                </Button>
              </Link>
            </div>
          </div>

          {/* ---------------- filtres + per-page ---------------------- */}
          <div className="bg-white p-4 rounded-lg shadow-sm mb-6">
            <div className="flex flex-wrap items-start justify-between gap-4">

              {/* ---- filtres ----------------------------------------- */}
              <div className="flex flex-col gap-4 w-full lg:w-auto">
                <div className="flex items-center gap-3">
                  <Button onClick={()=>setShowFilterPanel(!showFilterPanel)}
                          className={`flex items-center gap-2 ${showFilterPanel?'bg-gray-600 text-white':'bg-gray-50 text-gray-600'}`}>
                    <Filter className="w-4 h-4"/>{showFilterPanel?'Masquer':'Filtres'}
                  </Button>
                  {activeFilters.length>0 && (
                    <Button variant="outline" onClick={resetFilters}
                            className="flex items-center gap-1.5">
                      <X className="w-4 h-4"/> Effacer filtres
                    </Button>
                  )}
                </div>

                {showFilterPanel && (
                  <div className="bg-gray-50 p-4 rounded-lg border w-full lg:max-w-xl">
                    <h3 className="text-sm font-medium flex items-center gap-2 mb-3">
                      <SlidersHorizontal className="w-4 h-4"/> Filtrer les produits
                    </h3>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-3">
                      <select value={currentFilterField}
                              onChange={e=>setCurrentFilterField(e.target.value as FilterField)}
                              className="border rounded-lg px-3 py-2 text-sm bg-white w-full">
                        {filterOptions.map(o=>(
                          <option key={o.value} value={o.value}>{o.label}</option>
                        ))}
                      </select>

                      <div className="sm:col-span-2">
                        {currentFilterField==='status' ? (
                          <select value={currentFilterValue}
                                  onChange={e=>setCurrentFilterValue(e.target.value)}
                                  className="border rounded-lg px-3 py-2 text-sm bg-white w-full">
                            <option value="">Sélectionner</option>
                            <option value="actif">Actif</option>
                            <option value="désactivé">Désactivé</option>
                          </select>
                        ) : (
                          <div className="flex items-center gap-2">
                            <div className="relative flex-1">
                              <Search className="absolute left-3 top-2.5 w-4 h-4 text-gray-400"/>
                              <input value={currentFilterValue}
                                     onChange={e=>setCurrentFilterValue(e.target.value)}
                                     onKeyDown={e=>{ if(e.key==='Enter') addFilter(); }}
                                     placeholder={`Filtrer par ${currentFilterField}`}
                                     className="border rounded-lg pl-9 pr-3 py-2 text-sm w-full"/>
                            </div>
                            <Button onClick={addFilter} disabled={!currentFilterValue}>Ajouter</Button>
                          </div>
                        )}
                      </div>
                    </div>

                    {currentFilterField==='status' && (
                      <Button onClick={addFilter} disabled={!currentFilterValue}>Ajouter le filtre</Button>
                    )}
                  </div>
                )}

                {activeFilters.length>0 && (
                  <div className="flex flex-wrap gap-2 mt-2">
                    {activeFilters.map((f,i)=>(
                      <div key={`${f.field}-${f.value}-${i}`}
                           className="flex items-center gap-2 bg-indigo-50 text-indigo-700 px-3 py-1.5 rounded-lg text-sm">
                        <span className="font-medium">
                          {filterOptions.find(o=>o.value===f.field)?.label}:
                        </span>
                        <span>{f.value}</span>
                        <button onClick={()=>removeFilter(i)}>
                          <X className="w-3.5 h-3.5"/>
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* ---- per-page select -------------------------------- */}
              <div className="relative min-w-[220px]">
                <select value={products.per_page}
                        onChange={e=>changePer(+e.target.value)}
                        className="appearance-none w-full bg-gray-50 border border-gray-200 rounded-lg pl-4 pr-10 py-2.5 text-sm text-gray-600">
                  {[5,10,20,50].map(n=><option key={n} value={n}>{n} lignes/page</option>)}
                  <option value={-1}>Tous</option>
                </select>
                <ChevronDown className="absolute right-3 top-3 w-4 h-4 text-gray-400 pointer-events-none"/>
              </div>
            </div>
          </div>

          {/* ---------------- table -------------------------------- */}
          <div className="bg-white rounded-lg shadow-sm overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200 text-sm">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3">
                    <input type="checkbox"
                           checked={selectedIds.length===products.data.length}
                           onChange={toggleSelectAll}
                           className="rounded border-gray-300 text-indigo-600"/>
                  </th>
                  <th className="px-4 py-3 cursor-pointer" onClick={()=>changeSort('name')}>
                    <div className="flex items-center gap-1">
                      Nom {sort==='name' && (dir==='asc'?'▲':'▼')}
                    </div>
                  </th>
                  <th className="px-4 py-3">Catégorie</th>
                  <th className="px-4 py-3">Prix</th>
                  <th className="px-4 py-3 text-center">Stock</th>
                  <th className="px-4 py-3 text-center cursor-pointer" onClick={()=>changeSort('status')}>
                    <div className="flex justify-center gap-1">
                      Statut {sort==='status' && (dir==='asc'?'▲':'▼')}
                    </div>
                  </th>
                  <th className="px-4 py-3 text-center cursor-pointer" onClick={()=>changeSort('created_at')}>
                    <div className="flex justify-center gap-1">
                      Créé {sort==='created_at' && (dir==='asc'?'▲':'▼')}
                    </div>
                  </th>
                  <th className="px-4 py-3 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {products.data.length===0 ? (
                  <tr>
                    <td colSpan={8} className="px-4 py-8 text-center text-gray-500">
                      Aucun produit trouvé.
                    </td>
                  </tr>
                ) : products.data.map(p=>(
                  <tr key={p.id} className={`${p.deleted_at?'bg-red-50':''} hover:bg-gray-50`}>
                    <td className="px-4 py-3 text-center">
                      <input type="checkbox" checked={selectedIds.includes(p.id)}
                             onChange={()=>toggleSelect(p.id)}
                             className="rounded border-gray-300 text-indigo-600"/>
                    </td>
                    <td className="px-4 py-3 font-medium">{p.name}</td>
                    <td className="px-4 py-3 text-gray-500">{p.category?.name}</td>
                    <td className="px-4 py-3">{p.price} {p.currency?.symbol}</td>
                    <td className="px-4 py-3 text-center">{p.stock_quantity}</td>
                    <td className="px-4 py-3 text-center">
                      {p.deleted_at
                        ? <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">Désactivé</span>
                        : <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">Actif</span>}
                    </td>
                    <td className="px-4 py-3 text-center">
                      {new Date(p.created_at!).toLocaleDateString('fr-FR',{day:'2-digit',month:'2-digit',year:'numeric'})}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <div className="flex justify-center gap-2">
                        {p.deleted_at ? (
                          <button onClick={()=>router.post(route('products.restore',{id:p.id}),{},inertiaOpts)}
                                  className="text-gray-600 hover:text-gray-900"><RotateCcw className="w-5 h-5"/></button>
                        ) : (
                          <>
                            <Link href={route('products.show',p.id)}
                                  className="text-blue-600 hover:text-blue-900"><Eye className="w-5 h-5"/></Link>
                            <Link href={route('products.edit',p.id)}
                                  className="text-yellow-600 hover:text-yellow-900"><Pencil className="w-5 h-5"/></Link>
                            <button onClick={()=>router.delete(route('products.destroy',{id:p.id}),inertiaOpts)}
                                    className="text-red-600 hover:text-red-900"><Trash2 className="w-5 h-5"/></button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* ---------------- pagination ----------------------------- */}
          <div className="flex justify-between items-center px-6 py-4 bg-gray-50 border-t border-gray-200 mt-4 rounded-lg shadow-sm text-sm text-gray-600">
            <span>
              Affichage de {products.from} à {products.to} sur {products.total} résultats
            </span>

            {products.last_page>1 && (
              <div className="flex items-center gap-1">
                <Button size="sm" variant="outline" aria-label="Première page"
                        disabled={products.current_page===1} onClick={()=>changePage(1)}>
                  <ChevronsLeft className="w-4 h-4"/>
                </Button>
                <Button size="sm" variant="outline" aria-label="Page précédente"
                        disabled={products.current_page===1} onClick={()=>changePage(products.current_page-1)}>
                  <ChevronLeft className="w-4 h-4"/>
                </Button>

                {windowPages.map((p,idx)=>
                  p==='…'?<span key={idx} className="px-2 select-none">…</span>:(
                    <Button key={p} size="sm"
                            variant={p===products.current_page?'default':'outline'}
                            onClick={()=>changePage(p as number)}>{p}</Button>
                  )
                )}

                <Button size="sm" variant="outline" aria-label="Page suivante"
                        disabled={products.current_page===products.last_page}
                        onClick={()=>changePage(products.current_page+1)}>
                  <ChevronRight className="w-4 h-4"/>
                </Button>
                <Button size="sm" variant="outline" aria-label="Dernière page"
                        disabled={products.current_page===products.last_page}
                        onClick={()=>changePage(products.last_page)}>
                  <ChevronsRight className="w-4 h-4"/>
                </Button>
              </div>
            )}
          </div>

        </div>
      </AppLayout>
    </>
  );
}
