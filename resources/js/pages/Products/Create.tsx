import React, { useEffect, useState } from 'react'
import { Head, useForm } from '@inertiajs/react'
import { route } from 'ziggy-js'
import { Info, UploadCloud, X } from 'lucide-react'
import { motion } from 'framer-motion'
import axios from 'axios'

import AppLayout from '@/layouts/app-layout'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select'
import DynamicFields from './Partials/DynamicFields'
import CompatibilityFields from './Partials/CompatibilityFields'

import type { PageProps, Category, Currency, TaxRate } from '@/types'

/* ------------------------------------------------------------------ */
/* Types                                                              */
/* ------------------------------------------------------------------ */
type SpecializedData = Record<string, any>

type CompatibilityEntry = {
  compatible_with_id: string
  direction?: 'bidirectional' | 'uni'
  note?: string
}

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
  category_id: number | ''
  is_active: boolean
  images: File[]
  primary_image_index: number
  spec: SpecializedData
  compatibilities: CompatibilityEntry[]
}

interface Props extends PageProps<{
  brands: { id: number; name: string }[]
  categories: Category[]
  currencies: Currency[]
  taxRates: TaxRate[]
}> {}

/* ------------------------------------------------------------------ */
/* Component                                                          */
/* ------------------------------------------------------------------ */
export default function CreateProduct({ brands, categories, currencies, taxRates }: Props) {
  const { data, setData, post, processing, errors } = useForm<FormData>({
    brand_id: '',
    name: '',
    model: '',
    sku: '',
    description: '',
    price: '',
    stock_quantity: 0,
    currency_code: currencies[0]?.code ?? '',
    tax_rate_id: taxRates[0]?.id ?? 0,
    category_id: '',
    is_active: true,
    images: [],
    primary_image_index: 0,
    spec: {},
    compatibilities: [],
  })

  const [previews, setPreviews] = useState<string[]>([])
  useEffect(() => {
    const urls = data.images.map(f => URL.createObjectURL(f))
    setPreviews(urls)
    return () => urls.forEach(URL.revokeObjectURL)
  }, [data.images])

  const [allProducts, setAllProducts] = useState<{ id:string; name:string }[]>([])
  useEffect(() => {
    axios.get(route('products.compatible-list')).then(res => setAllProducts(res.data))
  }, [])

  const handleFiles = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return
    const files = Array.from(e.target.files).slice(0, 7)
    setData('images', files)
    setData('primary_image_index', 0)
  }

  const removeImage = (idx:number) => {
    const imgs = data.images.filter((_, i) => i !== idx)
    setData('images', imgs)
    setData('primary_image_index', Math.min(data.primary_image_index, imgs.length - 1))
  }

  const choosePrimary = (idx:number) => setData('primary_image_index', idx)

  const setSpecField = (field:string, value:any) =>
    setData('spec', { ...(data.spec ?? {}), [field]: value })

  const setCompatibilities = (list:CompatibilityEntry[]) =>
    setData('compatibilities', list)

  const currentCategory = categories.find(c => c.id === data.category_id)
  const currentSlug = currentCategory?.slug ?? ''
  const machineSlugs = ['servers', 'desktops', 'laptops']
  const showCompat = currentSlug && !machineSlugs.includes(currentSlug)

  const handleSubmit = (e:React.FormEvent) => {
    e.preventDefault()
    post(route('products.store'), {
      forceFormData: true,
      onError: () => window.scrollTo({ top: 0, behavior: 'smooth' })
    })
  }

  return (
    <AppLayout breadcrumbs={[{ title:'Produits', href:'/products' }, { title:'Créer' }]}>
      <Head title="Créer un produit" />

      <div className="grid grid-cols-12 gap-6 p-6">
        <form onSubmit={handleSubmit} className="lg:col-span-8 xl:col-span-7 p-6 space-y-6 bg-white rounded-lg shadow-sm">
          <h1 className="text-2xl font-semibold">Créer un produit</h1>

          {Object.keys(errors).length > 0 && (
            <div className="p-4 bg-red-100 text-red-700 rounded">
              <strong>Erreur(s) dans le formulaire :</strong>
              <ul className="list-disc list-inside mt-2 text-sm">
                {Object.entries(errors).map(([field, message]) => (
                  <li key={field}>{message}</li>
                ))}
              </ul>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Select value={data.brand_id} onValueChange={v => setData('brand_id', v)}>
              <SelectTrigger><SelectValue placeholder="Marque" /></SelectTrigger>
              <SelectContent>
                {brands.map(b => <SelectItem key={b.id} value={String(b.id)}>{b.name}</SelectItem>)}
              </SelectContent>
            </Select>
            <Input placeholder="Modèle" value={data.model} onChange={e => setData('model', e.target.value)} />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input placeholder="Nom" required value={data.name} onChange={e => setData('name', e.target.value)} />
            <Input placeholder="SKU" required value={data.sku} onChange={e => setData('sku', e.target.value)} />
          </div>

          <Textarea placeholder="Description" value={data.description} onChange={e => setData('description', e.target.value)} />

          <Select value={String(data.category_id)} onValueChange={v => setData('category_id', Number(v))}>
            <SelectTrigger><SelectValue placeholder="Catégorie" /></SelectTrigger>
            <SelectContent>
              {categories.map(c => <SelectItem key={c.id} value={String(c.id)}>{c.name}</SelectItem>)}
            </SelectContent>
          </Select>

          {currentSlug && (
            <DynamicFields slug={currentSlug as any} data={data.spec} setData={setSpecField} errors={errors.spec ?? {}} />
          )}

          {showCompat && (
            <CompatibilityFields compatibilities={data.compatibilities} allProducts={allProducts} onChange={setCompatibilities} />
          )}

          <label className="cursor-pointer flex flex-col items-center justify-center py-8 border-2 border-dashed rounded-lg bg-gray-50 text-center">
            <UploadCloud className="h-6 w-6 text-gray-400 mb-2" />
            <p className="text-sm text-gray-500">Cliquez ou déposez vos images ici (max. 7)</p>
            <input type="file" multiple className="hidden" onChange={handleFiles} />
          </label>

          <motion.div layout className="grid grid-cols-3 gap-4">
            {previews.map((src, i) => (
              <motion.div layout key={i} className="relative">
                <img src={src} className="h-32 w-full object-cover rounded-lg" />
                <Button variant="ghost" size="icon" className="absolute top-1 right-1" onClick={() => removeImage(i)}><X /></Button>
                <Button type="button" onClick={() => choosePrimary(i)} className={`absolute bottom-1 left-1 px-2 py-0.5 text-xs rounded ${data.primary_image_index === i ? 'bg-blue-600 text-white' : 'bg-white text-gray-600'}`}>
                  {data.primary_image_index === i ? 'Principale' : 'Choisir'}
                </Button>
              </motion.div>
            ))}
          </motion.div>

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

          <div className="flex justify-between">
            <Button type="button" onClick={() => history.back()} variant="secondary">Annuler</Button>
            <Button type="submit" disabled={processing}>{processing ? 'Création…' : 'Créer le produit'}</Button>
          </div>
        </form>

        <aside className="lg:col-span-4 xl:col-span-5 p-6 bg-white rounded-lg shadow-sm space-y-6">
          <div className="space-y-4">
            <h2 className="text-lg font-medium">Guide de création</h2>
            <p className="text-gray-600">Commencez par remplir les informations de base du produit. Une fois la catégorie sélectionnée, des champs spécialisés apparaîtront automatiquement.</p>
          </div>

          {currentCategory && (
            <div className="space-y-4 border-t pt-6">
              <h3 className="font-medium">À propos de la catégorie : {currentCategory.name}</h3>
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
