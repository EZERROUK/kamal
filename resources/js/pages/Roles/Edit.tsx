import React from 'react';
import { Head, useForm } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import AppLayout from '@/layouts/app-layout';
import { Check, CheckSquare, Square } from 'lucide-react';

interface Permission {
  id: number;
  name: string;
}

interface Role {
  id: number;
  name: string;
}

interface Props {
  role: Role;
  permissions: Permission[];
  rolePermissions: string[];
}

export default function EditRole({ role, permissions, rolePermissions }: Props) {
  const { data, setData, patch, processing, errors } = useForm({
    name: role.name,
    permissions: rolePermissions,
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
    patch(route('roles.update', role.id));
  };

  return (
    <>
      <Head title={`Modifier le rôle - ${role.name}`} />
      <AppLayout
        breadcrumbs={[
          { title: 'Dashboard', href: '/dashboard' },
          { title: 'Rôles', href: '/roles' },
          { title: `Modifier - ${role.name}`, href: route('roles.edit', role.id) },
        ]}
      >
        <div className="grid grid-cols-12 gap-6 p-6">
          <div className="col-span-12 lg:col-span-8">
            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex justify-between items-center mb-6">
                <h1 className="text-xl font-semibold">Modifier le rôle</h1>
                {role.name === 'SuperAdmin' && (
                  <div className="px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full text-xs font-medium">
                    Rôle système
                  </div>
                )}
              </div>

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
                    className={`block w-full px-4 py-3 border rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm ${
                      role.name === 'SuperAdmin' ? 'bg-gray-100 cursor-not-allowed' : 'border-gray-300'
                    }`}
                    required
                    disabled={role.name === 'SuperAdmin'}
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
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-px bg-gray-200">
                      {permissions.map((permission) => (
                        <div
                          key={permission.id}
                          className={`
                            flex items-center p-4 bg-white cursor-pointer transition-all
                            ${data.permissions.includes(permission.name)
                              ? 'bg-blue-50'
                              : 'hover:bg-gray-50'}
                          `}
                          onClick={() => togglePermission(permission.name)}
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
                    {processing ? 'Sauvegarde...' : 'Sauvegarder'}
                  </Button>
                </div>
              </form>
            </div>
          </div>

          <div className="col-span-12 lg:col-span-4">
            <div className="bg-white rounded-lg shadow-sm p-6">
              {role.name === 'SuperAdmin' ? (
                <>
                  <h2 className="text-lg font-medium mb-4">Rôle SuperAdmin</h2>
                  <div className="prose max-w-none">
                    <p className="text-gray-600">
                      Le rôle SuperAdmin est un rôle système spécial dont le nom ne peut pas être modifié.
                    </p>
                    <p className="text-gray-600 mt-4">
                      Vous pouvez cependant modifier ses permissions pour ajuster finement les accès.
                    </p>
                    <div className="mt-4 p-4 bg-amber-50 rounded-md border border-amber-100">
                      <h3 className="text-sm font-medium text-amber-800 mb-2">Attention</h3>
                      <p className="text-sm text-amber-700">
                        Assurez-vous de maintenir les permissions essentielles pour ce rôle système.
                      </p>
                    </div>
                  </div>
                </>
              ) : (
                <>
                  <h2 className="text-lg font-medium mb-4">Modifications des rôles</h2>
                  <div className="prose max-w-none">
                    <p className="text-gray-600">
                      La modification d'un rôle affecte tous les utilisateurs qui possèdent ce rôle.
                    </p>
                    <p className="text-gray-600 mt-4">
                      Les changements prennent effet immédiatement pour tous les utilisateurs concernés.
                    </p>
                    <div className="mt-4 p-4 bg-blue-50 rounded-md border border-blue-100">
                      <h3 className="text-sm font-medium text-blue-800 mb-2">Conseil</h3>
                      <p className="text-sm text-blue-700">
                        Vérifiez bien toutes les permissions avant de sauvegarder pour vous assurer que les utilisateurs auront accès aux fonctionnalités dont ils ont besoin.
                      </p>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </AppLayout>
    </>
  );
}
