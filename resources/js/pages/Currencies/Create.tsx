import React from 'react'
import { Head, useForm } from '@inertiajs/react'
import { Button } from '@/components/ui/button'
import AppLayout from '@/layouts/app-layout'
import { Info } from 'lucide-react'
import { route } from 'ziggy-js'

interface FormData {
  code: string
  symbol: string
  name: string
  [key: string]: string
}

export default function CreateCurrency() {
  const { data, setData, post, processing, errors } = useForm<FormData>({
    code: '',
    symbol: '',
    name: '',
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    post(route('currencies.store'))
  }

  return (
    <>
      <Head title='Créer une devise' />
      <AppLayout breadcrumbs={[
        { title: 'Dashboard', href: '/dashboard' },
        { title: 'Devises', href: '/currencies' },
        { title: 'Créer', href: '/currencies/create' },
      ]}>
        <div className='grid grid-cols-12 gap-6 p-6'>

          {/* Formulaire */}
          <div className='col-span-12 lg:col-span-8 xl:col-span-7'>
            <div className='bg-white rounded-lg shadow-sm p-6'>
              <h1 className='text-xl font-semibold mb-6'>Nouvelle devise</h1>

              <form onSubmit={handleSubmit}>

                {/* Nom */}
                <div className='mb-6'>
                  <label className='block text-sm font-medium text-gray-700 mb-1'>
                    Nom<span className='text-red-600'>*</span>
                  </label>
                  <input
                    type="text"
                    value={data.name}
                    onChange={e => setData('name', e.target.value)}
                    className='w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm'
                    required
                  />
                  {errors.name && <p className='mt-1 text-sm text-red-600'>{errors.name}</p>}
                </div>

                {/* Code ISO */}
                <div className='mb-6'>
                  <label className='block text-sm font-medium text-gray-700 mb-1'>
                    Code ISO&nbsp;
                    <span className='text-gray-400 text-xs'>(ex: EUR)</span>
                    <span className='text-red-600'>*</span>
                  </label>
                  <input
                    type="text"
                    value={data.code}
                    onChange={e => setData('code', e.target.value.toUpperCase())}
                    className='w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm uppercase'
                    maxLength={3}
                    minLength={2}
                    required
                  />
                  {errors.code && <p className='mt-1 text-sm text-red-600'>{errors.code}</p>}
                </div>

                {/* Symbole */}
                <div className='mb-6'>
                  <label className='block text-sm font-medium text-gray-700 mb-1'>
                    Symbole<span className='text-red-600'>*</span>
                  </label>
                  <input
                    type="text"
                    value={data.symbol}
                    onChange={e => setData('symbol', e.target.value)}
                    className='w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm'
                    maxLength={5}
                    required
                  />
                  {errors.symbol && <p className='mt-1 text-sm text-red-600'>{errors.symbol}</p>}
                </div>

                {/* Boutons */}
                <div className='flex justify-between'>
                  <Button type='button' onClick={() => history.back()}
                          className='bg-gray-300 text-gray-800 hover:bg-gray-400 px-6 py-3 rounded-md'>
                    Annuler
                  </Button>
                  <Button type='submit' disabled={processing}
                          className='bg-gray-600 text-white hover:bg-gray-700 px-6 py-3 rounded-md'>
                    {processing ? 'Création…' : 'Créer la devise'}
                  </Button>
                </div>
              </form>
            </div>
          </div>

          {/* Aide */}
          <div className='col-span-12 lg:col-span-4 xl:col-span-5'>
            <div className='bg-white rounded-lg shadow-sm p-6'>
              <h2 className='text-lg font-medium mb-4'>À propos des devises</h2>
              <div className='prose max-w-none'>
                <p className='text-gray-600'>
                  Ajoutez une devise (monnaie) que vous souhaitez utiliser dans vos opérations, factures ou devis.
                </p>
                <div className='mt-4 p-4 bg-blue-50 rounded-md border border-blue-100 flex gap-3'>
                  <Info className='w-5 h-5 text-blue-600 mt-0.5' />
                  <p className='text-sm text-blue-700'>
                   Le code doit être au format ISO 4217 (ex: EUR, USD, MAD). Le symbole (€, $, د.م., ...) est utilisé dans l’interface utilisateur. </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </AppLayout>
    </>
  )
}
