import React from 'react';
import { Head, Link } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import AppLayout from '@/layouts/app-layout';
import { Pencil, ArrowLeft } from 'lucide-react';

interface Role {
  id: number;
  name: string;
}

interface Permission {
  id: number;
  name: string;
  roles: Role[];
}

interface Props {
  permission: Permission;
  permissionRoles: string[];
}

export default function ShowPermission({ permission, permissionRoles }: Props) {
  return (
    <>
      <Head title={`Permission - ${permission.name}`} />
      <AppLayout
        breadcrumbs={[
          { title: 'Dashboard', href: '/dashboard' },
          { title: 'Permissions', href: '/permissions' },
          { title: permission.name, href: route('permissions.show', permission.id) },
        ]}
      >
        <div className="p-6">
          <div className="flex flex-col sm:flex-row justify-between sm:items-center mb-6">
            <h1 className="text-2xl font-bold text-gray-800 mb-2 sm:mb-0">Détails de la permission</h1>
            <div className="flex space-x-3">
              <Link href={route('permissions.index')}>
                <Button className="bg-gray-300 text-gray-800 hover:bg-gray-400">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Retour
                </Button>
              </Link>
              <Link href={route('permissions.edit', permission.id)}>
                <Button className="bg-gray-600 hover:bg-gray-700">
                  <Pencil className="w-4 h-4 mr-2" />
                  Modifier
                </Button>
              </Link>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-1">
              <div className="bg-white rounded-lg shadow-sm p-6">
                <h2 className="text-lg font-medium mb-4 pb-2 border-b border-gray-200">Informations</h2>

                <div className="space-y-4">
                  <div>
                    <h3 className="text-sm font-medium text-gray-500">Nom de la permission</h3>
                    <p className="text-lg font-medium mt-1">{permission.name}</p>
                  </div>

                  <div>
                    <h3 className="text-sm font-medium text-gray-500">Identifiant</h3>
                    <p className="text-sm font-mono bg-gray-50 p-2 rounded mt-1">{permission.id}</p>
                  </div>

                  <div>
                    <h3 className="text-sm font-medium text-gray-500">Attribuée à</h3>
                    <p className="text-lg font-medium mt-1">{permission.roles.length} rôle(s)</p>
                  </div>
                </div>

                <div className="mt-6 p-4 bg-blue-50 rounded-md border border-blue-100">
                  <h3 className="text-sm font-medium text-blue-800 mb-2">Comment utiliser</h3>
                  <p className="text-sm text-blue-700">
                    Cette permission peut être vérifiée dans le code avec :
                  </p>
                  <pre className="mt-2 bg-gray-800 text-gray-200 p-3 rounded text-xs overflow-x-auto">
                    <code>@can('{permission.name}')
    // Contenu accessible
@endcan</code>
                  </pre>
                </div>
              </div>
            </div>

            <div className="lg:col-span-2">
              <div className="bg-white rounded-lg shadow-sm p-6">
                <h2 className="text-lg font-medium mb-4 pb-2 border-b border-gray-200">Rôles utilisant cette permission</h2>

                {permission.roles.length === 0 ? (
                  <div className="text-center py-8">
                    <p className="text-gray-500">Aucun rôle n'utilise actuellement cette permission.</p>
                    <p className="text-gray-500 mt-2">Attribuez cette permission à un rôle pour qu'elle soit effective.</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {permission.roles.map((role) => (
                      <Link
                        key={role.id}
                        href={route('roles.show', role.id)}
                        className="flex items-center justify-between p-4 bg-gray-50 hover:bg-gray-100 rounded-lg border border-gray-200 transition-colors"
                      >
                        <div className="flex items-center">
                          <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center mr-4">
                            <span className="text-gray-600 font-medium">{role.name.charAt(0)}</span>
                          </div>
                          <div>
                            <h3 className="font-medium text-gray-800">{role.name}</h3>
                            <p className="text-sm text-gray-500">
                              {role.name === 'SuperAdmin' ? 'Rôle système' : 'Rôle personnalisé'}
                            </p>
                          </div>
                        </div>
                        <div className="text-gray-400">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                          </svg>
                        </div>
                      </Link>
                    ))}
                  </div>
                )}

                {permission.roles.length > 0 && (
                  <div className="mt-6 p-4 bg-gray-50 rounded-md border border-gray-200">
                    <div className="flex items-start">
                      <div className="flex-shrink-0 mt-0.5">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2h-1V9z" clipRule="evenodd" />
                        </svg>
                      </div>
                      <p className="ml-3 text-sm text-gray-600">
                        Les utilisateurs ayant l'un des rôles ci-dessus pourront effectuer les actions associées à cette permission.
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </AppLayout>
    </>
  );
}
