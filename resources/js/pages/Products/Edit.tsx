// resources/js/Pages/Products/Edit.tsx
import React, { useState, useEffect } from 'react'
import { Head, useForm, Link, router } from '@inertiajs/react'
import { Button } from '@/components/ui/button'
import AppLayout from '@/layouts/app-layout'
import { X, Trash2 } from 'lucide-react'
import { route } from 'ziggy-js'
import { PageProps, Category, Currency, TaxRate, Product, ProductImage } from '@/types'

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
  images: File[]
  deleted_image_ids: number[]
  restored_image_ids: number[]
  primary_image_index: number
}

interface Props extends PageProps<{
  product: Product & { images: ProductImage[] }
  categories: Category[]
  currencies: Currency[]
  taxRates: TaxRate[]
}> {}

export default function EditProduct({ product, categories, currencies, taxRates }: Props) {
  const { data, setData, patch, processing, errors } = useForm<FormData>({
    name: product.name,
    sku: product.sku,
    description: product.description ?? '',
    price: product.price.toString(),
    stock_quantity: product.stock_quantity,
    currency_code: product.currency_code ?? (currencies[0]?.code ?? ''),
    tax_rate_id: product.tax_rate_id ?? (taxRates[0]?.id ?? 0),
    category_id: product.category_id ?? (categories[0]?.id ?? 0),
    is_active: !product.deleted_at,
    images: [],
    deleted_image_ids: [],
    restored_image_ids: [],
    primary_image_index: product.images.findIndex(img => img.is_primary) ?? 0,
  })

  const [previewImages, setPreviewImages] = useState<string[]>([])
  const [existingImages, setExistingImages] = useState<ProductImage[]>(product.images)

  useEffect(() => {
    return () => {
      previewImages.forEach(url => URL.revokeObjectURL(url))
    }
  }, [previewImages])

  function onImageChange(e: React.ChangeEvent<HTMLInputElement>) {
    if (!e.target.files) return
    const filesArray = Array.from(e.target.files)
    setData('images', [...data.images, ...filesArray])

    const newPreviews = filesArray.map(file => URL.createObjectURL(file))
    setPreviewImages(prev => [...prev, ...newPreviews])
  }

  function removePreviewImage(index: number) {
    setData('images', data.images.filter((_, i) => i !== index))
    setPreviewImages(previewImages.filter((_, i) => i !== index))

    // Ajuster primary_image_index si nécessaire
    if (data.primary_image_index === index) {
      setData('primary_image_index', 0)
    } else if (data.primary_image_index > index) {
      setData('primary_image_index', data.primary_image_index - 1)
    }
  }

  function toggleExistingImage(imageId: number) {
    const isDeleted = data.deleted_image_ids.includes(imageId)
    if (isDeleted) {
      // Restaurer
      setData('deleted_image_ids', data.deleted_image_ids.filter(id => id !== imageId))
      setData('restored_image_ids', [...data.restored_image_ids, imageId])
      setExistingImages(prev => prev.map(img => img.id === imageId ? { ...img, deleted_at: null } : img))
    } else {
      // Supprimer
      setData('deleted_image_ids', [...data.deleted_image_ids, imageId])
      setData('restored_image_ids', data.restored_image_ids.filter(id => id !== imageId))
      setExistingImages(prev => prev.map(img => img.id === imageId ? { ...img, deleted_at: new Date().toISOString() } : img))
    }
  }

  function setPrimary(index: number) {
    setData('primary_image_index', index)
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    patch(route('products.update', product.id), {
      onSuccess: () => router.visit(route('products.show', product.id))
    })
  }

  return (
    <>
      <Head title={`Modifier produit — ${product.name}`} />
      <AppLayout
        breadcrumbs={[
          { title: 'Dashboard', href: '/dashboard' },
          { title: 'Produits', href: '/products' },
          { title: product.name, href: route('products.show', product.id) },
          { title: 'Modifier', href: route('products.edit', product.id) },
        ]}
      >
        <div className="p-6 grid grid-cols-12 gap-6">
          {/* Formulaire gauche */}
          <div className="col-span-12 lg:col-span-8 xl:col-span-7 bg-white rounded-lg shadow-sm p-6">
            <h1 className="text-xl font-semibold mb-6">Modifier le produit</h1>
            <form onSubmit={handleSubmit} className="space-y-6">

              {/* Nom et SKU */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Nom <span className="text-red-600">*</span>
                  </label>
                  <input
                    type="text"
                    value={data.name}
                    onChange={e => setData('name', e.target.value)}
                    className="w-full border border-gray-300 rounded-lg px-4 py-3 shadow-sm focus:ring focus:ring-blue-500 focus:border-blue-500"
                    required
                  />
                  {errors.name && <p className="text-sm text-red-600 mt-1">{errors.name}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    SKU <span className="text-red-600">*</span>
                  </label>
                  <input
                    type="text"
                    value={data.sku}
                    onChange={e => setData('sku', e.target.value)}
                    className="w-full border border-gray-300 rounded-lg px-4 py-3 shadow-sm focus:ring focus:ring-blue-500 focus:border-blue-500"
                    required
                  />
                  {errors.sku && <p className="text-sm text-red-600 mt-1">{errors.sku}</p>}
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea
                  rows={4}
                  value={data.description}
                  onChange={e => setData('description', e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-4 py-3 shadow-sm focus:ring focus:ring-blue-500 focus:border-blue-500"
                />
                {errors.description && <p className="text-sm text-red-600 mt-1">{errors.description}</p>}
              </div>

              {/* Catégorie */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Catégorie</label>
                <select
                  value={data.category_id}
                  onChange={e => setData('category_id', Number(e.target.value))}
                  className="w-full border border-gray-300 rounded-lg px-4 py-3 shadow-sm focus:ring focus:ring-blue-500 focus:border-blue-500"
                >
                  {categories.map(c => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
                {errors.category_id && <p className="text-sm text-red-600 mt-1">{errors.category_id}</p>}
              </div>

              {/* Prix, devise, TVA */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Prix <span className="text-red-600">*</span>
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={data.price}
                    onChange={e => setData('price', e.target.value)}
                    className="w-full border border-gray-300 rounded-lg px-4 py-3 shadow-sm focus:ring focus:ring-blue-500 focus:border-blue-500"
                    required
                  />
                  {errors.price && <p className="text-sm text-red-600 mt-1">{errors.price}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Devise</label>
                  <select
                    value={data.currency_code}
                    onChange={e => setData('currency_code', e.target.value)}
                    className="w-full border border-gray-300 rounded-lg px-4 py-3 shadow-sm focus:ring focus:ring-blue-500 focus:border-blue-500"
                  >
                    {currencies.map(c => (
                      <option key={c.code} value={c.code}>
                        {c.symbol} ({c.code})
                      </option>
                    ))}
                  </select>
                  {errors.currency_code && <p className="text-sm text-red-600 mt-1">{errors.currency_code}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">TVA</label>
                  <select
                    value={data.tax_rate_id}
                    onChange={e => setData('tax_rate_id', Number(e.target.value))}
                    className="w-full border border-gray-300 rounded-lg px-4 py-3 shadow-sm focus:ring focus:ring-blue-500 focus:border-blue-500"
                  >
                    {taxRates.map(t => (
                      <option key={t.id} value={t.id}>
                        {t.name} ({t.rate}%)
                      </option>
                    ))}
                  </select>
                  {errors.tax_rate_id && <p className="text-sm text-red-600 mt-1">{errors.tax_rate_id}</p>}
                </div>
              </div>

              {/* Stock & statut */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Stock <span className="text-red-600">*</span>
                  </label>
                  <input
                    type="number"
                    min={0}
                    value={data.stock_quantity}
                    onChange={e => setData('stock_quantity', Number(e.target.value))}
                    className="w-full border border-gray-300 rounded-lg px-4 py-3 shadow-sm focus:ring focus:ring-blue-500 focus:border-blue-500"
                    required
                  />
                  {errors.stock_quantity && <p className="text-sm text-red-600 mt-1">{errors.stock_quantity}</p>}
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
                  {errors.is_active && <p className="text-sm text-red-600 mt-1">{errors.is_active}</p>}
                </div>
              </div>

              {/* Boutons */}
              <div className="flex justify-between mt-6">
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
                  {processing ? 'Sauvegarde…' : 'Sauvegarder'}
                </Button>
              </div>

            </form>
          </div>

          {/* Galerie droite */}
          <div className="col-span-12 lg:col-span-4 xl:col-span-5 bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-lg font-medium mb-4">Galerie d'images</h2>

            {/* Upload d’images */}
            <div>
              <label
                htmlFor="product-images"
                className="flex justify-center items-center px-4 py-6 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-gray-400 mb-6"
              >
                <span className="text-gray-500">Cliquez ou déposez vos images ici</span>
              </label>
              <input
                type="file"
                accept="image/*"
                multiple
                onChange={onImageChange}
                id="product-images"
                className="hidden"
              />
            </div>

            {/* Preview des images uploadées */}
            {previewImages.length > 0 && (
              <div className="grid grid-cols-4 gap-3 mb-6">
                {previewImages.map((src, idx) => (
                  <div key={idx} className="relative rounded-lg overflow-hidden border border-gray-300 group">
                    <img
                      src={src}
                      alt={`Preview ${idx + 1}`}
                      className="w-full h-24 object-cover"
                    />
                    <button
                      type="button"
                      onClick={() => removePreviewImage(idx)}
                      className="absolute top-1 right-1 bg-red-600 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition"
                      aria-label="Supprimer cette image"
                    >
                      <X className="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => setPrimary(idx)}
                      className={`absolute bottom-1 left-1 bg-blue-600 text-white rounded-full px-2 py-0.5 text-xs ${
                        data.primary_image_index === idx ? 'opacity-100' : 'opacity-50 hover:opacity-80'
                      }`}
                      aria-label="Définir comme image principale"
                    >
                      Principale
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* Images existantes */}
            {existingImages.length > 0 && (
              <div>
                <h3 className="text-sm font-medium text-gray-700 mb-2">Images existantes</h3>
                <div className="grid grid-cols-4 gap-3">
                  {existingImages.map((img, idx) => {
                    const isDeleted = !!img.deleted_at
                    return (
                      <div
                        key={img.id}
                        className={`relative rounded-lg overflow-hidden border ${
                          isDeleted ? 'border-red-500 opacity-50' : 'border-gray-300'
                        } group`}
                      >
                        <img
                          src={`/storage/${img.path}`}
                          alt={`Image ${idx + 1}`}
                          className="w-full h-24 object-cover"
                        />
                        <button
                          type="button"
                          onClick={() => toggleExistingImage(img.id)}
                          className={`absolute top-1 right-1 rounded-full p-1 ${
                            isDeleted ? 'bg-green-600 text-white' : 'bg-red-600 text-white'
                          } opacity-0 group-hover:opacity-100 transition`}
                          aria-label={isDeleted ? 'Restaurer l’image' : 'Supprimer l’image'}
                        >
                          {isDeleted ? (
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="w-4 h-4">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h14M9 6h6m-7 8h8m-8 4h8" />
                            </svg>
                          ) : (
                            <Trash2 size={16} />
                          )}
                        </button>
                        <button
                          type="button"
                          onClick={() => setPrimary(existingImages.findIndex(i => i.id === img.id) + previewImages.length)}
                          className={`absolute bottom-1 left-1 bg-blue-600 text-white rounded-full px-2 py-0.5 text-xs ${
                            data.primary_image_index === (idx + previewImages.length) ? 'opacity-100' : 'opacity-50 hover:opacity-80'
                          }`}
                          aria-label="Définir comme image principale"
                        >
                          Principale
                        </button>
                      </div>
                    )
                  })}
                </div>
              </div>
            )}

          </div>
        </div>
      </AppLayout>
    </>
  )
}
