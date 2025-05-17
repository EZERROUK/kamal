import React, { useState } from 'react';
import { Head } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { Button } from '@/components/ui/button';
import { route } from 'ziggy-js';
import {
  Clock,
  User,
  Database,
  ChevronDown,
  Filter,
  X,
  SlidersHorizontal,
  Search,
  Plus,
  Minus,
  FileDown
} from 'lucide-react';

interface LoginLog {
  id: number;
  user: {
    name: string;
    email: string;
  };
  ip_address: string;
  user_agent: string;
  location: string | null;
  status: 'success' | 'failed';
  created_at: string;
}

interface PaginatedData {
  data: LoginLog[];
  current_page: number;
  per_page: number;
  total: number;
  last_page: number;
}

interface Props {
  logs: PaginatedData;
  flash?: {
    success?: string;
    error?: string;
  };
}

type FilterType = {
  field: 'user' | 'status' | 'date';
  value: string;
};

export default function Index({ logs, flash }: Props) {
  const [expandedRows, setExpandedRows] = useState<number[]>([]);
  const [showFilterPanel, setShowFilterPanel] = useState(false);
  const [currentFilterField, setCurrentFilterField] = useState<FilterType['field']>('user');
  const [currentFilterValue, setCurrentFilterValue] = useState('');
  const [activeFilters, setActiveFilters] = useState<FilterType[]>([]);

  const toggleRow = (id: number) => {
    setExpandedRows(prev =>
      prev.includes(id)
        ? prev.filter(rowId => rowId !== id)
        : [...prev, id]
    );
  };

  const filterOptions = [
    { value: 'user', label: 'Utilisateur' },
    { value: 'status', label: 'Statut' },
    { value: 'date', label: 'Date' }
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

  const handlePageChange = (page: number) => {
    window.location.href = route('login-logs.index', {
      page,
      per_page: logs.per_page
    });
  };

  const handleRowsPerPageChange = (perPage: number) => {
    window.location.href = route('login-logs.index', {
      page: 1,
      per_page: perPage
    });
  };

  return (
    <>
      <Head title="Journaux de connexion" />
      <AppLayout
        breadcrumbs={[
          { title: 'Dashboard', href: '/dashboard' },
          { title: 'Journaux de connexion', href: '/login-logs' }
        ]}
      >
        <div className="p-4">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-bold text-gray-800">Journal de connexions</h1>
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
                  <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 w-full lg:max-w-xl">
                    <h3 className="text-sm font-medium text-gray-700 mb-3 flex items-center gap-2">
                      <SlidersHorizontal className="w-4 h-4" />
                      Filtrer les journaux
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
                        <div className="flex items-center gap-2">
                          <div className="relative flex-1">
                            <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                            <input
                              type="text"
                              className="w-full border rounded-lg pl-9 pr-3 py-2 text-sm"
                              placeholder={`Filtrer par ${filterOptions.find(opt => opt.value === currentFilterField)?.label.toLowerCase()}`}
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
                      </div>
                    </div>
                  </div>
                )}

                {activeFilters.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-2">
                    {activeFilters.map((filter, index) => (
                      <div
                        key={index}
                        className="flex items-center gap-2 bg-indigo-50 text-indigo-700 px-3 py-1.5 rounded-lg text-sm"
                      >
                        <span className="font-medium">
                          {filterOptions.find(opt => opt.value === filter.field)?.label}:
                        </span>
                        <span>{filter.value}</span>
                        <button
                          onClick={() => removeFilter(index)}
                          className="text-indigo-500 hover:text-indigo-700 ml-1"
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
                    className="w-full appearance-none bg-gray-50 border border-gray-200 rounded-lg pl-4 pr-10 py-2.5 text-sm text-gray-600"
                    value={logs.per_page}
                    onChange={(e) => handleRowsPerPageChange(Number(e.target.value))}
                  >
                    {[5, 10, 20, 50].map((num) => (
                      <option key={num} value={num}>{num} lignes par page</option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-3 top-3 w-4 h-4 text-gray-400 pointer-events-none" />
                </div>

                <form action={route('login-logs.export')} method="get">
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

          <div className="bg-white rounded-lg shadow-sm overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4" />
                      Date
                    </div>
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    <div className="flex items-center gap-2">
                      <User className="w-4 h-4" />
                      Utilisateur
                    </div>
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    <div className="flex items-center gap-2">
                      Statut
                    </div>
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    <div className="flex items-center gap-2">
                      <Database className="w-4 h-4" />
                      Détails
                    </div>
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {logs.data.map((log) => (
                  <tr key={log.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(log.created_at).toLocaleString('fr-FR')}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {log.user ? (
                        <div>
                          <div className="text-sm font-medium text-gray-900">{log.user.name}</div>
                          <div className="text-sm text-gray-500">{log.user.email}</div>
                        </div>
                      ) : (
                        <span className="text-sm text-gray-500">Utilisateur inconnu</span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        log.status === 'success'
                          ? 'bg-green-100 text-green-800'
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {log.status === 'success' ? 'Réussie' : 'Échouée'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      <button
                        onClick={() => toggleRow(log.id)}
                        className="flex items-center gap-1 text-gray-600 hover:text-gray-800"
                      >
                        {expandedRows.includes(log.id) ? (
                          <Minus className="w-4 h-4" />
                        ) : (
                          <Plus className="w-4 h-4" />
                        )}
                      </button>
                      {expandedRows.includes(log.id) && (
                        <div className="mt-2 space-y-1">
                          <p>IP: {log.ip_address}</p>
                          <p>Navigateur: {log.user_agent}</p>
                          {log.location && <p>Localisation: {log.location}</p>}
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            <div className="flex justify-between items-center px-6 py-4 bg-gray-50 border-t border-gray-200">
              <span className="text-sm text-gray-600">
                Affichage de {((logs.current_page - 1) * logs.per_page) + 1} à {Math.min(logs.current_page * logs.per_page, logs.total)} sur {logs.total} résultats
              </span>

              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  disabled={logs.current_page === 1}
                  onClick={() => handlePageChange(logs.current_page - 1)}
                  className="border-gray-200 text-gray-600 hover:bg-gray-50"
                >
                  Précédent
                </Button>
                <Button
                  variant="outline"
                  disabled={logs.current_page === logs.last_page}
                  onClick={() => handlePageChange(logs.current_page + 1)}
                  className="border-gray-200 text-gray-600 hover:bg-gray-50"
                >
                  Suivant
                </Button>
              </div>
            </div>
          </div>
        </div>
      </AppLayout>
    </>
  );
}
