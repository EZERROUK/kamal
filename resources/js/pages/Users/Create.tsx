import { Head, useForm } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import AppLayout from '@/layouts/app-layout';
import { Eye, EyeOff } from 'lucide-react';
import { useState } from 'react';

interface Role {
  id: number;
  name: string;
}

interface Props {
  roles: Role[];
}

export default function CreateUser({ roles }: Props) {
  const { data, setData, post, processing, errors } = useForm({
    name: '',
    email: '',
    password: '',
    password_confirmation: '',
    role: '',
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [passwordError, setPasswordError] = useState('');

  const validatePassword = (password: string): boolean => {
    const minLength = password.length >= 10;
    const hasLowerCase = /[a-z]/.test(password);
    const hasUpperCase = /[A-Z]/.test(password);
    const hasNumber = /[0-9]/.test(password);
    return minLength && hasLowerCase && hasUpperCase && hasNumber;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!validatePassword(data.password)) {
      setPasswordError("Le mot de passe doit contenir au moins 10 caractères, incluant des lettres majuscules, des lettres minuscules et des chiffres.");
      return;
    }

    setPasswordError('');
    post(route('users.store'));
  };

  return (
    <>
      <Head title="Créer un utilisateur" />
      <AppLayout
        breadcrumbs={[
          { title: 'Dashboard', href: '/dashboard' },
          { title: 'Utilisateurs', href: '/users' },
          { title: 'Créer un utilisateur', href: '/users/create' },
        ]}
      >
        <div className="grid grid-cols-12 gap-6 p-6 bg-white">
          <div className="col-span-12 lg:col-span-8 xl:col-span-8">
            <h1 className="text-xl font-semibold mb-6">Créer un nouvel utilisateur</h1>

            <form onSubmit={handleSubmit}>
              {/* Nom */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700">Nom<span className="text-red-600">*</span></label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={data.name}
                    onChange={(e) => setData('name', e.target.value)}
                    className="mt-1 block w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    required
                  />
                  {errors.name && <p className="text-sm text-red-600">{errors.name}</p>}
                </div>
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700">Email<span className="text-red-600">*</span></label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={data.email}
                    onChange={(e) => setData('email', e.target.value)}
                    className="mt-1 block w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    required
                  />
                  {errors.email && <p className="text-sm text-red-600">{errors.email}</p>}
                </div>
              </div>

              {/* Mot de passe */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                  Mot de passe <span className="text-red-600">*</span> <span className="text-gray-500 text-xs">[1]</span>
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    id="password"
                    name="password"
                    value={data.password}
                    onChange={(e) => setData('password', e.target.value)}
                    className="mt-1 block w-full px-4 py-3 pr-10 border border-gray-300 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    autoComplete="new-password"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-3 flex items-center text-gray-400 hover:text-gray-600"
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
                {passwordError && <p className="text-sm text-red-600">{passwordError}</p>}
                {!passwordError && errors.password && <p className="text-sm text-red-600">{errors.password}</p>}
              </div>

              {/* Confirmation du mot de passe */}
              <div>
                <label htmlFor="password_confirmation" className="block text-sm font-medium text-gray-700">Confirmer le mot de passe<span className="text-red-600">*</span></label>
                <div className="relative">
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    id="password_confirmation"
                    name="password_confirmation"
                    value={data.password_confirmation}
                    onChange={(e) => setData('password_confirmation', e.target.value)}
                    className="mt-1 block w-full px-4 py-3 pr-10 border border-gray-300 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    required
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
              {/* Rôle */}
              <div className="mb-6">
                <label htmlFor="role" className="block text-sm font-medium text-gray-700">Rôle<span className="text-red-600">*</span></label>
                <select
                  id="role"
                  name="role"
                  value={data.role}
                  onChange={(e) => setData('role', e.target.value)}
                  className="mt-1 block w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  required
                >
                  <option value="">Sélectionner un rôle</option>
                  {roles.map((role) => (
                    <option key={role.id} value={role.name}>{role.name}</option>
                  ))}
                </select>
                {errors.role && <p className="text-sm text-red-600">{errors.role}</p>}
              </div>

              {/* Note sur mot de passe */}
              <p className="text-xs text-gray-500 mb-6">
                [1] Le mot de passe doit contenir au moins 10 caractères, incluant des lettres majuscules, des lettres minuscules et des chiffres.
              </p>

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
                  {processing ? 'Création...' : 'Créer l\'utilisateur'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      </AppLayout>
    </>
  );
}
