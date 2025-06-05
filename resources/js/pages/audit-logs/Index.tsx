import React, { useMemo, useState } from 'react';
import { Head, router } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { Button } from '@/components/ui/button';
import { route } from 'ziggy-js';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { fr } from 'date-fns/locale';
import {
  Activity, Clock, User, Database,
  Filter, X, Search, Plus, Minus, FileDown,
  ChevronDown,
  ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight,
  SlidersHorizontal,
} from 'lucide-react';

interface ActivityLog {
  id: number;
  description: string;
  subject_type: string;
  subject_id: string;
  causer: { name: string; email: string } | null;
  properties: Record<string, any> | null;
  created_at: string;
}

interface Props {
  logs: {
    data: ActivityLog[];
    current_page: number;
    last_page: number;
    from: number;
    to: number;
    total: number;
    per_page: number;
  };
  filters?: {
    user?: string;
    action?: string;
    search?: string;
    start_date?: string;
    end_date?: string;
    sort?: string;
    direction?: string;
    per_page?: number;
  };
}

export default function AuditLogsIndex({ logs, filters = {} }: Props) {
  const [showFilters, setShowFilters] = useState(false);
  const [field, setField] = useState<'search' | 'user' | 'action' | 'date'>('search');
  const [query, setQuery] = useState('');
  const [startDate, setStartDate] = useState<Date | null>(
    filters.start_date ? new Date(filters.start_date) : null
  );
  const [endDate, setEndDate] = useState<Date | null>(
    filters.end_date ? new Date(filters.end_date) : null
  );
  const [expanded, setExpanded] = useState<number[]>([]);

  const hasFilter = useMemo(
    () => Boolean(filters.user || filters.action || filters.search || filters.start_date || filters.end_date),
    [filters],
  );

  const windowPages = useMemo(() => {
    const win = 5;
    const { current_page: c, last_page: l } = logs;
    const out: (number | '…')[] = [];
    const push = (v: number | '…') => out.push(v);

    if (l <= win + 2) {
      for (let i = 1; i <= l; i++) push(i);
    } else {
      push(1);
      const s = Math.max(2, c - 1);
      const e = Math.min(l - 1, c + 1);
      if (s > 2) push('…');
      for (let i = s; i <= e; i++) push(i);
      if (e < l - 1) push('…');
      push(l);
    }
    return out;
  }, [logs]);

  const inertiaOpts = { preserveScroll: true, preserveState: true, only: ['logs', 'filters'] } as const;

  const applyFilters = () => {
    const payload: Record<string, any> = { ...filters, page: 1 };
    if (field === 'date') {
      if (startDate) payload.start_date = startDate.toISOString();
      if (endDate) payload.end_date = endDate.toISOString();
    } else if (query.trim()) {
      payload[field] = query.trim();
    }
    router.get(route('audit-logs.index'), payload, inertiaOpts);
  };

  const resetFilters = () =>
    router.get(route('audit-logs.index'), { per_page: logs.per_page }, inertiaOpts);

  const changePage = (p: number) =>
    router.get(route('audit-logs.index'), { ...filters, page: p }, inertiaOpts);

  const changePer = (n: number) =>
    router.get(route('audit-logs.index'), { ...filters, per_page: n, page: 1 }, inertiaOpts);

  const exportCsv = () => window.open(route('audit-logs.export', filters), '_blank');

  const toggleRow = (id: number) =>
    setExpanded(prev => (prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]));

  return (
    <AppLayout
      breadcrumbs={[
        { title: 'Dashboard', href: '/dashboard' },
        { title: 'Journaux d’activité', href: '/audit-logs' },
      ]}
    >
      <Head title="Journal d'activités" />

      <div className="p-4">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-gray-800">Journal d'activités</h1>
        </div>

        <div className="bg-white p-4 rounded-lg shadow-sm mb-6">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div className="flex flex-col gap-4 w-full lg:w-auto">
              <div className="flex items-center gap-3">
                <Button
                  onClick={() => setShowFilters(!showFilters)}
                  className={`flex items-center gap-2 ${
                    showFilters
                      ? 'bg-gray-600 text-white hover:bg-gray-700'
                      : 'bg-gray-50 text-gray-600 hover:bg-gray-100'}`}
                >
                  <Filter className="w-4 h-4" />
                  {showFilters ? 'Masquer les filtres' : 'Afficher les filtres'}
                </Button>

                {hasFilter && (
                  <Button
                    onClick={resetFilters}
                    variant="outline"
                    className="border-gray-200 text-gray-600 hover:bg-gray-50 flex items-center gap-1.5"
                  >
                    <X className="w-4 h-4" />
                    Effacer
                  </Button>
                )}
              </div>

              {showFilters && (
                <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 w-full lg:max-w-xl">
                  <h3 className="text-sm font-medium text-gray-700 mb-3 flex items-center gap-2">
                    <SlidersHorizontal className="w-4 h-4" />
                    Filtrer les journaux
                  </h3>

                  {field !== 'date' ? (
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <div className="relative">
                        <select
                          value={field}
                          onChange={e => setField(e.target.value as any)}
                          className="w-full appearance-none bg-white border border-gray-200 rounded-lg pl-4 pr-10 py-2 text-sm text-gray-700"
                        >
                          <option value="search">Plein texte</option>
                          <option value="user">Utilisateur</option>
                          <option value="action">Action</option>
                          <option value="date">Plage de dates</option>
                        </select>
                        <ChevronDown className="absolute right-3 top-3 w-4 h-4 text-gray-400 pointer-events-none" />
                      </div>

                      <div className="sm:col-span-2 flex items-center gap-2">
                        <div className="relative flex-1">
                          <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                          <input
                            value={query}
                            onChange={e => setQuery(e.target.value)}
                            onKeyDown={e => e.key === 'Enter' && applyFilters()}
                            placeholder={`Filtrer par ${field}`}
                            className="w-full border rounded-lg pl-9 pr-3 py-2 text-sm"
                          />
                        </div>
                        <Button disabled={!query.trim()} onClick={applyFilters}>Appliquer</Button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex flex-wrap items-center gap-3">
                      <DatePicker
                        selected={startDate}
                        onChange={d => setStartDate(d)}
                        selectsStart startDate={startDate} endDate={endDate}
                        showTimeSelect timeIntervals={15} dateFormat="Pp" locale={fr}
                        placeholderText="Date début"
                        className="border rounded-lg px-3 py-2 text-sm"
                      />
                      <span className="text-gray-500">à</span>
                      <DatePicker
                        selected={endDate}
                        onChange={d => setEndDate(d)}
                        selectsEnd startDate={startDate} endDate={endDate} minDate={startDate}
                        showTimeSelect timeIntervals={15} dateFormat="Pp" locale={fr}
                        placeholderText="Date fin"
                        className="border rounded-lg px-3 py-2 text-sm"
                      />
                      <Button disabled={!startDate || !endDate} onClick={applyFilters}>Appliquer</Button>
                    </div>
                  )}
                </div>
              )}
            </div>

            <div className="flex flex-wrap items-center gap-3 ml-auto">
              <div className="relative min-w-[220px]">
                <select
                  className="w-full appearance-none bg-gray-50 border border-gray-200 rounded-lg pl-4 pr-10 py-2.5 text-sm text-gray-600"
                  value={logs.per_page}
                  onChange={e => changePer(Number(e.target.value))}
                >
                  {[5, 10, 20, 50].map(n => (
                    <option key={n} value={n}>{n} lignes par page</option>
                  ))}
                </select>
                <ChevronDown className="absolute right-3 top-3 w-4 h-4 text-gray-400 pointer-events-none" />
              </div>

              <Button
                onClick={exportCsv}
                variant="secondary"
                className="bg-gray-50 border border-gray-200 text-gray-700 hover:bg-gray-100 flex items-center gap-2"
              >
                <FileDown className="w-4 h-4" />
                Exporter
              </Button>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50 text-xs font-medium text-gray-500 uppercase tracking-wider">
              <tr>
                <th className="px-6 py-3 text-left"><div className="flex items-center gap-2"><Clock className="w-4 h-4" /> Date</div></th>
                <th className="px-6 py-3 text-left"><div className="flex items-center gap-2"><User className="w-4 h-4" /> Utilisateur</div></th>
                <th className="px-6 py-3 text-left"><div className="flex items-center gap-2"><Activity className="w-4 h-4" /> Action</div></th>
                <th className="px-6 py-3 text-left"><div className="flex items-center gap-2"><Database className="w-4 h-4" /> Détails</div></th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200 text-sm">
              {logs.data.length === 0 && (
                <tr><td colSpan={4} className="px-6 py-8 text-center text-gray-500">Aucune activité trouvée.</td></tr>
              )}
              {logs.data.map(log => (
                <tr key={log.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-gray-600">
                    {new Date(log.created_at).toLocaleString('fr-FR')}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {log.causer ? (
                      <>
                        <div className="text-sm font-medium text-gray-900">{log.causer.name}</div>
                        <div className="text-sm text-gray-500">{log.causer.email}</div>
                      </>
                    ) : (
                      <span className="text-sm text-gray-500">Système</span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">{log.description}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {log.properties && (
                      <>
                        <button
                          onClick={() => toggleRow(log.id)}
                          className="text-gray-600 hover:text-gray-800 flex items-center gap-1"
                        >
                          {expanded.includes(log.id) ? <Minus className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
                        </button>
                        {expanded.includes(log.id) && (
                          <pre className="mt-2 bg-gray-50 border border-gray-200 p-2 rounded text-xs whitespace-pre-wrap">
                            {JSON.stringify(log.properties, null, 2)}
                          </pre>
                        )}
                      </>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          <div className="flex justify-between items-center px-6 py-4 bg-gray-50 border-t border-gray-200 text-sm text-gray-600">
            <span>
              Affichage de {logs.from} à {logs.to} sur {logs.total} résultats
            </span>

            <div className="flex items-center gap-1">
              <Button size="sm" variant="outline" disabled={logs.current_page === 1} onClick={() => changePage(1)} aria-label="Première page"><ChevronsLeft className="w-4 h-4" /></Button>
              <Button size="sm" variant="outline" disabled={logs.current_page === 1} onClick={() => changePage(logs.current_page - 1)} aria-label="Page précédente"><ChevronLeft className="w-4 h-4" /></Button>

              {windowPages.map((p, idx) =>
                p === '…' ? (
                  <span key={idx} className="px-2 select-none">…</span>
                ) : (
                  <Button key={p} size="sm" variant={p === logs.current_page ? 'default' : 'outline'} onClick={() => changePage(p as number)}>{p}</Button>
                )
              )}

              <Button size="sm" variant="outline" disabled={logs.current_page === logs.last_page} onClick={() => changePage(logs.current_page + 1)} aria-label="Page suivante"><ChevronRight className="w-4 h-4" /></Button>
              <Button size="sm" variant="outline" disabled={logs.current_page === logs.last_page} onClick={() => changePage(logs.last_page)} aria-label="Dernière page"><ChevronsRight className="w-4 h-4" /></Button>
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
