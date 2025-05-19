import React, { useEffect, useState } from 'react'
import { Head, useForm } from '@inertiajs/react'
import { Button } from '@/components/ui/button'
import AppLayout from '@/layouts/app-layout'
import { Info } from 'lucide-react'
import { route } from 'ziggy-js'

interface FormData {
  name: string
  rate: string
  [key: string]: string
}


export default function CreateTaxRate() {
  const { data, setData, post, processing, errors } = useForm<FormData>({
    name: '',
    rate: '',
  })

  // Pas d’automatisme de slug ici, donc pas d’état slugEdited

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    post(route('taxrates.store'))
  }

  return (
    <>
      <Head title='Créer un taux de TVA' />
      <AppLayout breadcrumbs={[
        { title: 'Dashboard', href: '/dashboard' },
        { title: 'Taux de TVA', href: '/tax-rates' },
        { title: 'Créer', href: '/tax-rates/create' },
      ]}>
        <div className='grid grid-cols-12 gap-6 p-6'>

          {/* Formulaire */}
          <div className='col-span-12 lg:col-span-8 xl:col-span-7'>
            <div className='bg-white rounded-lg shadow-sm p-6'>
              <h1 className='text-xl font-semibold mb-6'>Nouveau taux de TVA</h1>

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

                {/* Taux */}
                <div className='mb-6'>
                  <label className='block text-sm font-medium text-gray-700 mb-1'>
                    Taux (%)<span className='text-red-600'>*</span>
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min={0}
                    max={100}
                    value={data.rate}
                    onChange={e => setData('rate', e.target.value)}
                    className='w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm'
                    required
                  />
                  {errors.rate && <p className='mt-1 text-sm text-red-600'>{errors.rate}</p>}
                </div>

                {/* Boutons */}
                <div className='flex justify-between'>
                  <Button type='button' onClick={() => history.back()}
                          className='bg-gray-300 text-gray-800 hover:bg-gray-400 px-6 py-3 rounded-md'>
                    Annuler
                  </Button>
                  <Button type='submit' disabled={processing}
                          className='bg-gray-600 text-white hover:bg-gray-700 px-6 py-3 rounded-md'>
                    {processing ? 'Création…' : 'Créer le taux'}
                  </Button>
                </div>
              </form>
            </div>
          </div>

          {/* Aide */}
          <div className='col-span-12 lg:col-span-4 xl:col-span-5'>
            <div className='bg-white rounded-lg shadow-sm p-6'>
              <h2 className='text-lg font-medium mb-4'>À propos des taux de TVA</h2>
              <div className='prose max-w-none'>
                <p className='text-gray-600 text-sm'>
                  Ajoutez un nouveau taux de TVA applicable à vos produits.
                </p>
                <div className='mt-4 p-4 bg-blue-50 rounded-md border border-blue-100 flex gap-3'>
                  <Info className='w-5 h-5 text-blue-600 mt-0.5' />
                  <p className='text-sm text-blue-700'>
                    Le taux est exprimé en pourcentage, par exemple 20 pour 20%.
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
