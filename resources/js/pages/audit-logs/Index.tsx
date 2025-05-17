import React, { useState, useMemo, useEffect } from 'react';
import { Head, useForm } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { Button } from '@/components/ui/button';
import { route } from 'ziggy-js';
import {
  Activity,
  Clock,
  User,
  Database,
  ChevronDown,
  Filter,
  X,
  SlidersHorizontal,
  Search,
  AlertTriangle,
  Plus, Minus,
  CheckCircle,
  FileDown
} from 'lucide-react';

interface ActivityLog {
  id: number;
  description: string;
  subject_type: string;
  subject_id: number;
  causer: {
    name: string;
    email: string;
  } | null;
  properties: any;
  created_at: string;
}

interface PaginatedData {
  data: ActivityLog[];
  current_page: number;
  per_page: number;
  total: number;
}

interface Props {
  logs: PaginatedData;
  flash?: {
    success?: string;
    error?: string;
  };
}

type SortDirection = 'asc' | 'desc';

type FilterType = {
  field: 'user' | 'action' | 'date';
  value: string;
};

export default function Index({ logs, flash }: Props) {
  const [expandedRows, setExpandedRows] = useState<number[]>([]);
  const [rowsPerPage, setRowsPerPage] = useState(logs.per_page);
  const [currentPage, setCurrentPage] = useState(1);
  const [sortField, setSortField] = useState<'created_at' | 'description' | 'user'>('created_at');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');
  const [activeFilters, setActiveFilters] = useState<FilterType[]>([]);
  const [showFilterPanel, setShowFilterPanel] = useState(false);
  const [currentFilterField, setCurrentFilterField] = useState<FilterType['field']>('user');
  const [currentFilterValue, setCurrentFilterValue] = useState('');
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);
  const [showErrorMessage, setShowErrorMessage] = useState(false);

  const toggleRow = (id: number) => {
    setExpandedRows(prev =>
      prev.includes(id)
        ? prev.filter(rowId => rowId !== id)
        : [...prev, id]
    );
  };

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
    { value: 'user', label: 'Utilisateur' },
    { value: 'action', label: 'Action' },
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

  const filteredLogs = useMemo(() => {
    return logs.data.filter(log => {
      return activeFilters.every(filter => {
        switch (filter.field) {
          case 'user':
            return log.causer?.name.toLowerCase().includes(filter.value.toLowerCase()) ||
                   log.causer?.email.toLowerCase().includes(filter.value.toLowerCase());
          case 'action':
            return log.description.toLowerCase().includes(filter.value.toLowerCase()) ||
                   log.subject_type.toLowerCase().includes(filter.value.toLowerCase());
          case 'date':
            const logDate = new Date(log.created_at).toLocaleDateString('fr-FR');
            return logDate.includes(filter.value);
          default:
            return true;
        }
      });
    });
  }, [logs.data, activeFilters]);

  const sortedLogs = useMemo(() => {
    return [...filteredLogs].sort((a, b) => {
      switch (sortField) {
        case 'created_at':
          return sortDirection === 'asc'
            ? new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
            : new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
        case 'description':
          return sortDirection === 'asc'
            ? a.description.localeCompare(b.description)
            : b.description.localeCompare(a.description);
        case 'user':
          const aName = a.causer?.name || '';
          const bName = b.causer?.name || '';
          return sortDirection === 'asc'
            ? aName.localeCompare(bName)
            : bName.localeCompare(aName);
        default:
          return 0;
      }
    });
  }, [filteredLogs, sortField, sortDirection]);

  const paginatedLogs = useMemo(() => {
    const startIndex = (currentPage - 1) * rowsPerPage;
    return sortedLogs.slice(startIndex, startIndex + rowsPerPage);
  }, [sortedLogs, currentPage, rowsPerPage]);

  const totalPages = Math.max(1, Math.ceil(sortedLogs.length / rowsPerPage));

  // Ensure currentPage is valid whenever totalPages changes
  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(Math.max(1, totalPages));
    }
  }, [totalPages, currentPage]);

  const changeSort = (field: typeof sortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  return (
    <>
      <Head title="Journal d'activités" />
      <AppLayout
        breadcrumbs={[
          { title: 'Dashboard', href: '/dashboard' },
          { title: 'Journal d\'activités', href: '/audit-logs' }
        ]}
      >
        <div className="p-4">
          {/* Success and Error Messages */}
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
            <h1 className="text-2xl font-bold text-gray-800">Journal d'activités</h1>
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
                      Filtrer les activités
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

                <form action={route('audit-logs.export')} method="get">
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
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                      onClick={() => changeSort('created_at')}
                    >
                      <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4" />
                        Date
                        {sortField === 'created_at' && (
                          <span className="inline-block transition-transform duration-200">
                            {sortDirection === 'asc' ? '▲' : '▼'}
                          </span>
                        )}
                      </div>
                    </th>
                    <th
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                      onClick={() => changeSort('user')}
                    >
                      <div className="flex items-center gap-2">
                        <User className="w-4 h-4" />
                        Utilisateur
                        {sortField === 'user' && (
                          <span className="inline-block transition-transform duration-200">
                            {sortDirection === 'asc' ? '▲' : '▼'}
                          </span>
                        )}
                      </div>
                    </th>
                    <th
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                      onClick={() => changeSort('description')}
                    >
                      <div className="flex items-center gap-2">
                        <Activity className="w-4 h-4" />
                        Action
                        {sortField === 'description' && (
                          <span className="inline-block transition-transform duration-200">
                            {sortDirection === 'asc' ? '▲' : '▼'}
                          </span>
                        )}
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
                  {paginatedLogs.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="px-4 py-8 text-center text-gray-500">
                        <div className="flex flex-col items-center justify-center gap-2">
                          <X className="w-8 h-8 text-gray-400" />
                          <p>Aucune activité trouvée.</p>
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
                    paginatedLogs.map((activity) => (
                      <tr key={activity.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {new Date(activity.created_at).toLocaleString('fr-FR')}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {activity.causer ? (
                            <div className="text-sm font-medium text-gray-900">
                              {activity.causer.name}
                              <div className="text-sm text-gray-500">
                                {activity.causer.email}
                              </div>
                            </div>
                          ) : (
                            <span className="text-sm text-gray-500">Système</span>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="text-sm text-gray-900">
                            {activity.description}
                          </span>
                          <div className="text-sm text-gray-500">
                            {activity.subject_type} #{activity.subject_id}
                          </div>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-500">
                        {activity.properties && Object.keys(activity.properties).length > 0 && (
                            <div>
                            <button
                                onClick={() => toggleRow(activity.id)}
                                className="flex items-center gap-1 text-gray-600 hover:text-gray-800"
                            >
                                {expandedRows.includes(activity.id) ? (
                                <Minus className="w-4 h-4" />
                                ) : (
                                <Plus className="w-4 h-4" />
                                )}
                            </button>
                            {expandedRows.includes(activity.id) && (
                                <pre className="mt-2 text-xs p-2 rounded bg-gray-50 border border-gray-200 overflow-auto max-w-lg">
                                {JSON.stringify(activity.properties, null, 2)}
                                </pre>
                            )}
                            </div>
                        )}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            <div className="flex flex-col sm:flex-row justify-between items-center px-6 py-4 bg-gray-50 border-t border-gray-200 gap-4">
              <span className="text-sm text-gray-600">
                Affichage de {sortedLogs.length > 0 ? Math.min((currentPage - 1) * rowsPerPage + 1, sortedLogs.length) : 0} à {Math.min(currentPage * rowsPerPage, sortedLogs.length)} sur {sortedLogs.length} résultats
              </span>

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
            </div>
          </div>
        </div>
      </AppLayout>
    </>
  );
}
