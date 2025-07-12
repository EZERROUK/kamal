import { Head, Link, router } from '@inertiajs/react';
import { useState } from 'react';
import { PlusIcon, MagnifyingGlassIcon, DocumentTextIcon, TrashIcon, ArrowPathIcon } from '@heroicons/react/24/outline';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Pagination } from '@/types';
import AppLayout from '@/layouts/app-layout';
import toast from 'react-hot-toast';

interface Quote {
    id: number;
    quote_number: string;
    status: string;
    quote_date: string;
    valid_until: string;
    subtotal_ht: number;
    total_tax: number;
    total_ttc: number;
    currency: {
        code: string;
        symbol: string;
    };
    client: {
        id: number;
        company_name: string;
        contact_name?: string;
    };
    user: {
        name: string;
    };
    items_count: number;
    deleted_at?: string;
}

interface Client {
    id: number;
    company_name: string;
}

interface Props {
    quotes: Pagination<Quote>;
    clients: Client[];
    filters: {
        search?: string;
        status?: string;
        client_id?: string;
    };
}

export default function QuotesIndex({ quotes, clients, filters }: Props) {
    const [search, setSearch] = useState(filters.search || '');
    const [status, setStatus] = useState(filters.status || '');
    const [clientId, setClientId] = useState(filters.client_id || '');

    const handleSearch = () => {
        router.get(route('quotes.index'), { search, status, client_id: clientId }, { preserveState: true });
    };

    const handleDelete = (quote: Quote) => {
        if (confirm(`Êtes-vous sûr de vouloir supprimer le devis "${quote.quote_number}" ?`)) {
            router.delete(route('quotes.destroy', quote.id), {
                onSuccess: () => toast.success('Devis supprimé avec succès'),
                onError: () => toast.error('Erreur lors de la suppression'),
            });
        }
    };

    const getStatusBadge = (status: string) => {
        const variants = {
            draft: 'secondary',
            sent: 'default',
            viewed: 'default',
            accepted: 'default',
            rejected: 'destructive',
            expired: 'secondary',
            converted: 'default',
        };
        return variants[status as keyof typeof variants] || 'secondary';
    };

    const getStatusLabel = (status: string) => {
        const labels = {
            draft: 'Brouillon',
            sent: 'Envoyé',
            viewed: 'Consulté',
            accepted: 'Accepté',
            rejected: 'Refusé',
            expired: 'Expiré',
            converted: 'Converti',
        };
        return labels[status as keyof typeof labels] || status;
    };

    return (
        <AppLayout>
            <Head title="Devis" />

            <div className="space-y-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold text-foreground">Devis</h1>
                        <p className="text-muted-foreground">
                            Gérez vos devis et propositions commerciales
                        </p>
                    </div>
                    <Link href={route('quotes.create')}>
                        <Button>
                            <PlusIcon className="h-4 w-4 mr-2" />
                            Nouveau devis
                        </Button>
                    </Link>
                </div>

                {/* Filters */}
                <Card>
                    <CardHeader>
                        <CardTitle className="text-lg">Filtres</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="flex gap-4">
                            <div className="flex-1">
                                <Input
                                    placeholder="Rechercher par numéro, client..."
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                    onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                                />
                            </div>
                            <Select value={status} onValueChange={setStatus}>
                                <SelectTrigger className="w-48">
                                    <SelectValue placeholder="Statut" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="">Tous</SelectItem>
                                    <SelectItem value="draft">Brouillon</SelectItem>
                                    <SelectItem value="sent">Envoyé</SelectItem>
                                    <SelectItem value="viewed">Consulté</SelectItem>
                                    <SelectItem value="accepted">Accepté</SelectItem>
                                    <SelectItem value="rejected">Refusé</SelectItem>
                                    <SelectItem value="expired">Expiré</SelectItem>
                                    <SelectItem value="converted">Converti</SelectItem>
                                </SelectContent>
                            </Select>
                            <Select value={clientId} onValueChange={setClientId}>
                                <SelectTrigger className="w-64">
                                    <SelectValue placeholder="Client" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="">Tous les clients</SelectItem>
                                    {clients.map((client) => (
                                        <SelectItem key={client.id} value={client.id.toString()}>
                                            {client.company_name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            <Button onClick={handleSearch}>
                                <MagnifyingGlassIcon className="h-4 w-4 mr-2" />
                                Rechercher
                            </Button>
                        </div>
                    </CardContent>
                </Card>

                {/* Table */}
                <Card>
                    <CardContent className="p-0">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Numéro</TableHead>
                                    <TableHead>Client</TableHead>
                                    <TableHead>Statut</TableHead>
                                    <TableHead>Date</TableHead>
                                    <TableHead>Validité</TableHead>
                                    <TableHead>Montant TTC</TableHead>
                                    <TableHead>Articles</TableHead>
                                    <TableHead className="text-right">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {quotes.data.map((quote) => (
                                    <TableRow key={quote.id} className={quote.deleted_at ? 'opacity-60' : ''}>
                                        <TableCell>
                                            <div className="flex items-center space-x-3">
                                                <DocumentTextIcon className="h-5 w-5 text-muted-foreground" />
                                                <div>
                                                    <div className="font-medium">{quote.quote_number}</div>
                                                    <div className="text-sm text-muted-foreground">
                                                        Par {quote.user.name}
                                                    </div>
                                                </div>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <div>
                                                <div className="font-medium">{quote.client.company_name}</div>
                                                {quote.client.contact_name && (
                                                    <div className="text-sm text-muted-foreground">
                                                        {quote.client.contact_name}
                                                    </div>
                                                )}
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <Badge variant={getStatusBadge(quote.status) as any}>
                                                {getStatusLabel(quote.status)}
                                            </Badge>
                                        </TableCell>
                                        <TableCell>
                                            {new Date(quote.quote_date).toLocaleDateString('fr-FR')}
                                        </TableCell>
                                        <TableCell>
                                            <div className={
                                                new Date(quote.valid_until) < new Date() && 
                                                ['sent', 'viewed'].includes(quote.status)
                                                    ? 'text-destructive font-medium'
                                                    : ''
                                            }>
                                                {new Date(quote.valid_until).toLocaleDateString('fr-FR')}
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <div className="font-medium">
                                                {quote.total_ttc.toLocaleString('fr-FR', {
                                                    style: 'currency',
                                                    currency: quote.currency.code
                                                })}
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <span className="text-sm text-muted-foreground">
                                                {quote.items_count} article{quote.items_count > 1 ? 's' : ''}
                                            </span>
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <div className="flex items-center justify-end space-x-2">
                                                <Link href={route('quotes.show', quote.id)}>
                                                    <Button variant="outline" size="sm">
                                                        Voir
                                                    </Button>
                                                </Link>
                                                {quote.status === 'draft' && (
                                                    <Link href={route('quotes.edit', quote.id)}>
                                                        <Button variant="outline" size="sm">
                                                            Modifier
                                                        </Button>
                                                    </Link>
                                                )}
                                                {['draft', 'rejected'].includes(quote.status) && (
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        onClick={() => handleDelete(quote)}
                                                    >
                                                        <TrashIcon className="h-4 w-4" />
                                                    </Button>
                                                )}
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>

                {/* Pagination */}
                {quotes.last_page > 1 && (
                    <div className="flex items-center justify-between">
                        <div className="text-sm text-muted-foreground">
                            Affichage de {quotes.from} à {quotes.to} sur {quotes.total} devis
                        </div>
                        <div className="flex space-x-2">
                            {Array.from({ length: quotes.last_page }, (_, i) => i + 1).map((page) => (
                                <Button
                                    key={page}
                                    variant={page === quotes.current_page ? 'default' : 'outline'}
                                    size="sm"
                                    onClick={() => router.get(route('quotes.index'), { ...filters, page })}
                                >
                                    {page}
                                </Button>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </AppLayout>
    );
}