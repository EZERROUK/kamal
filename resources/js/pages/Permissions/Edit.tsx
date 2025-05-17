import React from 'react';
import { Head, useForm } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import AppLayout from '@/layouts/app-layout';

interface Permission {
  id: number;
  name: string;
}

interface Props {
  permission: Permission;
}

export default function EditPermission({ permission }: Props) {
  const { data, setData, patch, processing, errors } = useForm({
    name: permission.name,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    patch(route('permissions.update', permission.id));
  };

  return (
    <>
      <Head title={`Modifier la permission - ${permission.name}`} />
      <AppLayout
        breadcrumbs={[
          { title: 'Dashboard', href: '/dashboard' },
          { title: 'Permissions', href: '/permissions' },
          { title: `Modifier - ${permission.name}`, href: route('permissions.edit', permission.id) },
        ]}
      >
        <div className="grid grid-cols-12 gap-6 p-6">
          <div className="col-span-12 lg:col-span-7">
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h1 className="text-xl font-semibold mb-6">Modifier la permission</h1>

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
                    {processing ? 'Sauvegarde...' : 'Sauvegarder'}
                  </Button>
                </div>
              </form>
            </div>
          </div>

          <div className="col-span-12 lg:col-span-5">
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-lg font-medium mb-4">Impacts de la modification</h2>
              <div className="prose max-w-none">
                <p className="text-gray-600">
                  La modification du nom d'une permission peut avoir un impact sur les rôles qui l'utilisent et sur le code de l'application.
                </p>

                <div className="mt-4 p-4 bg-amber-50 rounded-md border border-amber-100">
                  <h3 className="text-sm font-medium text-amber-800 mb-2">Attention</h3>
                  <p className="text-sm text-amber-700">
                    Si vous modifiez le nom d'une permission, assurez-vous de mettre également à jour toutes les références à cette permission dans votre code (vérifications de politiques, middleware, etc.).
                  </p>
                </div>

                <div className="mt-4">
                  <h3 className="text-sm font-medium text-gray-700">Points à vérifier après la modification</h3>
                  <ul className="mt-2 space-y-1 list-disc list-inside text-gray-600 text-sm">
                    <li>Vérifiez que tous les rôles utilisant cette permission fonctionnent toujours correctement</li>
                    <li>Vérifiez que tous les contrôles d'accès basés sur cette permission fonctionnent toujours</li>
                    <li>Informez les développeurs de ce changement si nécessaire</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </AppLayout>
    </>
  );
}
