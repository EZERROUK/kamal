import React from 'react'
import { Head, useForm } from '@inertiajs/react'
import { Button } from '@/components/ui/button'
import AppLayout from '@/layouts/app-layout'
import { Info } from 'lucide-react'
import { route } from 'ziggy-js'
import { Currency, PageProps } from '@/types'

interface Props extends PageProps<{
  currency: Currency
}> {}

export default function EditCurrency({ currency }: Props) {
  const { data, setData, put, processing, errors } = useForm({
    code: currency.code,
    name: currency.name,
    symbol: currency.symbol,
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    put(route('currencies.update', currency.code))
  }

  return (
    <>
      <Head title={`Modifier la devise — ${currency.code}`} />
      <AppLayout breadcrumbs={[
        { title: 'Dashboard', href: '/dashboard' },
        { title: 'Devises', href: '/currencies' },
        { title: currency.code, href: route('currencies.edit', currency.code) },
        { title: 'Éditer', href: route('currencies.edit', currency.code) }
      ]}>
        <div className="grid grid-cols-12 gap-6 p-6">
          {/* -------- Formulaire -------- */}
          <div className="col-span-12 lg:col-span-8 xl:col-span-7">
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h1 className="text-xl font-semibold mb-6">Modifier la devise</h1>
              <form onSubmit={handleSubmit} autoComplete="off">
                {/* Code */}
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Code ISO 4217<span className="text-red-600">*</span>
                  </label>
                  <input
                    type="text"
                    value={data.code}
                    disabled // Code non modifiable !
                    className="w-full px-4 py-3 border border-gray-200 rounded-lg bg-gray-100 shadow-sm sm:text-sm cursor-not-allowed"
                  />
                  {errors.code && <p className="mt-1 text-sm text-red-600">{errors.code}</p>}
                </div>
                {/* Nom */}
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Nom<span className="text-red-600">*</span>
                  </label>
                  <input
                    type="text"
                    value={data.name}
                    onChange={e => setData('name', e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                    required
                  />
                  {errors.name && <p className="mt-1 text-sm text-red-600">{errors.name}</p>}
                </div>
                {/* Symbole */}
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Symbole<span className="text-red-600">*</span>
                  </label>
                  <input
                    type="text"
                    value={data.symbol}
                    maxLength={5}
                    onChange={e => setData('symbol', e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                    required
                  />
                  {errors.symbol && <p className="mt-1 text-sm text-red-600">{errors.symbol}</p>}
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
              <h2 className="text-lg font-medium mb-4">À propos des devises</h2>
              <div className="prose max-w-none">
                <p className="text text-sm -gray-600">
                  Les devises permettent de gérer la facturation multidevise dans vos applications.
                </p>
                <div className="mt-4 p-4 bg-blue-50 rounded-md border border-blue-100 flex gap-3">
                  <Info className="w-5 h-5 text-blue-600 mt-0.5" />
                  <p className="text-sm text-blue-700">
                    Le <b>code</b> n’est pas modifiable après création, il sert de clé principale.<br />
                    Modifiez le <b>nom</b> ou le <b>symbole</b> si nécessaire.
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
