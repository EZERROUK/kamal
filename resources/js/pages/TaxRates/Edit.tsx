// resources/js/Pages/TaxRates/Edit.tsx
import React, { useEffect, useState } from 'react'
import { Head, useForm } from '@inertiajs/react'
import { Button } from '@/components/ui/button'
import AppLayout from '@/layouts/app-layout'
import { Info } from 'lucide-react'
import { route } from 'ziggy-js'

interface Props {
  taxRate: TaxRate
}

export default function TaxRateEdit({ taxRate }: Props) {
  // Si le taux est modifié manuellement
  const [rateEdited, setRateEdited] = useState(false)

  const { data, setData, put, processing, errors } = useForm({
    name: taxRate.name,
    rate: taxRate.rate.toString(),
  })

  // Gérer la soumission du formulaire
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    put(route('taxrates.update', taxRate.id)) // Soumission de la mise à jour
  }

  return (
    <>
      <Head title={`Modifier taux de TVA — ${taxRate.name}`} />
      <AppLayout breadcrumbs={[
        { title: 'Dashboard', href: '/dashboard' },
        { title: 'Taux de TVA', href: '/tax-rates' },
        { title: taxRate.name, href: route('taxrates.show', taxRate.id) },
        { title: 'Éditer', href: route('taxrates.edit', taxRate.id) },
      ]}>
        <div className="grid grid-cols-12 gap-6 p-6">

          {/* -------- Formulaire -------- */}
          <div className="col-span-12 lg:col-span-8 xl:col-span-7">
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h1 className="text-xl font-semibold mb-6">Modifier le taux de TVA</h1>

              <form onSubmit={handleSubmit}>
                {/* Nom */}
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Nom<span className="text-red-600">*</span>
                  </label>
                  <input
                    value={data.name}
                    onChange={e => setData('name', e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    required
                  />
                  {errors.name && <p className="mt-1 text-sm text-red-600">{errors.name}</p>}
                </div>

                {/* Taux */}
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Taux (%)<span className="text-red-600">*</span>
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={data.rate}
                    onChange={e => setData('rate', e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    min={0}
                    max={100}
                    required
                  />
                  {errors.rate && <p className="mt-1 text-sm text-red-600">{errors.rate}</p>}
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
                    {processing ? 'Enregistrement…' : 'Enregistrer'}
                  </Button>
                </div>
              </form>
            </div>
          </div>

          {/* ---- Aide ---- */}
          <div className="col-span-12 lg:col-span-4 xl:col-span-5">
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-lg font-medium mb-4">À propos des taux de TVA</h2>
              <div className="prose max-w-none">
                <p className="text-gray-600">
                  Les taux de TVA sont appliqués à la vente de biens et services dans le cadre de la consommation. Un taux plus élevé est appliqué à certains produits ou services, tandis que d'autres bénéficient de taux réduits. Par exemple, un produit de première nécessité peut avoir un taux réduit.
                </p>
                <p className="text-gray-600 mt-4">
                  Au Maroc, les principaux taux de TVA sont les suivants :
                </p>
                <ul className="list-disc pl-5 mt-2">
                  <li>Taux normal : 20%</li>
                  <li>Taux réduit : 7%</li>
                  <li>Taux super réduit : 10%</li>
                  <li>Taux particulier : 14%</li>
                </ul>
                <div className="mt-4 p-4 bg-blue-50 rounded-md border border-blue-100 flex gap-3">
                  <Info className="w-5 h-5 text-blue-600 mt-0.5" />
                  <p className="text-sm text-blue-700">
                    Vous pouvez définir le taux de TVA applicable en fonction du type de produit ou service vendu.
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
