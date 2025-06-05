import React, { useEffect, useState } from 'react'
import { Head, useForm, router } from '@inertiajs/react'
import { route } from 'ziggy-js'
import axios from 'axios'
import { Info, UploadCloud, X, Trash2 } from 'lucide-react'
import { motion } from 'framer-motion'

import AppLayout from '@/layouts/app-layout'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select'
import DynamicFields from './Partials/DynamicFields'
import CompatibilityFields, { CompatibilityEntry } from './Partials/CompatibilityFields'

import type {
  PageProps, Category, Currency, TaxRate,
  Product, ProductImage,
} from '@/types'

/* ------------------------------------------------------------------ */
/* Types & helpers                                                    */
/* ------------------------------------------------------------------ */
interface FormData {
  brand_id: string
  name: string
  model: string
  sku: string
  description: string
  price: string
  stock_quantity: number
  currency_code: string
  tax_rate_id: number
  category_id: number
  is_active: boolean

  images: File[]
  primary_image_index: number
  deleted_image_ids: number[]
  restored_image_ids: number[]

  compatibilities: CompatibilityEntry[]
  spec: Record<string, any>
}

interface Props extends PageProps<{
  product: Product & { images: ProductImage[] }
  brands: { id: number; name: string }[]
  categories: Category[]
  currencies: Currency[]
  taxRates: TaxRate[]
  compatibilities: CompatibilityEntry[]
}> {}

