import React, { useState } from 'react';
import { Head, useForm } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import AppLayout from '@/layouts/app-layout';
import { Check, CheckSquare, Square } from 'lucide-react';

interface Permission {
  id: number;
  name: string;
}

interface Props {
  permissions: Permission[];
}

export default function CreateRole({ permissions }: Props) {
  const { data, setData, post, processing, errors } = useForm({
    name: '',
    permissions: [] as string[],
  });

  const togglePermission = (permissionName: string) => {
    const updatedPermissions = data.permissions.includes(permissionName)
      ? data.permissions.filter(p => p !== permissionName)
      : [...data.permissions, permissionName];

    setData('permissions', updatedPermissions);
  };

  const toggleAllPermissions = () => {
    if (data.permissions.length === permissions.length) {
      setData('permissions', []);
    } else {
      setData('permissions', permissions.map(p => p.name));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    post(route('roles.store'));
  };

  return (
    <>
      <Head title="Créer un rôle" />
      <AppLayout
        breadcrumbs={[
          { title: 'Dashboard', href: '/dashboard' },
          { title: 'Rôles', href: '/roles' },
          { title: 'Créer un rôle', href: '/roles/create' },
        ]}
      >
        <div className="grid grid-cols-12 gap-6 p-6">
          <div className="col-span-12 lg:col-span-8 xl:col-span-7">
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h1 className="text-xl font-semibold mb-6">Créer un nouveau rôle</h1>

              <form onSubmit={handleSubmit}>
                {/* Nom du rôle */}
                <div className="mb-6">
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                    Nom du rôle<span className="text-red-600">*</span>
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

                {/* Permissions */}
                <div className="mb-6">
                  <div className="flex justify-between items-center mb-2">
                    <label className="block text-sm font-medium text-gray-700">
                      Permissions<span className="text-red-600">*</span>
                    </label>
                    <button
                      type="button"
                      onClick={toggleAllPermissions}
                      className="flex items-center text-sm text-gray-600 hover:text-gray-900"
                    >
                      {data.permissions.length === permissions.length ? (
                        <>
                          <Square className="w-4 h-4 mr-2" />
                          Tout désélectionner
                        </>
                      ) : (
                        <>
                          <CheckSquare className="w-4 h-4 mr-2" />
                          Tout sélectionner
                        </>
                      )}
                    </button>
                  </div>
                  {errors.permissions && <p className="mb-2 text-sm text-red-600">{errors.permissions}</p>}

                  <div className="border border-gray-200 rounded-lg overflow-hidden">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-px bg-gray-200">
                      {permissions.map((permission) => (
                        <div
                          key={permission.id}
                          onClick={() => togglePermission(permission.name)}
                          className={`
                            flex items-center p-4 bg-white cursor-pointer transition-all
                            ${data.permissions.includes(permission.name)
                              ? 'bg-blue-50'
                              : 'hover:bg-gray-50'}
                          `}
                        >
                          <div
                            className={`
                              flex-shrink-0 w-5 h-5 mr-3 rounded border transition-colors
                              flex items-center justify-center
                              ${data.permissions.includes(permission.name)
                                ? 'bg-blue-600 border-blue-600'
                                : 'border-gray-300'}
                            `}
                          >
                            {data.permissions.includes(permission.name) && (
                              <Check className="w-3.5 h-3.5 text-white" />
                            )}
                          </div>
                          <span className="text-sm text-gray-900 truncate">
                            {permission.name}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
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
                    {processing ? 'Création...' : 'Créer le rôle'}
                  </Button>
                </div>
              </form>
            </div>
          </div>

          <div className="col-span-12 lg:col-span-4 xl:col-span-5">
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-lg font-medium mb-4">À propos des rôles</h2>
              <div className="prose max-w-none">
                <p className="text-gray-600">
                  Les rôles permettent de définir des ensembles de permissions qui peuvent être attribués aux utilisateurs.
                </p>
                <p className="text-gray-600 mt-4">
                  Un utilisateur hérite de toutes les permissions des rôles qui lui sont attribués.
                </p>
                <div className="mt-4 p-4 bg-blue-50 rounded-md border border-blue-100">
                  <h3 className="text-sm font-medium text-blue-800 mb-2">Conseil</h3>
                  <p className="text-sm text-blue-700">
                    Créez des rôles avec des noms clairs et attribuez-leur uniquement les permissions nécessaires pour les fonctions qu'ils doivent accomplir.
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
