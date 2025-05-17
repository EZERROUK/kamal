import React from 'react';
import { Head, useForm } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import AppLayout from '@/layouts/app-layout';

export default function CreatePermission() {
  const { data, setData, post, processing, errors } = useForm({
    name: '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    post(route('permissions.store'));
  };

  return (
    <>
      <Head title="Créer une permission" />
      <AppLayout
        breadcrumbs={[
          { title: 'Dashboard', href: '/dashboard' },
          { title: 'Permissions', href: '/permissions' },
          { title: 'Créer une permission', href: '/permissions/create' },
        ]}
      >
        <div className="grid grid-cols-12 gap-6 p-6">
          <div className="col-span-12 lg:col-span-7">
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h1 className="text-xl font-semibold mb-6">Créer une nouvelle permission</h1>

              <form onSubmit={handleSubmit}>
                {/* Nom de la permission */}
                <div className="mb-6">
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                    Nom de la permission<span className="text-red-600">*</span>
                  </label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={data.name}
                    onChange={(e) => setData('name', e.target.value)}
                    placeholder="Ex: create_users, edit_products, view_reports"
                    className="block w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    required
                  />
                  {errors.name && <p className="mt-1 text-sm text-red-600">{errors.name}</p>}
                </div>

                {/* Boutons */}
                <div className="flex justify-between">
                  <Button
                    type="button"
                    onClick={() => window.history.back()}
                    className="bg-gray-300 text-gray-800 hover:bg-gray-400 focus:ring-4 focus:ring-gray-400 px-6 py-3 rounded-md"
                  >
                    Annuler
                  </Button>

                  <Button
                    type="submit"
                    disabled={processing}
                    className="bg-gray-600 text-white hover:bg-gray-700 focus:ring-4 focus:ring-gray-500 px-6 py-3 rounded-md"
                  >
                    {processing ? 'Création...' : 'Créer la permission'}
                  </Button>
                </div>
              </form>
            </div>
          </div>

          <div className="col-span-12 lg:col-span-5">
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-lg font-medium mb-4">Bonnes pratiques</h2>
              <div className="prose max-w-none">
                <p className="text-gray-600">
                  Les permissions définissent des actions spécifiques qu'un utilisateur peut effectuer dans l'application.
                </p>

                <div className="mt-4">
                  <h3 className="text-sm font-medium text-gray-700">Convention de nommage</h3>
                  <p className="text-gray-600 mt-1">
                    Utilisez un format cohérent pour nommer vos permissions, par exemple :
                  </p>
                  <ul className="mt-2 space-y-1 list-disc list-inside text-gray-600 text-sm">
                    <li><code className="px-1 py-0.5 bg-gray-100 rounded text-sm">create_[resource]</code></li>
                    <li><code className="px-1 py-0.5 bg-gray-100 rounded text-sm">read_[resource]</code></li>
                    <li><code className="px-1 py-0.5 bg-gray-100 rounded text-sm">update_[resource]</code></li>
                    <li><code className="px-1 py-0.5 bg-gray-100 rounded text-sm">delete_[resource]</code></li>
                  </ul>
                </div>

                <div className="mt-4 p-4 bg-blue-50 rounded-md border border-blue-100">
                  <h3 className="text-sm font-medium text-blue-800 mb-2">Conseil</h3>
                  <p className="text-sm text-blue-700">
                    Créez des permissions granulaires pour permettre une gestion précise des accès. Il est plus facile de combiner plusieurs permissions spécifiques que de diviser une permission trop générale.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </AppLayout>
    </>
  );
}
