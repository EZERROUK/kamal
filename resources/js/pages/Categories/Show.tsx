// resources/js/Pages/Categories/Show.tsx
import React from 'react'
import { Head, Link } from '@inertiajs/react'
import { PageProps, Category } from '@/types'
import { Button } from '@/components/ui/button'
import AppLayout from '@/layouts/app-layout'
import { Pencil, ArrowLeft } from 'lucide-react'
import { route } from 'ziggy-js'

interface Props extends PageProps<{
  category: Category
}> {}

export default function ShowCategory({ category }: Props) {
  const isDeleted = !!category.deleted_at

  return (
    <>
      <Head title={`Catégorie – ${category.name}`} />

      <AppLayout
        breadcrumbs={[
          { title: 'Dashboard',  href: '/dashboard' },
          { title: 'Catégories', href: '/categories' },
          { title: category.name, href: route('categories.show', category.id) },
        ]}
      >
        <div className="p-6">
          {/* header with title and actions */}
          <div className="flex flex-col sm:flex-row justify-between sm:items-center mb-6">
            <h1 className="text-2xl font-bold text-gray-800 mb-2 sm:mb-0">
              Détails de la catégorie
            </h1>
            <div className="flex space-x-3">
              <Link href={route('categories.index')}>
                <Button className="bg-gray-300 text-gray-800 hover:bg-gray-400">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Retour
                </Button>
              </Link>
              {!isDeleted && (
                <Link href={route('categories.edit', category.id)}>
                  <Button className="bg-gray-600 text-white hover:bg-gray-700">
                    <Pencil className="w-4 h-4 mr-2" />
                    Modifier
                  </Button>
                </Link>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Informations panel */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-lg shadow-sm p-6">
                <h2 className="text-lg font-medium mb-4 pb-2 border-b border-gray-200">
                  Informations
                </h2>
                <div className="space-y-4">
                  <div>
                    <h3 className="text-sm font-medium text-gray-500">Nom</h3>
                    <p className="text-lg font-medium mt-1">{category.name}</p>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-gray-500">Slug</h3>
                    <p className="text-lg font-medium mt-1">{category.slug}</p>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-gray-500">Statut</h3>
                    <p className="mt-1">
                      {isDeleted ? (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                          Désactivée
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                          Active
                        </span>
                      )}
                    </p>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-gray-500">Créée le</h3>
                    <p className="text-sm text-gray-600 mt-1">
                      {new Date(category.created_at).toLocaleDateString('fr-FR', {
                        day: '2-digit',
                        month: '2-digit',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </p>
                  </div>
                  {category.updated_at && (
                    <div>
                      <h3 className="text-sm font-medium text-gray-500">Dernière mise à jour</h3>
                      <p className="text-sm text-gray-600 mt-1">
                        {new Date(category.updated_at).toLocaleDateString('fr-FR', {
                          day: '2-digit',
                          month: '2-digit',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* (Optionnel) espace pour autres infos */}
            <div className="lg:col-span-2">
              <div className="bg-white rounded-lg shadow-sm p-6">
                <h2 className="text-lg font-medium mb-4 pb-2 border-b border-gray-200">
                  Produits de cette catégorie
                </h2>
                {category.products && category.products.length > 0 ? (
                  <ul className="list-disc pl-5 space-y-1">
                    {category.products.map(prod => (
                      <li key={prod.id} className="text-gray-700">
                        <Link
                          href={route('products.show', prod.id)}
                          className="text-blue-600 hover:underline"
                        >
                          {prod.name}
                        </Link>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    Aucun produit dans cette catégorie.
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </AppLayout>
    </>
  )
}
