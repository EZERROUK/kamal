import React, { useMemo, useState } from 'react';
import { Head, Link, useForm } from '@inertiajs/react';
import { PageProps, User } from '@/types';
import AppLayout from '@/layouts/app-layout';
import { Button } from '@/components/ui/button';
import { route } from 'ziggy-js';
import {
    Eye,
  Pencil,
  Trash2,
  RotateCcw,
  UserPlus,
  FileDown,
  ChevronDown,
  Filter,
  X,
  SlidersHorizontal
} from 'lucide-react';

type Props = PageProps<{
  users: User[];
  roles: string[];
  flash?: string;
}>;

type SortDirection = 'asc' | 'desc';

type FilterType = {
  field: 'name' | 'email' | 'role' | 'status';
  value: string;
};

export default function UsersIndex({ users, roles, flash }: Props) {
  const { delete: destroy, post } = useForm({});
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);
  const [sortField, setSortField] = useState<keyof User | 'status'>('name');
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc');
  const [selectedUserIds, setSelectedUserIds] = useState<number[]>([]);
  const [selectingDisabled, setSelectingDisabled] = useState(false);

  const [activeFilters, setActiveFilters] = useState<FilterType[]>([]);
  const [showFilterPanel, setShowFilterPanel] = useState(false);
  const [currentFilterField, setCurrentFilterField] = useState<FilterType['field']>('name');
  const [currentFilterValue, setCurrentFilterValue] = useState('');

  const filterOptions = [
    { value: 'name', label: 'Nom' },
    { value: 'email', label: 'Email' },
    { value: 'role', label: 'Rôle' },
    { value: 'status', label: 'Statut' }
  ];

  const addFilter = () => {
    if (currentFilterValue) {
      setActiveFilters(prev => [...prev, { field: currentFilterField, value: currentFilterValue }]);
      setCurrentFilterValue('');
    }
  };

  const removeFilter = (index: number) => {
    setActiveFilters(prev => prev.filter((_, i) => i !== index));
  };

  const clearAllFilters = () => {
    setActiveFilters([]);
  };

  const filteredUsers = useMemo(() => {
    return users.filter((user: { name: string; email: string; roles: any[]; deleted_at: any; }) => {
      return activeFilters.every(filter => {
        switch (filter.field) {
          case 'name':
            return user.name.toLowerCase().includes(filter.value.toLowerCase());
          case 'email':
            return user.email.toLowerCase().includes(filter.value.toLowerCase());
          case 'role':
            return user.roles?.some((role: { name: string; }) =>
              role.name.toLowerCase() === filter.value.toLowerCase()
            );
          case 'status':
            if (filter.value.toLowerCase() === 'actif') {
              return !user.deleted_at;
            } else if (filter.value.toLowerCase() === 'désactivé') {
              return !!user.deleted_at;
            }
            return true;
          default:
            return true;
        }
      });
    });
  }, [users, activeFilters]);

  const sortedUsers = useMemo(() => {
    return [...filteredUsers].sort((a, b) => {
      // Special handling for status field which is derived from deleted_at
      if (sortField === 'status') {
        const aIsActive = !a.deleted_at;
        const bIsActive = !b.deleted_at;

        // If sorting by status, active users come first in ascending order
        const compare = aIsActive === bIsActive ? 0 : aIsActive ? -1 : 1;
        return sortDirection === 'asc' ? compare : -compare;
      }

      // Handle other fields
      const aValue = a[sortField as keyof typeof a];
      const bValue = b[sortField as keyof typeof b];

      if (aValue === undefined || bValue === undefined) return 0;

      const compare =
        typeof aValue === 'string'
          ? aValue.localeCompare(bValue as string)
          : aValue > bValue
          ? 1
          : -1;

      return sortDirection === 'asc' ? compare : -compare;
    });
  }, [filteredUsers, sortField, sortDirection]);

  const paginatedUsers = useMemo(() => {
    if (rowsPerPage === -1) {
      return sortedUsers; // Return all users
    }
    const startIndex = (currentPage - 1) * rowsPerPage;
    return sortedUsers.slice(startIndex, startIndex + rowsPerPage);
  }, [sortedUsers, currentPage, rowsPerPage]);

  const totalPages = useMemo(
    () => (rowsPerPage === -1 ? 1 : Math.ceil(filteredUsers.length / rowsPerPage)),
    [filteredUsers.length, rowsPerPage]
  );

  const changeSort = (field: keyof User | 'status') => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const deleteUser = (id: number) => {
    if (confirm('Voulez-vous vraiment supprimer cet utilisateur ?')) {
      destroy(route('users.destroy', { id }), {
        method: 'delete',
      });
    }
  };

  const restoreUser = (id: number) => {
    if (confirm('Voulez-vous restaurer cet utilisateur ?')) {
      post(route('users.restore', { id }), {
        preserveScroll: true,
      });
    }
  };

  const deleteSelectedUsers = () => {
    if (selectedUserIds.length === 0) return;
    if (confirm(`Voulez-vous vraiment supprimer ${selectedUserIds.length} utilisateur(s) ?`)) {
      selectedUserIds.forEach((id) => {
        destroy(route('users.destroy', { id }), {
          method: 'delete',
          preserveScroll: true,
        });
      });
      setSelectedUserIds([]);
    }
  };

  const restoreSelectedUsers = () => {
    if (selectedUserIds.length === 0) return;
    if (confirm(`Voulez-vous vraiment restaurer ${selectedUserIds.length} utilisateur(s) ?`)) {
      selectedUserIds.forEach((id) => {
        post(route('users.restore', { id }), {
          preserveScroll: true,
        });
      });
      setSelectedUserIds([]);
    }
  };

  const toggleSelectUser = (id: number) => {
    const user = users.find((user: { id: number; }) => user.id === id);
    const isActive = !user?.deleted_at;

    if (isActive) {
      if (selectedUserIds.some((selectedId) => users.find((user: { id: number; }) => user.id === selectedId)?.deleted_at)) {
        alert('Vous ne pouvez pas sélectionner des utilisateurs actifs avec des utilisateurs désactivés');
        return;
      }
    } else {
      if (selectedUserIds.some((selectedId) => !users.find((user: { id: number; }) => user.id === selectedId)?.deleted_at)) {
        alert('Vous ne pouvez pas sélectionner des utilisateurs désactivés avec des utilisateurs actifs');
        return;
      }
    }

    setSelectedUserIds((prev) =>
      prev.includes(id) ? prev.filter((userId) => userId !== id) : [...prev, id]
    );
  };

  const toggleSelectAll = () => {
    const firstSelectedUser = paginatedUsers[0];
    const firstUserActive = !firstSelectedUser?.deleted_at;

    if (firstUserActive) {
      const newSelected = paginatedUsers
        .filter((user) => !user.deleted_at)
        .map((user) => user.id);
      setSelectedUserIds(newSelected);
    } else {
      const newSelected = paginatedUsers
        .filter((user) => user.deleted_at)
        .map((user) => user.id);
      setSelectedUserIds(newSelected);
    }
  };

  const allSelected = selectedUserIds.length === paginatedUsers.length && paginatedUsers.length > 0;
  const anySelectedInactive = selectedUserIds.some((id) => users.find((user: { id: number; }) => user.id === id)?.deleted_at);
  const anySelectedActive = selectedUserIds.some((id) => !users.find((user: { id: number; }) => user.id === id)?.deleted_at);

  return (
    <>
      <Head title="Utilisateurs" />
      <AppLayout
        breadcrumbs={[{ title: 'Dashboard', href: '/dashboard' }, { title: 'Utilisateurs', href: '/users' }]}
      >
        <div className="p-4">
          {flash && (
            <div className="mb-4 p-3 rounded bg-green-100 text-green-800 border border-green-300">
              {flash}
            </div>
          )}

          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-bold text-gray-800">Liste des utilisateurs</h1>
            <div className="flex items-center gap-2">
              {selectedUserIds.length > 0 && (
                <>
                  {anySelectedInactive && (
                    <Button variant="secondary" onClick={restoreSelectedUsers}>
                      Restaurer sélection
                    </Button>
                  )}
                  {anySelectedActive && (
                    <Button variant="destructive" onClick={deleteSelectedUsers}>
                      Supprimer sélection
                    </Button>
                  )}
                </>
              )}
              <Link href="/users/create">
                <Button className="bg-gray-600 hover:bg-gray-700">
                  <UserPlus className="w-4 h-4" />
                  Ajouter un utilisateur
                </Button>
              </Link>
            </div>
          </div>

          <div className="bg-white p-4 rounded-lg shadow-sm mb-6">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div className="flex flex-col gap-4 w-full lg:w-auto">
                <div className="flex items-center gap-3">
                  <Button
                    onClick={() => setShowFilterPanel(!showFilterPanel)}
                    className={`flex items-center gap-2 ${showFilterPanel ? 'bg-gray-600 text-white hover:bg-gray-700' : 'bg-gray-50 text-gray-600 hover:bg-gray-100'}`}
                  >
                    <Filter className="w-4 h-4" />
                    {showFilterPanel ? 'Masquer les filtres' : 'Afficher les filtres'}
                  </Button>

                  {activeFilters.length > 0 && (
                    <Button
                      onClick={clearAllFilters}
                      variant="outline"
                      className="border-gray-200 text-gray-600 hover:bg-gray-50 flex items-center gap-1.5"
                    >
                      <X className="w-4 h-4" />
                      Effacer tous les filtres
                    </Button>
                  )}
                </div>

                {showFilterPanel && (
                  <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 w-full lg:max-w-xl transition-all duration-200 ease-in-out">
                    <h3 className="text-sm font-medium text-gray-700 mb-3 flex items-center gap-2">
                      <SlidersHorizontal className="w-4 h-4" />
                      Filtrer les utilisateurs
                    </h3>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-3">
                      <div>
                        <select
                          className="w-full border rounded-lg px-3 py-2 text-sm bg-white"
                          value={currentFilterField}
                          onChange={(e) => setCurrentFilterField(e.target.value as FilterType['field'])}
                        >
                          {filterOptions.map(option => (
                            <option key={option.value} value={option.value}>
                              {option.label}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div className="sm:col-span-2">
                        {currentFilterField === 'status' ? (
                          <select
                            className="w-full border rounded-lg px-3 py-2 text-sm bg-white"
                            value={currentFilterValue}
                            onChange={(e) => setCurrentFilterValue(e.target.value)}
                          >
                            <option value="">Sélectionner un statut</option>
                            <option value="actif">Actif</option>
                            <option value="désactivé">Désactivé</option>
                          </select>
                        ) : currentFilterField === 'role' ? (
                          <select
                            className="w-full border rounded-lg px-3 py-2 text-sm bg-white"
                            value={currentFilterValue}
                            onChange={(e) => setCurrentFilterValue(e.target.value)}
                          >
                            <option value="">Sélectionner un rôle</option>
                            {roles.map((role: boolean | React.ReactElement<unknown, string | React.JSXElementConstructor<any>> | Iterable<React.ReactNode> | Promise<string | number | bigint | boolean | React.ReactPortal | React.ReactElement<unknown, string | React.JSXElementConstructor<any>> | Iterable<React.ReactNode> | null | undefined> | React.Key | null | undefined) => (
                              <option key={role} value={role}>{role}</option>
                            ))}
                          </select>
                        ) : (
                          <div className="flex items-center gap-2">
                            <input
                              type="text"
                              className="w-full border rounded-lg px-3 py-2 text-sm"
                              placeholder={`Filtrer par ${currentFilterField}`}
                              value={currentFilterValue}
                              onChange={(e) => setCurrentFilterValue(e.target.value)}
                              onKeyDown={(e) => {
                                if (e.key === 'Enter' && currentFilterValue) {
                                  addFilter();
                                }
                              }}
                            />
                            <Button
                              onClick={addFilter}
                              disabled={!currentFilterValue}
                              className="whitespace-nowrap"
                            >
                              Ajouter
                            </Button>
                          </div>
                        )}
                      </div>
                    </div>

                    {(currentFilterField === 'status' || currentFilterField === 'role') && (
                      <Button
                        onClick={addFilter}
                        disabled={!currentFilterValue}
                        className="w-full sm:w-auto"
                      >
                        Ajouter le filtre
                      </Button>
                    )}
                  </div>
                )}

                {activeFilters.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-2">
                    {activeFilters.map((filter, index) => (
                      <div
                        key={index}
                        className="flex items-center gap-2 bg-indigo-50 text-indigo-700 px-3 py-1.5 rounded-lg text-sm transition-all duration-150 hover:bg-indigo-100"
                      >
                        <span className="font-medium">
                          {filterOptions.find(opt => opt.value === filter.field)?.label}:
                        </span>
                        <span>{filter.value}</span>
                        <button
                          onClick={() => removeFilter(index)}
                          className="text-indigo-500 hover:text-indigo-700 ml-1 focus:outline-none"
                          aria-label={`Supprimer le filtre ${filter.field}`}
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="flex flex-wrap items-center gap-3 ml-auto">
                <div className="relative min-w-[220px]">
                  <select
                    className="w-full appearance-none bg-gray-50 border border-gray-200 rounded-lg pl-4 pr-10 py-2.5 text-sm text-gray-600 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    value={rowsPerPage}
                    onChange={(e) => {
                      setRowsPerPage(Number(e.target.value));
                      setCurrentPage(1);
                    }}
                  >
                    {[5, 10, 20, 50].map((num) => (
                      <option key={num} value={num}>{num} lignes par page</option>
                    ))}
                    <option value={-1}>Tous les enregistrements</option>
                  </select>
                  <ChevronDown className="absolute right-3 top-3 w-4 h-4 text-gray-400 pointer-events-none" />
                </div>

                <form action={route('users.export')} method="get">
                  <Button
                    type="submit"
                    variant="secondary"
                    className="bg-gray-50 border border-gray-200 text-gray-700 hover:bg-gray-100 flex items-center gap-2"
                  >
                    <FileDown className="w-4 h-4" />
                    Exporter
                  </Button>
                </form>
              </div>
            </div>
          </div>

          <div className="bg-white overflow-hidden rounded-lg shadow-sm">
            <table className="min-w-full divide-y divide-gray-200 text-sm">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3">
                    <input
                      type="checkbox"
                      checked={allSelected}
                      onChange={toggleSelectAll}
                      className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                    />
                  </th>
                  <th
                    className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                    onClick={() => changeSort('name')}
                  >
                    <div className="flex items-center gap-1">
                      Nom
                      {sortField === 'name' && (
                        <span className="inline-block transition-transform duration-200">
                          {sortDirection === 'asc' ? '▲' : '▼'}
                        </span>
                      )}
                    </div>
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Rôle</th>
                  <th
                    className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                    onClick={() => changeSort('status')}
                  >
                    <div className="flex justify-center items-center gap-1">
                    Statut
                    {sortField === 'status' && (
                    <span className="inline-block transition-transform duration-200">
                        {sortDirection === 'asc' ? '▲' : '▼'}
                    </span>
                    )}
                </div>
                  </th>
                  <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 bg-white">
                {paginatedUsers.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-4 py-4 text-center text-gray-500">
                      Aucun utilisateur trouvé.
                    </td>
                  </tr>
                ) : (
                  paginatedUsers.map((user) => (
                    <tr
                      key={user.id}
                      className={`${user.deleted_at ? 'bg-red-50' : ''} transition-colors duration-150 hover:bg-gray-50`}
                    >
                      <td className="px-4 py-3 whitespace-nowrap text-center">
                        <input
                          type="checkbox"
                          checked={selectedUserIds.includes(user.id)}
                          onChange={() => toggleSelectUser(user.id)}
                          disabled={selectingDisabled && !user.deleted_at}
                          className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                        />
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap font-medium text-gray-900 ">{user.name}</td>
                      <td className="px-4 py-3 whitespace-nowrap text-gray-500">{user.email}</td>
                      <td className="px-4 py-3 whitespace-nowrap text-gray-500">
                        {user.roles?.map((role: { name: any; }) => role.name).join(', ') || 'Aucun rôle'}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap min-w-[100px] text-center">
                        {user.deleted_at ? (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                            Désactivé
                          </span>
                        ) : (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                            Actif
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-center">
  <div className="flex justify-center gap-2">
    {user.deleted_at ? (
      <button
        onClick={() => restoreUser(user.id)}
        className="text-gray-600 hover:text-gray-900 transition-colors duration-150"
        aria-label="Restaurer l'utilisateur"
      >
        <RotateCcw className="w-5 h-5" />
      </button>
    ) : (
      <>
        <Link
          href={route('users.show', user.id)}
          className="text-blue-600 hover:text-blue-900 transition-colors duration-150"
          aria-label="Voir l'utilisateur"
        >
          <Eye className="w-5 h-5" />
        </Link>
        <Link
          href={route('users.edit', user.id)}
          className="text-yellow-600 hover:text-yellow-900 transition-colors duration-150"
          aria-label="Éditer l'utilisateur"
        >
          <Pencil className="w-5 h-5" />
        </Link>
        <button
          onClick={() => deleteUser(user.id)}
          className="text-red-600 hover:text-red-900 transition-colors duration-150"
          aria-label="Supprimer l'utilisateur"
        >
          <Trash2 className="w-5 h-5" />
        </button>
      </>
    )}
  </div>
</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          <div className="flex justify-between items-center mt-4 bg-white p-4 rounded-lg shadow-sm">
            <span className="text-sm text-gray-600">
              {rowsPerPage === -1 ? (
                `Affichage de tous les ${filteredUsers.length} résultats`
              ) : (
                `Affichage de ${Math.min((currentPage - 1) * rowsPerPage + 1, filteredUsers.length)} à ${Math.min(currentPage * rowsPerPage, filteredUsers.length)} sur ${filteredUsers.length} résultats`
              )}
            </span>
            {rowsPerPage !== -1 && totalPages > 1 && (
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage(currentPage - 1)}
                  className="border-gray-200 text-gray-600 hover:bg-gray-50 transition-colors duration-150"
                >
                  Précédent
                </Button>

                <Button
                  variant="outline"
                  disabled={currentPage === totalPages}
                  onClick={() => setCurrentPage(currentPage + 1)}
                  className="border-gray-200 text-gray-600 hover:bg-gray-50 transition-colors duration-150"
                >
                  Suivant
                </Button>
              </div>
            )}
          </div>
        </div>
      </AppLayout>
    </>
  );
}
