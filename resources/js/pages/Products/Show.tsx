import React from 'react'
import { Head, Link } from '@inertiajs/react'
import { PageProps, Product } from '@/types'
import { Button } from '@/components/ui/button'
import AppLayout from '@/layouts/app-layout'
import { Pencil, ArrowLeft } from 'lucide-react'
import { route } from 'ziggy-js'
import ProductGallery from '@/components/ProductGallery'

interface Image {
  id: number
  path: string
  is_primary: boolean
  deleted_at: string | null
}

interface Props extends PageProps<{
  product: Product & { images: Image[] }
}> {}

export default function ShowProduct({ product }: Props) {
  const isDeleted = !!product.deleted_at

  const created = new Date(product.created_at!)
  const updated = product.updated_at ? new Date(product.updated_at) : null

  // Préparer les images pour la galerie
  const imagesForGallery = product.images.map(img => ({
    original: `/storage/${img.path}`,
    thumbnail: `/storage/${img.path}`,
    originalAlt: product.name,
    thumbnailAlt: product.name,
  }))

  return (
    <>
      <Head title={`Produit – ${product.name}`} />

      <AppLayout
        breadcrumbs={[
          { title: 'Dashboard', href: '/dashboard' },
          { title: 'Produits', href: '/products' },
          { title: product.name, href: route('products.show', product.id) },
        ]}
      >
        <div className="p-6 space-y-6">

          {/* Header */}
          <div className="flex flex-col sm:flex-row justify-between sm:items-center mb-6">
            <h1 className="text-2xl font-bold text-gray-800 mb-2 sm:mb-0">
              Détails du produit
            </h1>
            <div className="flex space-x-3">
              <Link href={route('products.index')}>
                <Button className="bg-gray-300 text-gray-800 hover:bg-gray-400">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Retour
                </Button>
              </Link>
              {!isDeleted && (
                <Link href={route('products.edit', product.id)}>
                  <Button className="bg-gray-600 text-white hover:bg-gray-700">
                    <Pencil className="w-4 h-4 mr-2" />
                    Modifier
                  </Button>
                </Link>
              )}
            </div>
          </div>

          {/* Grille haut en deux colonnes avec même hauteur */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-stretch">

            {/* Infos + Description */}
            <div className="space-y-6 flex flex-col">
              <div className="bg-white rounded-lg shadow-sm p-6 space-y-4 flex-grow">
                <h2 className="text-lg font-medium mb-2 pb-2 border-b border-gray-200">
                  Informations
                </h2>
                <div className="space-y-3">
                  <div>
                    <h3 className="text-sm font-medium text-gray-500">Nom</h3>
                    <p className="text-lg font-medium mt-1">{product.name}</p>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-gray-500">SKU</h3>
                    <p className="mt-1">{product.sku}</p>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-gray-500">Catégorie</h3>
                    <p className="mt-1">{product.category?.name}</p>
                  </div>

                  {/* Ligne compacte Prix, Stock, Statut en 3 colonnes */}
                  <div className="grid grid-cols-3 gap-6">
                    <div>
                      <h3 className="text-sm font-medium text-gray-500">Prix</h3>
                      <p className="mt-1">{product.price} {product.currency?.symbol}</p>
                    </div>
                    <div>
                      <h3 className="text-sm font-medium text-gray-500">Stock</h3>
                      <p className="mt-1">{product.stock_quantity}</p>
                    </div>
                    <div>
                      <h3 className="text-sm font-medium text-gray-500">Statut</h3>
                      <p className="mt-1">
                        {isDeleted ? (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                            Désactivé
                          </span>
                        ) : (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                            Actif
                          </span>
                        )}
                      </p>
                    </div>
                  </div>

                  {/* Ligne Créé le + Dernière mise à jour */}
                  <div className="grid grid-cols-3 gap-6">
                    <div>
                      <h3 className="text-sm font-medium text-gray-500">Créé le</h3>
                      <p className="text-sm text-gray-600 mt-1">
                        {created.toLocaleString('fr-FR', {
                          day: '2-digit', month: '2-digit', year: 'numeric',
                          hour: '2-digit', minute: '2-digit'
                        })}
                      </p>
                    </div>
                    {updated && (
                      <div>
                        <h3 className="text-sm font-medium text-gray-500">Dernière mise à jour</h3>
                        <p className="text-sm text-gray-600 mt-1">
                          {updated.toLocaleString('fr-FR', {
                            day: '2-digit', month: '2-digit', year: 'numeric',
                            hour: '2-digit', minute: '2-digit'
                          })}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow-sm p-6 flex-grow flex flex-col">
                <h2 className="text-lg font-medium mb-4 pb-2 border-b border-gray-200">Description</h2>
                <p className="text-gray-700 whitespace-pre-line flex-grow">
                  {product.description || '—'}
                </p>
              </div>
            </div>

            {/* Galerie images */}
            <div className="bg-white rounded-lg shadow-sm p-6 flex flex-col">
              <h2 className="text-lg font-medium mb-4 pb-2 border-b border-gray-200">Galerie d’images</h2>
              {imagesForGallery.length > 0 ? (
                <ProductGallery images={product.images} productName={product.name} />
              ) : (
                <p className="text-center text-gray-500 py-12">Aucune image disponible pour ce produit.</p>
              )}
            </div>
          </div>
        </div>
      </AppLayout>
    </>
  )
}