/* ------------------------------------------------------------------ */
/* Component                                                          */
/* ------------------------------------------------------------------ */
export default function EditProduct({
  product,
  brands,
  categories,
  currencies,
  taxRates,
  compatibilities: initialCompat,
}: Props) {
  /* ------------ Catégorie & slug courant ------------------------- */
  const currentCat = categories.find(c => c.id === product.category?.id)
  const currentSlug = currentCat?.slug ?? ''

  /* ------------ donne accès au singulier (graphic_card, etc.) ----- */
  const singularSlug = currentSlug.endsWith('ies')
    ? currentSlug.slice(0, -3) + 'y'
    : currentSlug.endsWith('s')
      ? currentSlug.slice(0, -1)
      : currentSlug

  const initialSpec =
    (product as any)[currentSlug] ?? (product as any)[singularSlug] ?? {}

  /* ------------ useForm ------------------------------------------ */
  const firstPrimary = Math.max(0, product.images.findIndex(i => i.is_primary))

  const { data, setData, processing, errors } = useForm<FormData>({
    brand_id: String(product.brand?.id ?? ''),
    name: product.name,
    model: product.model ?? '',
    sku: product.sku,
    description: product.description ?? '',
    price: product.price.toString(),
    stock_quantity: product.stock_quantity,
    currency_code: product.currency?.code ?? currencies[0]?.code ?? '',
    tax_rate_id: product.tax_rate?.id ?? taxRates[0]?.id ?? 0,
    category_id: product.category?.id ?? 0,
    is_active: !product.deleted_at,
    images: [],
    primary_image_index: firstPrimary,
    deleted_image_ids: [],
    restored_image_ids: [],
    compatibilities: initialCompat,
    spec: initialSpec,
  })

  /* ------------ Slug machine & affichage compat ------------------ */
  const machineSlugs = ['servers', 'desktops', 'laptops']
  const showCompat = currentSlug && !machineSlugs.includes(currentSlug)

  /* ------------ Liste produits cible ----------------------------- */
  const [allProducts, setAllProducts] = useState<{ id: string; name: string }[]>([])
  useEffect(() => {
    axios.get(route('products.compatible-list')).then(r => setAllProducts(r.data))
  }, [])

  /* ------------ Gestion images ----------------------------------- */
  const [previews, setPreviews] = useState<string[]>([])
  const [existing, setExisting] = useState<ProductImage[]>(product.images)

  useEffect(() => () => previews.forEach(URL.revokeObjectURL), [previews])

  const addFiles = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return
    const files = Array.from(e.target.files).slice(0, 7)
    setData('images', [...data.images, ...files])
    setPreviews(p => [...p, ...files.map(f => URL.createObjectURL(f))])
  }

  const removePreview = (idx: number) => {
    setData('images', data.images.filter((_, i) => i !== idx))
    setPreviews(previews.filter((_, i) => i !== idx))
    if (data.primary_image_index === idx) setData('primary_image_index', 0)
    else if (data.primary_image_index > idx)
      setData('primary_image_index', data.primary_image_index - 1)
  }

  const toggleExisting = (id: number) => {
    const isDeleted = data.deleted_image_ids.includes(id)
    if (isDeleted) {
      setData('deleted_image_ids', data.deleted_image_ids.filter(i => i !== id))
      setData('restored_image_ids', [...data.restored_image_ids, id])
      setExisting(imgs => imgs.map(img => img.id === id ? { ...img, deleted_at: null } : img))
    } else {
      setData('deleted_image_ids', [...data.deleted_image_ids, id])
      setData('restored_image_ids', data.restored_image_ids.filter(i => i !== id))
      setExisting(imgs => imgs.map(img => img.id === id ? { ...img, deleted_at: '1' } : img))
    }
  }

  const setPrimary = (globalIdx: number) => setData('primary_image_index', globalIdx)

  /* ------------ Champs dynamiques / compat ------------------------ */
  const setSpecField = (field: string, value: any) =>
    setData('spec', { ...(data.spec ?? {}), [field]: value })

  const setCompat = (list: CompatibilityEntry[]) => {
    setData('compatibilities', list)
  }

  /* ------------ Submit ------------------------------------------- */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      await router.post(
        route('products.update', product.id),
        { ...data, _method: 'PATCH' },
        {
          forceFormData: true,
          preserveScroll: true, // Keep scroll position
          preserveState: true   // Keep form state
        }
      )
    } catch (error) {
      console.error('Error updating product:', error)
    }
  }

  /* ---------------------------------------------------------------- */
  /* Render                                                           */
  /* ---------------------------------------------------------------- */
  return (
    <AppLayout breadcrumbs={[
      { title: 'Produits', href: '/products' },
      { title: product.name, href: route('products.show', product.id) },
      { title: 'Modifier' },
    ]}>
      <Head title={`Modifier — ${product.name}`} />

      <div className="grid grid-cols-12 gap-6 p-6">
        {/* ------------------ Formulaire --------------------------- */}
        <form
          onSubmit={handleSubmit}
          className="lg:col-span-8 xl:col-span-7 p-6 space-y-6 bg-white rounded-lg shadow-sm"
        >
          <h1 className="text-2xl font-semibold">Modifier le produit</h1>

          {/* Marque + Modèle */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Select value={data.brand_id} onValueChange={v => setData('brand_id', v)}>
              <SelectTrigger><SelectValue placeholder="Marque" /></SelectTrigger>
              <SelectContent>
                {brands.map(b => <SelectItem key={b.id} value={String(b.id)}>{b.name}</SelectItem>)}
              </SelectContent>
            </Select>
            <Input placeholder="Modèle" value={data.model} onChange={e => setData('model', e.target.value)} />
          </div>

          {/* Nom + SKU */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input placeholder="Nom" required value={data.name} onChange={e => setData('name', e.target.value)} />
            <Input placeholder="SKU" required value={data.sku} onChange={e => setData('sku', e.target.value)} />
          </div>

          {/* Description */}
          <Textarea placeholder="Description" value={data.description} onChange={e => setData('description', e.target.value)} />

          {/* Catégorie (lecture seule) */}
          <Select value={String(data.category_id)} disabled>
            <SelectTrigger><SelectValue placeholder="Catégorie" /></SelectTrigger>
            <SelectContent>
              {categories.map(c => <SelectItem key={c.id} value={String(c.id)}>{c.name}</SelectItem>)}
            </SelectContent>
          </Select>

          {/* Champs spécialisés */}
          {currentSlug && (
            <DynamicFields
              slug={currentSlug as any}
              data={data.spec}
              setData={setSpecField}
              errors={errors.spec ?? {}}
            />
          )}

          {/* Compatibilités (invisible pour Desktop/Laptop/Server) */}
          {showCompat && (
            <CompatibilityFields
              compatibilities={data.compatibilities}
              allProducts={allProducts}
              onChange={setCompat}
            />
          )}

          {/* Upload images */}
          <label className="cursor-pointer flex justify-center items-center py-8 border-2 border-dashed rounded-lg">
            <UploadCloud className="h-6 w-6 text-gray-400" />
            <input type="file" multiple className="hidden" onChange={addFiles} />
          </label>

          {/* Pré-vues nouvelles */}
          {previews.length > 0 && (
            <motion.div layout className="grid grid-cols-3 gap-4">
              {previews.map((src, i) => (
                <motion.div layout key={`new-${i}`} className="relative">
                  <img src={src} className="h-32 w-full object-cover rounded-lg" />
                  <Button type="button" size="icon" variant="ghost" className="absolute top-1 right-1" onClick={() => removePreview(i)}><X /></Button>
                  <Button type="button" onClick={() => setPrimary(i)} className={`absolute bottom-1 left-1 px-2 py-0.5 text-xs rounded ${data.primary_image_index === i ? 'bg-blue-600 text-white' : 'bg-white text-gray-600'}`}>
                    {data.primary_image_index === i ? 'Principale' : 'Choisir'}
                  </Button>
                </motion.div>
              ))}
            </motion.div>
          )}

          {/* Images existantes */}
          {existing.length > 0 && (
            <>
              <h3 className="text-sm font-medium">Images existantes</h3>
              <motion.div layout className="grid grid-cols-3 gap-4">
                {existing.map((img, idx) => {
                  const globalIdx = previews.length + idx
                  const isDel = !!img.deleted_at
                  return (
                    <motion.div layout key={img.id} className={`relative border rounded-lg overflow-hidden ${isDel ? 'opacity-60 border-red-400' : 'border-gray-300'}`}>
                      <img src={`/storage/${img.path}`} className="h-32 w-full object-cover" />
                      <Button type="button" size="icon" variant="ghost" className={`absolute top-1 right-1 ${isDel ? 'text-green-600' : 'text-red-600'}`} onClick={() => toggleExisting(img.id)}>{isDel ? <X /> : <Trash2 />}</Button>
                      <Button type="button" onClick={() => setPrimary(globalIdx)} className={`absolute bottom-1 left-1 px-2 py-0.5 text-xs rounded ${data.primary_image_index === globalIdx ? 'bg-blue-600 text-white' : 'bg-white text-gray-600'}`}>
                        {data.primary_image_index === globalIdx ? 'Principale' : 'Choisir'}
                      </Button>
                    </motion.div>
                  )
                })}
              </motion.div>
            </>
          )}

          {/* Prix / devise / TVA */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Input type="number" step="0.01" placeholder="Prix" required value={data.price} onChange={e => setData('price', e.target.value)} />
            <Select value={data.currency_code} onValueChange={v => setData('currency_code', v)}>
              <SelectTrigger><SelectValue placeholder="Devise" /></SelectTrigger>
              <SelectContent>
                {currencies.map(c => <SelectItem key={c.code} value={c.code}>{c.symbol} ({c.code})</SelectItem>)}
              </SelectContent>
            </Select>
            <Select value={String(data.tax_rate_id)} onValueChange={v => setData('tax_rate_id', Number(v))}>
              <SelectTrigger><SelectValue placeholder="TVA" /></SelectTrigger>
              <SelectContent>
                {taxRates.map(t => <SelectItem key={t.id} value={String(t.id)}>{t.name} ({t.rate}%)</SelectItem>)}
              </SelectContent>
            </Select>
          </div>

          {/* Stock + actif */}
          <div className="flex items-center gap-6">
            <div className="flex items-center space-x-2">
              <label htmlFor="stock_quantity" className="text-sm text-gray-700">Stock</label>
              <Input id="stock_quantity" type="number" min={0} required value={data.stock_quantity} onChange={e => setData('stock_quantity', Number(e.target.value))} className="w-40" />
            </div>
            <label className="flex items-center space-x-2">
              <input type="checkbox" checked={data.is_active} onChange={e => setData('is_active', e.target.checked)} />
              <span className="text-sm">Activer</span>
            </label>
          </div>

          {/* Boutons */}
          <div className="flex justify-between">
            <Button type="button" onClick={() => history.back()} variant="secondary">Annuler</Button>
            <Button type="submit" disabled={processing}>{processing ? 'Sauvegarde…' : 'Enregistrer'}</Button>
          </div>
        </form>

        {/* ------------------ Aside ------------------------------- */}
        <aside className="lg:col-span-4 xl:col-span-5 p-6 bg-white rounded-lg shadow-sm space-y-6">
          <div className="space-y-4">
            <h2 className="text-lg font-medium">Guide d'édition</h2>
            <p className="text-gray-600">Modifiez les informations du produit puis enregistrez ; vous pourrez revenir en arrière.</p>
          </div>

          {currentCat && (
            <div className="space-y-4 border-t pt-6">
              <h3 className="font-medium">À propos de la catégorie : {currentCat.name}</h3>
              <div className="flex gap-2 items-start bg-blue-50 p-4 rounded-lg">
                <Info className="w-5 h-5 shrink-0 text-blue-600" />
                <div className="space-y-2 text-sm text-blue-900">
                  <p>Les champs spécialisés s'affichent en fonction de la catégorie sélectionnée.</p>
                  {showCompat && (
                    <p>Pour les composants, les compatibilités sont toujours unidirectionnelles vers les machines (serveurs, ordinateurs de bureau, portables).</p>
                  )}
                </div>
              </div>
            </div>
          )}
        </aside>
      </div>
    </AppLayout>
  )
}
