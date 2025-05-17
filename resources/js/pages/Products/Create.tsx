// resources/js/Pages/Products/Create.tsx
import React, { useState, useEffect } from 'react'
import { Head, useForm } from '@inertiajs/react'
import { Button } from '@/components/ui/button'
import AppLayout from '@/layouts/app-layout'
import { Info, ChevronDown, X } from 'lucide-react'
import { route } from 'ziggy-js'
import { PageProps, Category, Currency, TaxRate } from '@/types'

interface FormData {
  name: string
  sku: string
  description: string
  price: string
  stock_quantity: number
  currency_code: string
  tax_rate_id: number
  category_id: number
  is_active: boolean
  images?: File[]
  primary_image_index?: number
}

interface Props extends PageProps<{
  categories: Category[]
  currencies: Currency[]
  taxRates: TaxRate[]
}> {}

export default function CreateProduct({ categories, currencies, taxRates }: Props) {
  const { data, setData, post, processing, errors } = useForm<FormData>({
    name: '',
    sku: '',
    description: '',
    price: '',
    stock_quantity: 0,
    currency_code: currencies[0]?.code ?? '',
    tax_rate_id: taxRates[0]?.id ?? 0,
    category_id: categories[0]?.id ?? 0,
    is_active: true,
    images: [],
    primary_image_index: 0,
  })

  const [previews, setPreviews] = useState<string[]>([])

  useEffect(() => {
    if (!data.images) return
    const urls = data.images.map(file => URL.createObjectURL(file))
    setPreviews(urls)
    return () => urls.forEach(url => URL.revokeObjectURL(url))
  }, [data.images])

  function handleFiles(e: React.ChangeEvent<HTMLInputElement>) {
    if (!e.target.files) return
    const maxFiles = 7
    const filesArray = Array.from(e.target.files)

    if (filesArray.length > maxFiles) {
      alert(`Vous ne pouvez importer que ${maxFiles} images maximum.`)
    }

    const limitedFiles = filesArray.slice(0, maxFiles)
    setData('images', limitedFiles)
    setData('primary_image_index', 0)
  }

  function choosePrimary(idx: number) {
    setData('primary_image_index', idx)
  }

  function removeImage(idx: number) {
    const imgs = (data.images ?? []).slice()
    imgs.splice(idx, 1)
    setData('images', imgs)
    if ((data.primary_image_index ?? 0) >= imgs.length) {
      setData('primary_image_index', imgs.length - 1)
    }
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    post(route('products.store'))
  }

  return (
    <>
      <Head title="Créer un produit" />
      <AppLayout
        breadcrumbs={[
          { title: 'Dashboard', href: '/dashboard' },
          { title: 'Produits', href: '/products' },
          { title: 'Créer', href: '/products/create' },
        ]}
      >
        <div className="grid grid-cols-12 gap-6 p-6">
          {/* Formulaire */}
          <div className="col-span-12 lg:col-span-8 xl:col-span-7">
            <div className="bg-white rounded-lg shadow-sm p-6 space-y-6">
              <h1 className="text-xl font-semibold">Nouveau produit</h1>
              <form onSubmit={handleSubmit} className="space-y-6">

                {/* Nom & SKU */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Nom<span className="text-red-600">*</span>
                    </label>
                    <input
                      type="text"
                      value={data.name}
                      onChange={e => setData('name', e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm sm:text-sm focus:ring-blue-500 focus:border-blue-500"
                      required
                    />
                    {errors.name && <p className="mt-1 text-sm text-red-600">{errors.name}</p>}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      SKU<span className="text-red-600">*</span>
                    </label>
                    <input
                      type="text"
                      value={data.sku}
                      onChange={e => setData('sku', e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm sm:text-sm focus:ring-blue-500 focus:border-blue-500"
                      required
                    />
                    {errors.sku && <p className="mt-1 text-sm text-red-600">{errors.sku}</p>}
                  </div>
                </div>

                {/* Description */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                  <textarea
                    rows={4}
                    value={data.description}
                    onChange={e => setData('description', e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm sm:text-sm focus:ring-blue-500 focus:border-blue-500"
                  />
                  {errors.description && <p className="mt-1 text-sm text-red-600">{errors.description}</p>}
                </div>

                {/* Catégorie */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Catégorie</label>
                  <div className="relative">
                    <select
                      value={data.category_id}
                      onChange={e => setData('category_id', Number(e.target.value))}
                      className="w-full appearance-none px-4 py-3 pr-10 border border-gray-300 rounded-lg shadow-sm sm:text-sm focus:ring-blue-500 focus:border-blue-500"
                    >
                      {categories.map(c => (
                        <option key={c.id} value={c.id}>{c.name}</option>
                      ))}
                    </select>
                    <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3">
                      <ChevronDown className="h-4 w-4 text-gray-500" />
                    </div>
                  </div>
                  {errors.category_id && <p className="mt-1 text-sm text-red-600">{errors.category_id}</p>}
                </div>

                {/* Prix / Devise / TVA */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Prix<span className="text-red-600">*</span>
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      value={data.price}
                      onChange={e => setData('price', e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm sm:text-sm focus:ring-blue-500 focus:border-blue-500"
                      required
                    />
                    {errors.price && <p className="mt-1 text-sm text-red-600">{errors.price}</p>}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Devise</label>
                    <div className="relative">
                      <select
                        value={data.currency_code}
                        onChange={e => setData('currency_code', e.target.value)}
                        className="w-full appearance-none px-4 py-3 pr-10 border border-gray-300 rounded-lg shadow-sm sm:text-sm focus:ring-blue-500 focus:border-blue-500"
                      >
                        {currencies.map(c => (
                          <option key={c.code} value={c.code}>
                            {c.symbol} ({c.code})
                          </option>
                        ))}
                      </select>
                      <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3">
                        <ChevronDown className="h-4 w-4 text-gray-500" />
                      </div>
                    </div>
                    {errors.currency_code && <p className="mt-1 text-sm text-red-600">{errors.currency_code}</p>}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">TVA</label>
                    <div className="relative">
                      <select
                        value={data.tax_rate_id}
                        onChange={e => setData('tax_rate_id', Number(e.target.value))}
                        className="w-full appearance-none px-4 py-3 pr-10 border border-gray-300 rounded-lg shadow-sm sm:text-sm focus:ring-blue-500 focus:border-blue-500"
                      >
                        {taxRates.map(t => (
                          <option key={t.id} value={t.id}>
                            {t.name} ({t.rate}%)
                          </option>
                        ))}
                      </select>
                      <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3">
                        <ChevronDown className="h-4 w-4 text-gray-500" />
                      </div>
                    </div>
                    {errors.tax_rate_id && <p className="mt-1 text-sm text-red-600">{errors.tax_rate_id}</p>}
                  </div>
                </div>

                {/* Upload d’images avec limite et message */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Images <span className="text-gray-500 text-xs">(max. 7 fichiers)</span>
                  </label>
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handleFiles}
                    id="product-images"
                    className="hidden"
                  />
                  <label
                    htmlFor="product-images"
                    className="flex justify-center items-center px-4 py-6 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-gray-400"
                  >
                    <span className="text-gray-500">
                      Cliquez ou déposez vos images ici (max. 7 fichiers)
                    </span>
                  </label>
                  <p className="mt-1 text-xs text-gray-500">
                    Formats acceptés : JPG, PNG, WEBP. Taille max. 2 Mo par image.
                  </p>
                  {errors.images && (
                    <p className="mt-1 text-sm text-red-600">{errors.images}</p>
                  )}
                </div>

                {/* Aperçu des thumbnails */}
                {previews.length > 0 && (
                  <div className="grid grid-cols-3 gap-4">
                    {previews.map((src, idx) => (
                      <div key={idx} className="relative group">
                        <img
                          src={src}
                          alt={`Preview ${idx + 1}`}
                          className={`object-cover w-full h-32 rounded-lg border ${
                            data.primary_image_index === idx
                              ? 'border-blue-500'
                              : 'border-gray-200'
                          }`}
                        />
                        <button
                          type="button"
                          onClick={() => removeImage(idx)}
                          className="absolute top-1 right-1 bg-white rounded-full p-1 shadow hover:bg-gray-100"
                        >
                          <X className="w-4 h-4 text-gray-600" />
                        </button>
                        <button
                          type="button"
                          onClick={() => choosePrimary(idx)}
                          className={`absolute bottom-1 left-1 px-2 py-0.5 text-xs rounded-full ${
                            data.primary_image_index === idx
                              ? 'bg-blue-600 text-white'
                              : 'bg-white text-gray-600'
                          } border`}
                        >
                          {data.primary_image_index === idx ? 'Principale' : 'Définir principale'}
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                {/* Stock & Statut */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Stock<span className="text-red-600">*</span>
                    </label>
                    <input
                      type="number"
                      min={0}
                      value={data.stock_quantity}
                      onChange={e => setData('stock_quantity', Number(e.target.value))}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm sm:text-sm focus:ring-blue-500 focus:border-blue-500"
                      required
                    />
                    {errors.stock_quantity && <p className="mt-1 text-sm text-red-600">{errors.stock_quantity}</p>}
                  </div>
                  <div className="flex items-center mt-6">
                    <input
                      id="is_active"
                      type="checkbox"
                      checked={data.is_active}
                      onChange={e => setData('is_active', e.target.checked)}
                      className="h-4 w-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
                    />
                    <label htmlFor="is_active" className="ml-2 block text-sm text-gray-700">
                      Activer le produit
                    </label>
                    {errors.is_active && <p className="mt-1 text-sm text-red-600">{errors.is_active}</p>}
                  </div>
                </div>

                {/* Boutons */}
                <div className="flex justify-between">
                  <Button
                    type="button"
                    onClick={() => history.back()}
                    className="bg-gray-300 text-gray-800 hover:bg-gray-400 px-6 py-3 rounded-md"
                  >
                    Annuler
                  </Button>
                  <Button
                    type="submit"
                    disabled={processing}
                    className="bg-gray-600 text-white hover:bg-gray-700 px-6 py-3 rounded-md"
                  >
                    {processing ? 'Création…' : 'Créer le produit'}
                  </Button>
                </div>

              </form>
            </div>
          </div>

          {/* Aide */}
          <div className="col-span-12 lg:col-span-4 xl:col-span-5">
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-lg font-medium mb-4">À propos des produits</h2>
              <div className="prose max-w-none">
                <p className="text-gray-600">
                  Remplissez le formulaire pour ajouter un nouveau produit à votre catalogue.
                </p>
                <div className="mt-4 p-4 bg-blue-50 rounded-md border border-blue-100 flex gap-3">
                  <Info className="w-5 h-5 text-blue-600 mt-0.5" />
                  <p className="text-sm text-blue-700">
                    Vous pourrez modifier ou désactiver ce produit ultérieurement depuis la liste.
                  </p>
                </div>
              </div>
            </div>
          </div>

        </div>
      </AppLayout>
    </>
  )
}
