import { Head, Link } from '@inertiajs/react';
import { ArrowLeftIcon, PencilIcon, DocumentTextIcon, ShoppingCartIcon } from '@heroicons/react/24/outline';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import AppLayout from '@/layouts/app-layout';

interface Client {
    id: number;
    company_name: string;
    contact_name?: string;
    email: string;
    phone?: string;
    address: string;
    city: string;
    postal_code?: string;
    country: string;
    ice?: string;
    rc?: string;
    patente?: string;
    cnss?: string;
    if_number?: string;
    tax_regime: 'normal' | 'auto_entrepreneur' | 'exonere';
    is_tva_subject: boolean;
    is_active: boolean;
    notes?: string;
    created_at: string;
    quotes: Array<{
        id: number;
        quote_number: string;
        status: string;
        total_ttc: number;
        currency_code: string;
        created_at: string;
    }>;
    orders: Array<{
        id: number;
        order_number: string;
        status: string;
        total_ttc: number;
        currency_code: string;
        created_at: string;
    }>;
}

interface Props {
    client: Client;
}

export default function ClientShow({ client }: Props) {
    const getTaxRegimeLabel = (regime: string) => {
        const labels = {
            normal: 'Normal',
            auto_entrepreneur: 'Auto-entrepreneur',
            exonere: 'Exonéré'
        };
        return labels[regime as keyof typeof labels] || regime;
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
            pending: 'secondary',
            confirmed: 'default',
            processing: 'default',
            shipped: 'default',
            delivered: 'default',
            cancelled: 'destructive',
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
            pending: 'En attente',
            confirmed: 'Confirmé',
            processing: 'En cours',
            shipped: 'Expédié',
            delivered: 'Livré',
            cancelled: 'Annulé',
        };
        return labels[status as keyof typeof labels] || status;
    };

    return (
        <AppLayout>
            <Head title={client.company_name} />

            <div className="space-y-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                        <Button variant="outline" size="sm" onClick={() => window.history.back()}>
                            <ArrowLeftIcon className="h-4 w-4 mr-2" />
                            Retour
                        </Button>
                        <div>
                            <h1 className="text-3xl font-bold text-foreground">{client.company_name}</h1>
                            <p className="text-muted-foreground">
                                {client.contact_name && `Contact: ${client.contact_name} • `}
                                Créé le {new Date(client.created_at).toLocaleDateString('fr-FR')}
                            </p>
                        </div>
                    </div>
                    <div className="flex items-center space-x-2">
                        <Link href={route('quotes.create', { client_id: client.id })}>
                            <Button>
                                <DocumentTextIcon className="h-4 w-4 mr-2" />
                                Nouveau devis
                            </Button>
                        </Link>
                        <Link href={route('clients.edit', client.id)}>
                            <Button variant="outline">
                                <PencilIcon className="h-4 w-4 mr-2" />
                                Modifier
                            </Button>
                        </Link>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Informations principales */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Contact */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Informations de contact</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <div className="text-sm font-medium text-muted-foreground">Email</div>
                                        <div>{client.email}</div>
                                    </div>
                                    <div>
                                        <div className="text-sm font-medium text-muted-foreground">Téléphone</div>
                                        <div>{client.phone || '—'}</div>
                                    </div>
                                </div>
                                <div>
                                    <div className="text-sm font-medium text-muted-foreground">Adresse</div>
                                    <div className="whitespace-pre-line">
                                        {client.address}
                                        {client.postal_code && `\n${client.postal_code} `}{client.city}
                                        {client.country !== 'Maroc' && `\n${client.country}`}
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Informations fiscales */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Informations fiscales</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <div className="text-sm font-medium text-muted-foreground">ICE</div>
                                        <div className="font-mono text-sm">
                                            {client.ice || '—'}
                                        </div>
                                    </div>
                                    <div>
                                        <div className="text-sm font-medium text-muted-foreground">Registre de Commerce</div>
                                        <div>{client.rc || '—'}</div>
                                    </div>
                                    <div>
                                        <div className="text-sm font-medium text-muted-foreground">Patente</div>
                                        <div>{client.patente || '—'}</div>
                                    </div>
                                    <div>
                                        <div className="text-sm font-medium text-muted-foreground">CNSS</div>
                                        <div>{client.cnss || '—'}</div>
                                    </div>
                                    <div>
                                        <div className="text-sm font-medium text-muted-foreground">Identifiant Fiscal</div>
                                        <div>{client.if_number || '—'}</div>
                                    </div>
                                    <div>
                                        <div className="text-sm font-medium text-muted-foreground">Régime fiscal</div>
                                        <Badge variant="outline">
                                            {getTaxRegimeLabel(client.tax_regime)}
                                        </Badge>
                                    </div>
                                </div>
                                <div>
                                    <div className="text-sm font-medium text-muted-foreground">TVA</div>
                                    <Badge variant={client.is_tva_subject ? 'default' : 'secondary'}>
                                        {client.is_tva_subject ? 'Assujetti à la TVA' : 'Non assujetti à la TVA'}
                                    </Badge>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Notes */}
                        {client.notes && (
                            <Card>
                                <CardHeader>
                                    <CardTitle>Notes internes</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="whitespace-pre-line text-sm">
                                        {client.notes}
                                    </div>
                                </CardContent>
                            </Card>
                        )}
                    </div>

                    {/* Sidebar */}
                    <div className="space-y-6">
                        {/* Statut */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Statut</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <Badge variant={client.is_active ? 'default' : 'secondary'}>
                                    {client.is_active ? 'Actif' : 'Inactif'}
                                </Badge>
                            </CardContent>
                        </Card>

                        {/* Statistiques */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Statistiques</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="flex items-center justify-between">
                                    <span className="text-sm text-muted-foreground">Devis</span>
                                    <span className="font-medium">{client.quotes.length}</span>
                                </div>
                                <div className="flex items-center justify-between">
                                    <span className="text-sm text-muted-foreground">Commandes</span>
                                    <span className="font-medium">{client.orders.length}</span>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </div>

                {/* Devis récents */}
                {client.quotes.length > 0 && (
                    <Card>
                        <CardHeader>
                            <CardTitle>Devis récents</CardTitle>
                        </CardHeader>
                        <CardContent className="p-0">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Numéro</TableHead>
                                        <TableHead>Statut</TableHead>
                                        <TableHead>Montant</TableHead>
                                        <TableHead>Date</TableHead>
                                        <TableHead className="text-right">Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {client.quotes.map((quote) => (
                                        <TableRow key={quote.id}>
                                            <TableCell className="font-medium">
                                                {quote.quote_number}
                                            </TableCell>
                                            <TableCell>
                                                <Badge variant={getStatusBadge(quote.status) as any}>
                                                    {getStatusLabel(quote.status)}
                                                </Badge>
                                            </TableCell>
                                            <TableCell>
                                                {quote.total_ttc.toLocaleString('fr-FR', {
                                                    style: 'currency',
                                                    currency: quote.currency_code
                                                })}
                                            </TableCell>
                                            <TableCell>
                                                {new Date(quote.created_at).toLocaleDateString('fr-FR')}
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <Link href={route('quotes.show', quote.id)}>
                                                    <Button variant="outline" size="sm">
                                                        Voir
                                                    </Button>
                                                </Link>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </CardContent>
                    </Card>
                )}

                {/* Commandes récentes */}
                {client.orders.length > 0 && (
                    <Card>
                        <CardHeader>
                            <CardTitle>Commandes récentes</CardTitle>
                        </CardHeader>
                        <CardContent className="p-0">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Numéro</TableHead>
                                        <TableHead>Statut</TableHead>
                                        <TableHead>Montant</TableHead>
                                        <TableHead>Date</TableHead>
                                        <TableHead className="text-right">Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {client.orders.map((order) => (
                                        <TableRow key={order.id}>
                                            <TableCell className="font-medium">
                                                {order.order_number}
                                            </TableCell>
                                            <TableCell>
                                                <Badge variant={getStatusBadge(order.status) as any}>
                                                    {getStatusLabel(order.status)}
                                                </Badge>
                                            </TableCell>
                                            <TableCell>
                                                {order.total_ttc.toLocaleString('fr-FR', {
                                                    style: 'currency',
                                                    currency: order.currency_code
                                                })}
                                            </TableCell>
                                            <TableCell>
                                                {new Date(order.created_at).toLocaleDateString('fr-FR')}
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <Link href={route('orders.show', order.id)}>
                                                    <Button variant="outline" size="sm">
                                                        Voir
                                                    </Button>
                                                </Link>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </CardContent>
                    </Card>
                )}
            </div>
        </AppLayout>
    );
}