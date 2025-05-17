import React from 'react'
import { Head, Link } from '@inertiajs/react'
import { PageProps, Currency } from '@/types'
import { Button } from '@/components/ui/button'
import AppLayout from '@/layouts/app-layout'
import { Pencil, ArrowLeft, Info } from 'lucide-react'
import { route } from 'ziggy-js'

interface Props extends PageProps<{
  currency: Currency
}> {}

export default function ShowCurrency({ currency }: Props) {
  const isDeleted = !!currency.deleted_at

  return (
    <>
      <Head title={`Devise — ${currency.name}`} />

      <AppLayout
        breadcrumbs={[
          { title: 'Dashboard', href: '/dashboard' },
          { title: 'Devises', href: '/currencies' },
          { title: currency.name, href: route('currencies.show', currency.code) },
        ]}
      >
        <div className="p-6">
          {/* header with title and actions */}
          <div className="flex flex-col sm:flex-row justify-between sm:items-center mb-6">
            <h1 className="text-2xl font-bold text-gray-800 mb-2 sm:mb-0">
              Détails de la devise
            </h1>
            <div className="flex space-x-3">
              <Link href={route('currencies.index')}>
                <Button className="bg-gray-300 text-gray-800 hover:bg-gray-400">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Retour
                </Button>
              </Link>
              {!isDeleted && (
                <Link href={route('currencies.edit', currency.code)}>
                  <Button className="bg-gray-600 text-white hover:bg-gray-700">
                    <Pencil className="w-4 h-4 mr-2" />
                    Modifier
                  </Button>
                </Link>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Informations panel agrandi */}
            <div className="lg:col-span-2">
              <div className="bg-white rounded-lg shadow-sm p-6">
                <h2 className="text-lg font-medium mb-4 pb-2 border-b border-gray-200">
                  Informations
                </h2>
                <div className="space-y-4">
                  <div>
                    <h3 className="text-sm font-medium text-gray-500">Nom</h3>
                    <p className="text-lg font-medium mt-1">{currency.name}</p>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-gray-500">Code</h3>
                    <p className="text-lg font-mono mt-1 tracking-widest">{currency.code}</p>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-gray-500">Symbole</h3>
                    <p className="text-lg font-medium mt-1">{currency.symbol}</p>
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
                      {currency.created_at
                        ? new Date(currency.created_at).toLocaleDateString('fr-FR', {
                            day: '2-digit',
                            month: '2-digit',
                            year: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit',
                          })
                        : '-'}
                    </p>
                  </div>
                  {currency.updated_at && (
                    <div>
                      <h3 className="text-sm font-medium text-gray-500">Dernière mise à jour</h3>
                      <p className="text-sm text-gray-600 mt-1">
                        {new Date(currency.updated_at).toLocaleDateString('fr-FR', {
                          day: '2-digit',
                          month: '2-digit',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Explication - colonne droite justifiée */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-lg shadow-sm p-6">
                <h2 className="text-lg font-medium mb-4 flex items-center gap-2">
                  <Info className="w-5 h-5 text-blue-600" />
                  À propos des devises
                </h2>
                <div className="prose max-w-none text-sm text-gray-700" style={{ textAlign: 'justify' }}>
                  <p className="mb-4">
                    Une <b>devise</b> représente une unité monétaire (ex : MAD, EUR, USD). Elle est utilisée pour les montants, les conversions, et la facturation multidevise.
                  </p>
                  <ul className="list-disc pl-5 mb-4 space-y-1">
                    <li>
                      <b>Code</b> : format ISO 4217 (ex : MAD, USD, EUR).
                    </li>
                    <li>
                      <b>Symbole</b> : utilisé dans l’interface (ex : €, $, د.م.).
                    </li>
                  </ul>
                  <p>
                    Les devises sont essentielles pour la gestion des prix, la conformité et l’export international.
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
