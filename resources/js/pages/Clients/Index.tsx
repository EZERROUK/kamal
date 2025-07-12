import { Head, Link, router } from '@inertiajs/react';
import { useState } from 'react';
import { PlusIcon, MagnifyingGlassIcon, BuildingOfficeIcon, TrashIcon, ArrowPathIcon } from '@heroicons/react/24/outline';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Pagination } from '@/types';
import AppLayout from '@/layouts/app-layout';
import toast from 'react-hot-toast';

interface Client {
    id: number;
    company_name: string;
    contact_name?: string;
    email: string;
    phone?: string;
    city: string;
    ice?: string;
    tax_regime: 'normal' | 'auto_entrepreneur' | 'exonere';
    is_tva_subject: boolean;
    is_active: boolean;
    deleted_at?: string;
    quotes_count: number;
    orders_count: number;
    created_at: string;
}

interface Props {
    clients: Pagination<Client>;
    filters: {
        search?: string;
        status?: string;
    };
}

export default function ClientsIndex({ clients, filters }: Props) {
    const [search, setSearch] = useState(filters.search || '');
    const [status, setStatus] = useState(filters.status || '');

    const handleSearch = () => {
        router.get(route('clients.index'), { search, status }, { preserveState: true });
    };

    const handleDelete = (client: Client) => {
        if (confirm(`Êtes-vous sûr de vouloir supprimer le client "${client.company_name}" ?`)) {
            router.delete(route('clients.destroy', client.id), {
                onSuccess: () => toast.success('Client supprimé avec succès'),
                onError: () => toast.error('Erreur lors de la suppression'),
            });
        }
    };

    const handleRestore = (client: Client) => {
        router.post(route('clients.restore', client.id), {}, {
            onSuccess: () => toast.success('Client restauré avec succès'),
            onError: () => toast.error('Erreur lors de la restauration'),
        });
    };

    const getTaxRegimeLabel = (regime: string) => {
        const labels = {
            normal: 'Normal',
            auto_entrepreneur: 'Auto-entrepreneur',
            exonere: 'Exonéré'
        };
        return labels[regime as keyof typeof labels] || regime;
    };

    return (
        <AppLayout>
            <Head title="Clients" />

            <div className="space-y-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold text-foreground">Clients</h1>
                        <p className="text-muted-foreground">
                            Gérez vos clients et leurs informations fiscales
                        </p>
                    </div>
                    <Link href={route('clients.create')}>
                        <Button>
                            <PlusIcon className="h-4 w-4 mr-2" />
                            Nouveau client
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
                                    placeholder="Rechercher par nom, email, ICE..."
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
                                    <SelectItem value="active">Actifs</SelectItem>
                                    <SelectItem value="inactive">Inactifs</SelectItem>
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
                                    <TableHead>Entreprise</TableHead>
                                    <TableHead>Contact</TableHead>
                                    <TableHead>Ville</TableHead>
                                    <TableHead>ICE</TableHead>
                                    <TableHead>Régime fiscal</TableHead>
                                    <TableHead>Devis/Commandes</TableHead>
                                    <TableHead>Statut</TableHead>
                                    <TableHead className="text-right">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {clients.data.map((client) => (
                                    <TableRow key={client.id} className={client.deleted_at ? 'opacity-60' : ''}>
                                        <TableCell>
                                            <div className="flex items-center space-x-3">
                                                <BuildingOfficeIcon className="h-5 w-5 text-muted-foreground" />
                                                <div>
                                                    <div className="font-medium">{client.company_name}</div>
                                                    <div className="text-sm text-muted-foreground">{client.email}</div>
                                                </div>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <div>
                                                <div className="font-medium">{client.contact_name || '—'}</div>
                                                <div className="text-sm text-muted-foreground">{client.phone || '—'}</div>
                                            </div>
                                        </TableCell>
                                        <TableCell>{client.city}</TableCell>
                                        <TableCell>
                                            <code className="text-xs bg-muted px-2 py-1 rounded">
                                                {client.ice || '—'}
                                            </code>
                                        </TableCell>
                                        <TableCell>
                                            <Badge variant={client.tax_regime === 'normal' ? 'default' : 'secondary'}>
                                                {getTaxRegimeLabel(client.tax_regime)}
                                            </Badge>
                                        </TableCell>
                                        <TableCell>
                                            <div className="text-sm">
                                                <span className="font-medium">{client.quotes_count}</span> devis
                                                {' • '}
                                                <span className="font-medium">{client.orders_count}</span> commandes
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            {client.deleted_at ? (
                                                <Badge variant="destructive">Supprimé</Badge>
                                            ) : (
                                                <Badge variant={client.is_active ? 'default' : 'secondary'}>
                                                    {client.is_active ? 'Actif' : 'Inactif'}
                                                </Badge>
                                            )}
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <div className="flex items-center justify-end space-x-2">
                                                {client.deleted_at ? (
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        onClick={() => handleRestore(client)}
                                                    >
                                                        <ArrowPathIcon className="h-4 w-4" />
                                                    </Button>
                                                ) : (
                                                    <>
                                                        <Link href={route('clients.show', client.id)}>
                                                            <Button variant="outline" size="sm">
                                                                Voir
                                                            </Button>
                                                        </Link>
                                                        <Link href={route('clients.edit', client.id)}>
                                                            <Button variant="outline" size="sm">
                                                                Modifier
                                                            </Button>
                                                        </Link>
                                                        <Button
                                                            variant="outline"
                                                            size="sm"
                                                            onClick={() => handleDelete(client)}
                                                        >
                                                            <TrashIcon className="h-4 w-4" />
                                                        </Button>
                                                    </>
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
                {clients.last_page > 1 && (
                    <div className="flex items-center justify-between">
                        <div className="text-sm text-muted-foreground">
                            Affichage de {clients.from} à {clients.to} sur {clients.total} clients
                        </div>
                        <div className="flex space-x-2">
                            {Array.from({ length: clients.last_page }, (_, i) => i + 1).map((page) => (
                                <Button
                                    key={page}
                                    variant={page === clients.current_page ? 'default' : 'outline'}
                                    size="sm"
                                    onClick={() => router.get(route('clients.index'), { ...filters, page })}
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