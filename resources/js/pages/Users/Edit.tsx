import { Head, useForm } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import AppLayout from '@/layouts/app-layout';
import { Eye, EyeOff } from 'lucide-react';
import { useState } from 'react';

export default function EditUser({ user, roles, userRoles }) {
  const { data, setData, patch, processing, errors } = useForm({
    name: user.name || '',
    email: user.email || '',
    password: '',
    password_confirmation: '',
    roles: userRoles || [], // Prend tous les rôles assignés à l'utilisateur
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    patch(route('users.update', user.id)); // Utilisez patch au lieu de put
  };

  return (
    <>
      <Head title="Modifier un utilisateur" />
      <AppLayout
        breadcrumbs={[
          { title: 'Dashboard', href: '/dashboard' },
          { title: 'Utilisateurs', href: '/users' },
          { title: `Modifier ${user.name}`, href: `/users/${user.id}/edit` },
        ]}
      >
        <div className="grid grid-cols-12 gap-6 p-6 bg-white">
          <div className="col-span-12 lg:col-span-8 xl:col-span-8">
            <h1 className="text-xl font-semibold mb-6">Modifier l'utilisateur</h1>

            <form onSubmit={handleSubmit}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700">Nom</label>
                  <input
                    type="text"
                    id="name"
                    value={data.name}
                    onChange={(e) => setData('name', e.target.value)}
                    className="mt-1 block w-full px-4 py-3 border border-gray-300 rounded-lg"
                  />
                  {errors.name && <p className="text-sm text-red-600">{errors.name}</p>}
                </div>
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700">Email</label>
                  <input
                    type="email"
                    id="email"
                    value={data.email}
                    onChange={(e) => setData('email', e.target.value)}
                    className="mt-1 block w-full px-4 py-3 border border-gray-300 rounded-lg"
                    autoComplete="username"
                  />
                  {errors.email && <p className="text-sm text-red-600">{errors.email}</p>}
                </div>
              </div>

              {/* Mot de passe - optionnel */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div>
                  <label htmlFor="password" className="block text-sm font-medium text-gray-700">Nouveau mot de passe</label>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      id="password"
                      value={data.password}
                      onChange={(e) => setData('password', e.target.value)}
                      className="mt-1 block w-full px-4 py-3 pr-10 border border-gray-300 rounded-lg"
                      autoComplete="new-password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute inset-y-0 right-3 flex items-center text-gray-400 hover:text-gray-600"
                    >
                      {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                  {errors.password && <p className="text-sm text-red-600">{errors.password}</p>}
                </div>
                <div>
                  <label htmlFor="password_confirmation" className="block text-sm font-medium text-gray-700">Confirmer le mot de passe</label>
                  <div className="relative">
                    <input
                      type={showConfirmPassword ? 'text' : 'password'}
                      id="password_confirmation"
                      value={data.password_confirmation}
                      onChange={(e) => setData('password_confirmation', e.target.value)}
                      className="mt-1 block w-full px-4 py-3 pr-10 border border-gray-300 rounded-lg"
                      autoComplete="new-password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute inset-y-0 right-3 flex items-center text-gray-400 hover:text-gray-600"
                    >
                      {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                  {errors.password_confirmation && <p className="text-sm text-red-600">{errors.password_confirmation}</p>}
                </div>
              </div>

              {/* Rôle - multiple */}
              <div className="mb-6">
                <label htmlFor="roles" className="block text-sm font-medium text-gray-700">Rôles</label>
                <select
                  id="roles"
                  value={data.roles}
                  onChange={(e) => setData('roles', Array.from(e.target.selectedOptions, option => option.value))}
                  multiple
                  className="mt-1 block w-full px-4 py-3 border border-gray-300 rounded-lg"
                >
                  {roles.map((role) => (
                    <option key={role.id} value={role.name}>
                      {role.name}
                    </option>
                  ))}
                </select>
                {errors.roles && <p className="text-sm text-red-600">{errors.roles}</p>}
              </div>

              <div className="flex justify-between">
                <Button
                  type="button"
                  onClick={() => window.history.back()}
                  className="bg-gray-300 text-gray-800 hover:bg-gray-400"
                >
                  Annuler
                </Button>
                <Button
                  type="submit"
                  disabled={processing}
                  className="bg-blue-600 text-white hover:bg-blue-700"
                >
                  {processing ? 'Mise à jour...' : 'Mettre à jour'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      </AppLayout>
    </>
  );
}
