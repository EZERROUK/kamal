// resources/js/Pages/TaxRates/Show.tsx
import React from 'react'
import { Head, Link } from '@inertiajs/react'
import { PageProps, TaxRate } from '@/types'
import { Button } from '@/components/ui/button'
import AppLayout from '@/layouts/app-layout'
import { Pencil, ArrowLeft, Info } from 'lucide-react'
import { route } from 'ziggy-js'

interface Props extends PageProps<{
  taxRate: TaxRate
}> {}

export default function ShowTaxRate({ taxRate }: Props) {
  const isDeleted = !!taxRate.deleted_at
  const rateNumber = Number(taxRate.rate)

  return (
    <>
      <Head title={`Taux de TVA – ${taxRate.name}`} />

      <AppLayout
        breadcrumbs={[
          { title: 'Dashboard', href: '/dashboard' },
          { title: 'Taux de TVA', href: '/tax-rates' },
          { title: taxRate.name, href: route('taxrates.show', taxRate.id) },
        ]}
      >
        <div className="p-6">
          {/* header with title and actions */}
          <div className="flex flex-col sm:flex-row justify-between sm:items-center mb-6">
            <h1 className="text-2xl font-bold text-gray-800 mb-2 sm:mb-0">
              Détails du taux de TVA
            </h1>
            <div className="flex space-x-3">
              <Link href={route('taxrates.index')}>
                <Button className="bg-gray-300 text-gray-800 hover:bg-gray-400">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Retour
                </Button>
              </Link>
              {!isDeleted && (
                <Link href={route('taxrates.edit', taxRate.id)}>
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
                    <p className="text-lg font-medium mt-1">{taxRate.name}</p>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-gray-500">Taux (%)</h3>
                    <p className="text-lg font-medium mt-1">{rateNumber.toFixed(2)}</p>
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
                  <div>
                    <h3 className="text-sm font-medium text-gray-500">Créé le</h3>
                    <p className="text-sm text-gray-600 mt-1">
                      {new Date(taxRate.created_at).toLocaleDateString('fr-FR', {
                        day: '2-digit',
                        month: '2-digit',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </p>
                  </div>
                  {taxRate.updated_at && (
                    <div>
                      <h3 className="text-sm font-medium text-gray-500">Dernière mise à jour</h3>
                      <p className="text-sm text-gray-600 mt-1">
                        {new Date(taxRate.updated_at).toLocaleDateString('fr-FR', {
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

            {/* Explication TVA - colonne droite justifiée */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-lg shadow-sm p-6">
                <h2 className="text-lg font-medium mb-4 flex items-center gap-2">
                  <Info className="w-5 h-5 text-blue-600" />
                  À propos de la TVA
                </h2>
                <div className="prose max-w-none text-sm text-gray-700" style={{ textAlign: 'justify' }}>
                  <p className="mb-4">
                    La Taxe sur la Valeur Ajoutée (TVA) est un impôt indirect sur la consommation,
                    appliqué sur la majorité des biens et services.
                  </p>
                  <p className="mb-4">
                    Le taux de TVA représente le pourcentage ajouté au prix hors taxe pour obtenir
                    le prix TTC (toutes taxes comprises).
                  </p>
                  <p className="mb-4 font-semibold">
                    Voici quelques taux de TVA en vigueur au Maroc :
                  </p>
                  <ul className="list-disc pl-5 mb-4 space-y-1">
                    <li>Taux normal : 20%</li>
                    <li>Taux réduit : 10% (certains produits alimentaires, eau, électricité)</li>
                    <li>Taux super-réduit : 7% (activités agricoles, hôtellerie, etc.)</li>
                    <li>Taux particulier : 14% (certains services et biens spécifiques)</li>
                  </ul>
                  <p>
                    Gérer correctement ces taux est essentiel pour la conformité fiscale et la bonne gestion de votre facturation.
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
