import React, { useMemo, useState, useEffect } from 'react';
import { Head, Link, useForm, router } from '@inertiajs/react';
import { PageProps } from '@/types';
import AppLayout from '@/layouts/app-layout';
import { Button } from '@/components/ui/button';
import { route } from 'ziggy-js';
import {
  Pencil,
  Trash2,
  RotateCcw,
  Plus,
  ChevronDown,
  Filter,
  X,
  SlidersHorizontal,
  AlertTriangle,
  CheckCircle,
  Search
} from 'lucide-react';

interface Permission {
  id: number;
  name: string;
  deleted_at: string | null;
}

type Props = PageProps<{
  permissions: Permission[];
  isSuperAdmin: boolean;
  flash?: {
    success?: string;
    error?: string;
  };
}>;

type SortDirection = 'asc' | 'desc';

type FilterType = {
  field: 'name' | 'status';
  value: string;
};

export default function PermissionsIndex({ permissions, isSuperAdmin, flash }: Props) {
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);
  const [sortField, setSortField] = useState<keyof Permission | 'status'>('name');
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc');
  const [selectedPermissionIds, setSelectedPermissionIds] = useState<number[]>([]);
  const [activeFilters, setActiveFilters] = useState<FilterType[]>([]);
  const [showFilterPanel, setShowFilterPanel] = useState(false);
  const [currentFilterField, setCurrentFilterField] = useState<FilterType['field']>('name');
  const [currentFilterValue, setCurrentFilterValue] = useState('');
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);
  const [showErrorMessage, setShowErrorMessage] = useState(false);

  // Auto-hide flash messages after 5 seconds
  useEffect(() => {
    if (flash?.success) {
      setShowSuccessMessage(true);
      const timer = setTimeout(() => {
        setShowSuccessMessage(false);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [flash?.success]);

  useEffect(() => {
    if (flash?.error) {
      setShowErrorMessage(true);
      const timer = setTimeout(() => {
        setShowErrorMessage(false);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [flash?.error]);

  const filterOptions = [
    { value: 'name', label: 'Nom' },
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

  const handleDelete = async (id: number) => {
    if (confirm('Voulez-vous vraiment supprimer cette permission ?')) {
      try {
        await router.delete(route('permissions.destroy', { id }), {
          preserveScroll: true,
          onSuccess: (page) => {
            if (page.props.flash?.success) {
              setSelectedPermissionIds(prev => prev.filter(permId => permId !== id));
            }
          },
          onError: (errors) => {
            const errorMessage = Object.values(errors).flat()[0] || 'Une erreur est survenue lors de la suppression';
            alert(errorMessage);
          }
        });
      } catch (error) {
        alert('Une erreur est survenue lors de la suppression.');
      }
    }
  };

  const filteredPermissions = useMemo(() => {
    return permissions.filter(permission => {
      return activeFilters.every(filter => {
        switch (filter.field) {
          case 'name':
            return permission.name.toLowerCase().includes(filter.value.toLowerCase());
          case 'status':
            if (filter.value.toLowerCase() === 'active') {
              return !permission.deleted_at;
            } else if (filter.value.toLowerCase() === 'désactivée') {
              return !!permission.deleted_at;
            }
            return true;
          default:
            return true;
        }
      });
    });
  }, [permissions, activeFilters]);

  const sortedPermissions = useMemo(() => {
    return [...filteredPermissions].sort((a, b) => {
      if (sortField === 'status') {
        const aIsActive = !a.deleted_at;
        const bIsActive = !b.deleted_at;
        const compare = aIsActive === bIsActive ? 0 : aIsActive ? -1 : 1;
        return sortDirection === 'asc' ? compare : -compare;
      }

      const aValue = a[sortField as keyof typeof a];
      const bValue = b[sortField as keyof typeof b];

      if (aValue === undefined || bValue === undefined) return 0;

      const compare = typeof aValue === 'string'
        ? aValue.localeCompare(bValue as string)
        : aValue > bValue ? 1 : -1;

      return sortDirection === 'asc' ? compare : -compare;
    });
  }, [filteredPermissions, sortField, sortDirection]);

  const paginatedPermissions = useMemo(() => {
    if (rowsPerPage === -1) {
      return sortedPermissions;
    }
    const startIndex = (currentPage - 1) * rowsPerPage;
    return sortedPermissions.slice(startIndex, startIndex + rowsPerPage);
  }, [sortedPermissions, currentPage, rowsPerPage]);

  const totalPages = useMemo(
    () => (rowsPerPage === -1 ? 1 : Math.ceil(filteredPermissions.length / rowsPerPage)),
    [filteredPermissions.length, rowsPerPage]
  );

  const changeSort = (field: keyof Permission | 'status') => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const restorePermission = (id: number) => {
    if (confirm('Voulez-vous restaurer cette permission ?')) {
      router.post(route('permissions.restore', { id }), {}, {
        preserveScroll: true,
        onSuccess: () => {
          setSelectedPermissionIds(prev => prev.filter(permId => permId !== id));
        },
        onError: () => {
          alert('Une erreur est survenue lors de la restauration.');
        }
      });
    }
  };

  const deleteSelectedPermissions = () => {
    if (selectedPermissionIds.length === 0) return;

    if (confirm(`Voulez-vous vraiment supprimer ${selectedPermissionIds.length} permission(s) ?`)) {
      const promises = selectedPermissionIds.map(id =>
        router.delete(route('permissions.destroy', { id }), {
          preserveScroll: true,
        })
      );

      Promise.all(promises)
        .then(() => {
          setSelectedPermissionIds([]);
        })
        .catch(() => {
          alert('Une erreur est survenue lors de la suppression de certaines permissions.');
        });
    }
  };

  const restoreSelectedPermissions = () => {
    if (selectedPermissionIds.length === 0) return;

    if (confirm(`Voulez-vous vraiment restaurer ${selectedPermissionIds.length} permission(s) ?`)) {
      const promises = selectedPermissionIds.map(id =>
        router.post(route('permissions.restore', { id }), {}, {
          preserveScroll: true,
        })
      );

      Promise.all(promises)
        .then(() => {
          setSelectedPermissionIds([]);
        })
        .catch(() => {
          alert('Une erreur est survenue lors de la restauration de certaines permissions.');
        });
    }
  };

  const toggleSelectPermission = (id: number) => {
    const permission = permissions.find(permission => permission.id === id);
    const isActive = !permission?.deleted_at;

    if (isActive) {
      if (selectedPermissionIds.some(selectedId => permissions.find(p => p.id === selectedId)?.deleted_at)) {
        alert('Vous ne pouvez pas sélectionner des permissions actives avec des permissions désactivées');
        return;
      }
    } else {
      if (selectedPermissionIds.some(selectedId => !permissions.find(p => p.id === selectedId)?.deleted_at)) {
        alert('Vous ne pouvez pas sélectionner des permissions désactivées avec des permissions actives');
        return;
      }
    }

    setSelectedPermissionIds(prev =>
      prev.includes(id) ? prev.filter(permissionId => permissionId !== id) : [...prev, id]
    );
  };

  const toggleSelectAll = () => {
    if (paginatedPermissions.length === 0) return;

    if (selectedPermissionIds.length === paginatedPermissions.length) {
      // Deselect all if all are currently selected
      setSelectedPermissionIds([]);
    } else {
      // Only select permissions of the same status (active or inactive)
      const firstPermission = paginatedPermissions[0];
      const isFirstActive = !firstPermission.deleted_at;

      const newSelected = paginatedPermissions
        .filter(permission => !permission.deleted_at === isFirstActive)
        .map(permission => permission.id);

      setSelectedPermissionIds(newSelected);
    }
  };

  const allSelected = selectedPermissionIds.length > 0 &&
                      paginatedPermissions.length > 0 &&
                      paginatedPermissions.every(p => selectedPermissionIds.includes(p.id));

  const anySelectedInactive = selectedPermissionIds.some(id => permissions.find(p => p.id === id)?.deleted_at);
  const anySelectedActive = selectedPermissionIds.some(id => !permissions.find(p => p.id === id)?.deleted_at);

  return (
    <>
      <Head title="Permissions" />
      <AppLayout
        breadcrumbs={[
          { title: 'Dashboard', href: '/dashboard' },
          { title: 'Permissions', href: '/permissions' }
        ]}
      >
        <div className="p-4">
          {/* Success and Error Messages with animations */}
          {flash?.success && showSuccessMessage && (
            <div className="mb-4 p-4 rounded-lg bg-green-50 border border-green-200 text-green-800 flex items-start gap-3 animate-fade-in">
              <CheckCircle className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
              <div className="flex-1">
                <p className="font-medium">{flash.success}</p>
              </div>
              <button onClick={() => setShowSuccessMessage(false)} className="text-green-500 hover:text-green-700">
                <X className="w-5 h-5" />
              </button>
            </div>
          )}

          {flash?.error && showErrorMessage && (
            <div className="mb-4 p-4 rounded-lg bg-red-50 border border-red-200 text-red-800 flex items-start gap-3 animate-fade-in">
              <AlertTriangle className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" />
              <div className="flex-1">
                <p className="font-medium">{flash.error}</p>
              </div>
              <button onClick={() => setShowErrorMessage(false)} className="text-red-500 hover:text-red-700">
                <X className="w-5 h-5" />
              </button>
            </div>
          )}

          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-bold text-gray-800">Liste des permissions</h1>
            <div className="flex items-center gap-2">
              {selectedPermissionIds.length > 0 && (
                <>
                  {anySelectedInactive && (
                    <Button
                      variant="secondary"
                      onClick={restoreSelectedPermissions}
                      className="flex items-center gap-1.5"
                    >
                      <RotateCcw className="w-4 h-4" />
                      Restaurer ({selectedPermissionIds.length})
                    </Button>
                  )}
                  {anySelectedActive && (
                    <Button
                      variant="destructive"
                      onClick={deleteSelectedPermissions}
                      className="flex items-center gap-1.5"
                    >
                      <Trash2 className="w-4 h-4" />
                      Supprimer ({selectedPermissionIds.length})
                    </Button>
                  )}
                </>
              )}
              <Link href={route('permissions.create')}>
                <Button className="bg-gray-600 hover:bg-gray-700 transition-colors">
                  <Plus className="w-4 h-4"/>
                  Ajouter une permission
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
                    className={`flex items-center gap-2 transition-colors ${showFilterPanel ? 'bg-gray-600 text-white hover:bg-gray-700' : 'bg-gray-50 text-gray-600 hover:bg-gray-100'}`}
                  >
                    <Filter className="w-4 h-4" />
                    {showFilterPanel ? 'Masquer les filtres' : 'Afficher les filtres'}
                  </Button>

                  {activeFilters.length > 0 && (
                    <Button
                      onClick={clearAllFilters}
                      variant="outline"
                      className="border-gray-200 text-gray-600 hover:bg-gray-50 flex items-center gap-1.5 transition-colors"
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
                      Filtrer les permissions
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
                            <option value="active">Active</option>
                            <option value="désactivée">Désactivée</option>
                          </select>
                        ) : (
                          <div className="flex items-center gap-2">
                            <div className="relative flex-1">
                              <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                              <input
                                type="text"
                                className="w-full border rounded-lg pl-9 pr-3 py-2 text-sm"
                                placeholder={`Filtrer par ${currentFilterField}`}
                                value={currentFilterValue}
                                onChange={(e) => setCurrentFilterValue(e.target.value)}
                                onKeyDown={(e) => {
                                  if (e.key === 'Enter' && currentFilterValue) {
                                    addFilter();
                                  }
                                }}
                              />
                            </div>
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

                    {currentFilterField === 'status' && (
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
              </div>
            </div>
          </div>

          <div className="bg-white overflow-hidden rounded-lg shadow-sm">
            <table className="min-w-full divide-y divide-gray-200 text-sm">
              <thead className="bg-gray-50">
                <tr>
                <th className="w-auto px-1 py-1 text-center">
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
                  <th
                    className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer w-[100px]"
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
                  <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider w-[150px]">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 bg-white">
                {paginatedPermissions.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="px-4 py-8 text-center text-gray-500">
                      <div className="flex flex-col items-center justify-center gap-2">
                        <X className="w-8 h-8 text-gray-400" />
                        <p>Aucune permission trouvée.</p>
                        {activeFilters.length > 0 && (
                          <Button
                            variant="outline"
                            onClick={clearAllFilters}
                            className="mt-2 text-sm"
                          >
                            Effacer les filtres
                          </Button>
                        )}
                      </div>
                    </td>
                  </tr>
                ) : (
                  paginatedPermissions.map((permission) => (
                    <tr
                      key={permission.id}
                      className={`${permission.deleted_at ? 'bg-red-50' : ''} transition-colors duration-150 hover:bg-gray-50`}
                    >
                      <td className="w-auto px-1 py-1 text-center">
                        <input
                          type="checkbox"
                          checked={selectedPermissionIds.includes(permission.id)}
                          onChange={() => toggleSelectPermission(permission.id)}
                          className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                        />
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap font-medium text-gray-900">
                        {permission.name}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap min-w-[100px] text-center">
                        {permission.deleted_at ? (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                            Désactivée
                          </span>
                        ) : (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                            Active
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-center min-w-[150px]">
                        <div className="flex justify-center gap-2">
                          {permission.deleted_at ? (
                            isSuperAdmin && (
                              <button
                                onClick={() => restorePermission(permission.id)}
                                className="text-gray-600 hover:text-gray-900 transition-colors duration-150 p-1 rounded-full hover:bg-gray-100"
                                aria-label="Restaurer la permission"
                              >
                                <RotateCcw className="w-5 h-5" />
                              </button>
                            )
                          ) : (
                            <>
                              <Link
                                href={route('permissions.edit', permission.id)}
                                className="text-yellow-600 hover:text-yellow-900 transition-colors duration-150 p-1 rounded-full hover:bg-yellow-50"
                                aria-label="Éditer la permission"
                              >
                                <Pencil className="w-5 h-5" />
                              </Link>
                              <button
                                onClick={() => handleDelete(permission.id)}
                                className="text-red-600 hover:text-red-900 transition-colors duration-150 p-1 rounded-full hover:bg-red-50"
                                aria-label="Supprimer la permission"
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

          <div className="flex flex-col sm:flex-row justify-between items-center mt-4 bg-white p-4 rounded-lg shadow-sm gap-4">
            <span className="text-sm text-gray-600">
              {rowsPerPage === -1 ? (
                `Affichage de tous les ${filteredPermissions.length} résultats`
              ) : (
                `Affichage de ${Math.min((currentPage - 1) * rowsPerPage + 1, filteredPermissions.length)} à ${Math.min(currentPage * rowsPerPage, filteredPermissions.length)} sur ${filteredPermissions.length} résultats`
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
                <div className="flex items-center gap-1">
                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    let pageNum;
                    if (totalPages <= 5) {
                      pageNum = i + 1;
                    } else if (currentPage <= 3) {
                      pageNum = i + 1;
                    } else if (currentPage >= totalPages - 2) {
                      pageNum = totalPages - 4 + i;
                    } else {
                      pageNum = currentPage - 2 + i;
                    }

                    return (
                      <Button
                        key={pageNum}
                        variant={currentPage === pageNum ? "default" : "outline"}
                        onClick={() => setCurrentPage(pageNum)}
                        className={`w-10 h-10 p-0 ${currentPage === pageNum ? 'bg-gray-600 hover:bg-gray-700' : 'border-gray-200 text-gray-600 hover:bg-gray-50'}`}
                      >
                        {pageNum}
                      </Button>
                    );
                  })}
                </div>
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
