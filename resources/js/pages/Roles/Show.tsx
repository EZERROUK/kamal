import React from 'react';
import { Head, Link } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import AppLayout from '@/layouts/app-layout';
import { Pencil, ArrowLeft } from 'lucide-react';

interface Permission {
  id: number;
  name: string;
}

interface Role {
  id: number;
  name: string;
  permissions: Permission[];
}

interface Props {
  role: Role;
  rolePermissions: string[];
}

export default function ShowRole({ role, rolePermissions }: Props) {
  return (
    <>
      <Head title={`Rôle - ${role.name}`} />
      <AppLayout
        breadcrumbs={[
          { title: 'Dashboard', href: '/dashboard' },
          { title: 'Rôles', href: '/roles' },
          { title: role.name, href: route('roles.show', role.id) },
        ]}
      >
        <div className="p-6">
          <div className="flex flex-col sm:flex-row justify-between sm:items-center mb-6">
            <h1 className="text-2xl font-bold text-gray-800 mb-2 sm:mb-0">Détails du rôle</h1>
            <div className="flex space-x-3">
              <Link href={route('roles.index')}>
                <Button className="bg-gray-300 text-gray-800 hover:bg-gray-400">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Retour
                </Button>
              </Link>
              {role.name !== 'SuperAdmin' && (
                <Link href={route('roles.edit', role.id)}>
                  <Button className="bg-gray-600 hover:bg-gray-700">
                    <Pencil className="w-4 h-4 mr-2" />
                    Modifier
                  </Button>
                </Link>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-1">
              <div className="bg-white rounded-lg shadow-sm p-6">
                <h2 className="text-lg font-medium mb-4 pb-2 border-b border-gray-200">Informations</h2>

                <div className="space-y-4">
                  <div>
                    <h3 className="text-sm font-medium text-gray-500">Nom du rôle</h3>
                    <p className="text-lg font-medium mt-1">{role.name}</p>
                  </div>

                  <div>
                    <h3 className="text-sm font-medium text-gray-500">Type</h3>
                    <p className="mt-1">
                      {role.name === 'SuperAdmin' ? (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                          Rôle système
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                          Rôle personnalisé
                        </span>
                      )}
                    </p>
                  </div>

                  <div>
                    <h3 className="text-sm font-medium text-gray-500">Nombre de permissions</h3>
                    <p className="text-lg font-medium mt-1">{role.permissions.length}</p>
                  </div>
                </div>

                {role.name === 'SuperAdmin' && (
                  <div className="mt-6 p-4 bg-amber-50 rounded-md border border-amber-100">
                    <h3 className="text-sm font-medium text-amber-800 mb-2">Rôle système protégé</h3>
                    <p className="text-sm text-amber-700">
                      Ce rôle spécial ne peut être ni modifié ni supprimé, car il est essentiel au fonctionnement du système.
                    </p>
                  </div>
                )}
              </div>
            </div>

            <div className="lg:col-span-2">
              <div className="bg-white rounded-lg shadow-sm p-6">
                <h2 className="text-lg font-medium mb-4 pb-2 border-b border-gray-200">Permissions accordées</h2>

                {role.permissions.length === 0 ? (
                  <div className="text-center py-8">
                    <p className="text-gray-500">Aucune permission n'est attribuée à ce rôle.</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                    {role.permissions.map((permission) => (
                      <div
                        key={permission.id}
                        className="flex items-center p-3 bg-blue-50 rounded-md border border-blue-100"
                      >
                        <div className="w-5 h-5 rounded bg-blue-600 border-blue-600 flex items-center justify-center mr-3">
                          <svg className="w-3.5 h-3.5 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <polyline points="20 6 9 17 4 12" />
                          </svg>
                        </div>
                        <span className="text-sm font-medium text-gray-700">{permission.name}</span>
                      </div>
                    ))}
                  </div>
                )}

                {role.name === 'SuperAdmin' && (
                  <div className="mt-6 p-4 rounded-md bg-blue-50 border border-blue-100">
                    <p className="text-sm text-blue-700">
                      Le rôle SuperAdmin a accès à toutes les fonctionnalités du système, indépendamment des permissions listées ci-dessus.
                    </p>
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
