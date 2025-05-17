// resources/js/Pages/Categories/Edit.tsx
import React, { useEffect, useState } from 'react'
import { Head, useForm } from '@inertiajs/react'
import { PageProps, Category } from '@/types'
import { Button } from '@/components/ui/button'
import AppLayout from '@/layouts/app-layout'
import { Info } from 'lucide-react'
import { route } from 'ziggy-js'

interface Props extends PageProps<{
  category: Category
}> {}

export default function EditCategory({ category }: Props) {
  // on calcule le slug “par défaut” à partir du nom
  const defaultSlug = slugify(category.name)

  // si le slug stocké est différent du slug par défaut,
  // on considère qu’il a déjà été édité manuellement
  const [slugEdited, setSlugEdited] = useState(category.slug !== defaultSlug)

  const { data, setData, patch, processing, errors } = useForm({
    name: category.name,
    slug: category.slug,
  })

  // regénère le slug quand on modifie le name,
  // seulement si l’utilisateur n’a pas déjà édité le slug
  useEffect(() => {
    if (!slugEdited) {
      setData('slug', slugify(data.name))
    }
  }, [data.name, slugEdited])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    patch(route('categories.update', category.id))
  }

  return (
    <>
      <Head title={`Modifier « ${category.name} »`} />

      <AppLayout
        breadcrumbs={[
          { title: 'Dashboard',  href: '/dashboard' },
          { title: 'Catégories', href: '/categories' },
          { title: category.name, href: route('categories.show', category.id) },
          { title: 'Éditer',     href: route('categories.edit', category.id) },
        ]}
      >
        <div className='grid grid-cols-12 gap-6 p-6'>

          {/* -------- Formulaire -------- */}
          <div className='col-span-12 lg:col-span-8 xl:col-span-7'>
            <div className='bg-white rounded-lg shadow-sm p-6'>
              <h1 className='text-xl font-semibold mb-6'>Modifier la catégorie</h1>

              <form onSubmit={handleSubmit}>
                {/* Nom */}
                <div className='mb-6'>
                  <label className='block text-sm font-medium text-gray-700 mb-1'>
                    Nom<span className='text-red-600'>*</span>
                  </label>
                  <input
                    value={data.name}
                    onChange={e => {
                      setData('name', e.target.value)
                      if (e.target.value === '') {
                        // si on vide le nom, on autorise la régénération
                        setSlugEdited(false)
                      }
                    }}
                    className='w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm
                               focus:ring-blue-500 focus:border-blue-500 sm:text-sm'
                    required
                  />
                  {errors.name && <p className='mt-1 text-sm text-red-600'>{errors.name}</p>}
                </div>

                {/* Slug */}
                <div className='mb-6'>
                  <label className='block text-sm font-medium text-gray-700 mb-1'>
                    Slug<span className='text-red-600'>*</span>
                  </label>
                  <input
                    value={data.slug}
                    onChange={e => {
                      setData('slug', e.target.value)
                      setSlugEdited(true)   // l’utilisateur prend la main
                    }}
                    className='w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm
                               focus:ring-blue-500 focus:border-blue-500 sm:text-sm'
                    required
                  />
                  {errors.slug && <p className='mt-1 text-sm text-red-600'>{errors.slug}</p>}
                </div>

                {/* Boutons */}
                <div className='flex justify-between'>
                  <Button
                    type='button'
                    onClick={() => history.back()}
                    className='bg-gray-300 text-gray-800 hover:bg-gray-400 px-6 py-3 rounded-md'
                  >
                    Annuler
                  </Button>

                  <Button
                    type='submit'
                    disabled={processing}
                    className='bg-gray-600 text-white hover:bg-gray-700 px-6 py-3 rounded-md'
                  >
                    {processing ? 'Enregistrement…' : 'Enregistrer'}
                  </Button>
                </div>
              </form>
            </div>
          </div>

          {/* ---- Aide ---- */}
          <div className='col-span-12 lg:col-span-4 xl:col-span-5'>
            <div className='bg-white rounded-lg shadow-sm p-6'>
              <h2 className='text-lg font-medium mb-4'>À propos des catégories</h2>
              <div className='prose max-w-none'>
                <p className='text-gray-600'>
                  Les catégories organisent votre catalogue et facilitent la recherche.
                </p>
                <p className='text-gray-600 mt-4'>
                  Le <strong>slug</strong> est utilisé dans l’URL. Il doit être unique
                  et ne contenir que des caractères alphanumériques et des tirets.
                </p>
                <div className='mt-4 p-4 bg-blue-50 rounded-md border border-blue-100 flex gap-3'>
                  <Info className='w-5 h-5 text-blue-600 mt-0.5' />
                  <p className='text-sm text-blue-700'>
                    Le slug est généré automatiquement à partir du nom,
                    sauf si vous le modifiez manuellement.
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


/* Helper local pour transformer « Nouvelle Catégorie » → « nouvelle-categorie » */
function slugify(str: string): string {
  return str
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .toLowerCase().trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}
