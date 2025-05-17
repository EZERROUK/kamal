import { Head, useForm } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import AppLayout from '@/layouts/app-layout';
import { Eye, EyeOff } from 'lucide-react';
import { useState } from 'react';

interface User {
  id: number;
  name: string;
  email: string;
  created_at: string;
  updated_at: string;
}

interface Props {
  user: User;
  userRoles: string[];
}

export default function ShowUser({ user, userRoles }: Props) {
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  return (
    <>
      <Head title={`Utilisateur: ${user?.name}`} />
      <AppLayout
        breadcrumbs={[
          { title: 'Dashboard', href: '/dashboard' },
          { title: 'Utilisateurs', href: '/users' },
          { title: user?.name || '', href: `/users/${user?.id}` },
        ]}
      >
        <div className="grid grid-cols-12 gap-6 p-6 bg-white">
          <div className="col-span-12 lg:col-span-8 xl:col-span-8">
            <h1 className="text-xl font-semibold mb-6">Informations de l'utilisateur</h1>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div>
                <label className="block text-sm font-medium text-gray-700">Nom</label>
                <div className="mt-1 px-4 py-3 border border-gray-300 rounded-lg bg-gray-50">
                  {user?.name}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Email</label>
                <div className="mt-1 px-4 py-3 border border-gray-300 rounded-lg bg-gray-50">
                  {user?.email}
                </div>
              </div>
            </div>

              <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700">Rôles</label>
              <div className="mt-1 flex flex-wrap gap-2">
                {userRoles && userRoles.length > 0 ? (
                  userRoles.map((role, index) => (
                    <span
                      key={index}
                      className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium
                        ${role === 'SuperAdmin' ? 'bg-red-100 text-red-800' : ''}
                        ${role === 'Admin' ? 'bg-blue-100 text-blue-800' : ''}
                        ${role === 'User' ? 'bg-green-100 text-green-800' : ''}
                        ${!['SuperAdmin', 'Admin', 'User'].includes(role) ? 'bg-gray-100 text-gray-800' : ''}
                      `}
                    >
                      {role}
                    </span>
                  ))
                ) : (
                  <span className="text-gray-500 italic">Aucun rôle assigné</span>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6 border-t border-gray-200 pt-6">
              <div>
                <label className="block text-sm font-medium text-gray-700">Créé le</label>
                <div className="mt-1 text-sm text-gray-600">
                  {user?.created_at && new Date(user.created_at).toLocaleDateString('fr-FR', {
                    day: '2-digit',
                    month: '2-digit',
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </div>
              </div>
              {user?.updated_at && (
                <div>
                  <label className="block text-sm font-medium text-gray-700">Dernière mise à jour</label>
                  <div className="mt-1 text-sm text-gray-600">
                    {new Date(user.updated_at).toLocaleDateString('fr-FR', {
                      day: '2-digit',
                      month: '2-digit',
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </div>
                </div>
              )}
            </div>

            <div className="flex justify-between">
              <Button
                type="button"
                onClick={() => window.history.back()}
                className="bg-gray-300 text-gray-800 hover:bg-gray-400"
              >
                Retour
              </Button>
              <Button
                type="button"
                onClick={() => window.location.href = route('users.edit', user?.id)}
                className="bg-gray-600 text-white hover:bg-gray-800"
              >
                Modifier
              </Button>
            </div>
          </div>

          {/* Delete confirmation modal */}
          {showDeleteModal && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
              <div className="bg-white rounded-lg p-6 max-w-md w-full">
                <h3 className="text-lg font-medium mb-4">Confirmer la suppression</h3>
                <p className="text-gray-600 mb-6">
                  Êtes-vous sûr de vouloir supprimer cet utilisateur ? Cette action est réversible.
                </p>
                <div className="flex justify-end space-x-3">
                  <Button
                    className="bg-gray-200 text-gray-800 hover:bg-gray-300"
                    onClick={() => setShowDeleteModal(false)}
                  >
                    Annuler
                  </Button>
                  <Button
                    className="bg-red-600 text-white hover:bg-red-700"
                    onClick={() => {
                      window.location.href = route('users.destroy', user?.id);
                      setShowDeleteModal(false);
                    }}
                  >
                    Confirmer la suppression
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div>
      </AppLayout>
    </>
  );
}
