import { Head, Link, router } from '@inertiajs/react';
import { useState } from 'react';
import { 
    ArrowLeftIcon, 
    PencilIcon, 
    DocumentArrowDownIcon,
    ArrowPathIcon,
    DocumentDuplicateIcon,
    ShoppingCartIcon,
    ChatBubbleLeftRightIcon
} from '@heroicons/react/24/outline';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
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
    terms_conditions?: string;
    notes?: string;
    internal_notes?: string;
    can_be_converted: boolean;
    client: {
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
        tax_regime: string;
        is_tva_subject: boolean;
    };
    currency: {
        code: string;
        symbol: string;
    };
    user: {
        name: string;
    };
    items: Array<{
        id: number;
        product_name_snapshot: string;
        product_description_snapshot?: string;
        product_sku_snapshot?: string;
        quantity: number;
        unit_price_ht_snapshot: number;
        tax_rate_snapshot: number;
        line_total_ht: number;
        line_tax_amount: number;
        line_total_ttc: number;
        product?: {
            id: string;
            name: string;
        };
    }>;
    status_histories: Array<{
        id: number;
        from_status?: string;
        to_status: string;
        comment?: string;
        created_at: string;
        user?: {
            name: string;
        };
    }>;
    order?: {
        id: number;
        order_number: string;
    };
}

interface Props {
    quote: Quote;
}

export default function QuoteShow({ quote }: Props) {
    const [statusComment, setStatusComment] = useState('');
    const [newStatus, setNewStatus] = useState('');
    const [showStatusDialog, setShowStatusDialog] = useState(false);

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

    const getAvailableTransitions = () => {
        const transitions = {
            draft: [
                { value: 'sent', label: 'Marquer comme envoyé' },
                { value: 'rejected', label: 'Rejeter' }
            ],
            sent: [
                { value: 'viewed', label: 'Marquer comme consulté' },
                { value: 'accepted', label: 'Accepter' },
                { value: 'rejected', label: 'Rejeter' },
                { value: 'expired', label: 'Marquer comme expiré' }
            ],
            viewed: [
                { value: 'accepted', label: 'Accepter' },
                { value: 'rejected', label: 'Rejeter' },
                { value: 'expired', label: 'Marquer comme expiré' }
            ],
            accepted: [
                { value: 'converted', label: 'Convertir en commande' }
            ],
            expired: [
                { value: 'sent', label: 'Renvoyer' }
            ]
        };
        return transitions[quote.status as keyof typeof transitions] || [];
    };

    const handleStatusChange = () => {
        if (!newStatus) return;

        router.post(route('quotes.change-status', quote.id), {
            status: newStatus,
            comment: statusComment
        }, {
            onSuccess: () => {
                toast.success('Statut mis à jour avec succès');
                setShowStatusDialog(false);
                setStatusComment('');
                setNewStatus('');
            },
            onError: () => toast.error('Erreur lors de la mise à jour du statut')
        });
    };

    const handleConvertToOrder = () => {
        if (confirm('Êtes-vous sûr de vouloir convertir ce devis en commande ?')) {
            router.post(route('quotes.convert-to-order', quote.id), {}, {
                onSuccess: () => toast.success('Devis converti en commande avec succès'),
                onError: () => toast.error('Erreur lors de la conversion')
            });
        }
    };

    const handleDuplicate = () => {
        router.post(route('quotes.duplicate', quote.id), {}, {
            onSuccess: () => toast.success('Devis dupliqué avec succès'),
            onError: () => toast.error('Erreur lors de la duplication')
        });
    };

    const handleExportPDF = () => {
        window.open(route('quotes.export-pdf', quote.id), '_blank');
    };

    const isExpired = new Date(quote.valid_until) < new Date() && ['sent', 'viewed'].includes(quote.status);

    return (
        <AppLayout>
            <Head title={`Devis ${quote.quote_number}`} />

            <div className="space-y-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                        <Button variant="outline" size="sm" onClick={() => window.history.back()}>
                            <ArrowLeftIcon className="h-4 w-4 mr-2" />
                            Retour
                        </Button>
                        <div>
                            <h1 className="text-3xl font-bold text-foreground">
                                Devis {quote.quote_number}
                            </h1>
                            <p className="text-muted-foreground">
                                {quote.client.company_name} • Créé par {quote.user.name}
                            </p>
                        </div>
                    </div>
                    <div className="flex items-center space-x-2">
                        <Button variant="outline" onClick={handleExportPDF}>
                            <DocumentArrowDownIcon className="h-4 w-4 mr-2" />
                            Export PDF
                        </Button>
                        <Button variant="outline" onClick={handleDuplicate}>
                            <DocumentDuplicateIcon className="h-4 w-4 mr-2" />
                            Dupliquer
                        </Button>
                        {quote.status === 'draft' && (
                            <Link href={route('quotes.edit', quote.id)}>
                                <Button variant="outline">
                                    <PencilIcon className="h-4 w-4 mr-2" />
                                    Modifier
                                </Button>
                            </Link>
                        )}
                        {quote.can_be_converted && (
                            <Button onClick={handleConvertToOrder}>
                                <ShoppingCartIcon className="h-4 w-4 mr-2" />
                                Convertir en commande
                            </Button>
                        )}
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Contenu principal */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Informations client */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Informations client</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <div className="font-medium">{quote.client.company_name}</div>
                                        {quote.client.contact_name && (
                                            <div className="text-sm text-muted-foreground">
                                                Contact: {quote.client.contact_name}
                                            </div>
                                        )}
                                        <div className="text-sm">{quote.client.email}</div>
                                        {quote.client.phone && (
                                            <div className="text-sm">{quote.client.phone}</div>
                                        )}
                                    </div>
                                    <div>
                                        <div className="text-sm whitespace-pre-line">
                                            {quote.client.address}
                                            {quote.client.postal_code && `\n${quote.client.postal_code} `}
                                            {quote.client.city}
                                            {quote.client.country !== 'Maroc' && `\n${quote.client.country}`}
                                        </div>
                                    </div>
                                </div>
                                {quote.client.ice && (
                                    <div className="pt-2 border-t">
                                        <div className="text-sm text-muted-foreground">
                                            ICE: <span className="font-mono">{quote.client.ice}</span>
                                            {quote.client.rc && ` • RC: ${quote.client.rc}`}
                                            {quote.client.patente && ` • Patente: ${quote.client.patente}`}
                                        </div>
                                    </div>
                                )}
                            </CardContent>
                        </Card>

                        {/* Articles */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Articles</CardTitle>
                            </CardHeader>
                            <CardContent className="p-0">
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Produit</TableHead>
                                            <TableHead className="text-right">Qté</TableHead>
                                            <TableHead className="text-right">Prix HT</TableHead>
                                            <TableHead className="text-right">TVA</TableHead>
                                            <TableHead className="text-right">Total TTC</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {quote.items.map((item) => (
                                            <TableRow key={item.id}>
                                                <TableCell>
                                                    <div>
                                                        <div className="font-medium">
                                                            {item.product_name_snapshot}
                                                        </div>
                                                        {item.product_sku_snapshot && (
                                                            <div className="text-sm text-muted-foreground">
                                                                SKU: {item.product_sku_snapshot}
                                                            </div>
                                                        )}
                                                        {item.product_description_snapshot && (
                                                            <div className="text-sm text-muted-foreground mt-1">
                                                                {item.product_description_snapshot}
                                                            </div>
                                                        )}
                                                    </div>
                                                </TableCell>
                                                <TableCell className="text-right">
                                                    {item.quantity}
                                                </TableCell>
                                                <TableCell className="text-right">
                                                    {item.unit_price_ht_snapshot.toLocaleString('fr-FR', {
                                                        style: 'currency',
                                                        currency: quote.currency.code
                                                    })}
                                                </TableCell>
                                                <TableCell className="text-right">
                                                    {item.tax_rate_snapshot}%
                                                </TableCell>
                                                <TableCell className="text-right font-medium">
                                                    {item.line_total_ttc.toLocaleString('fr-FR', {
                                                        style: 'currency',
                                                        currency: quote.currency.code
                                                    })}
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </CardContent>
                        </Card>

                        {/* Totaux */}
                        <Card>
                            <CardContent className="pt-6">
                                <div className="space-y-2">
                                    <div className="flex justify-between">
                                        <span>Sous-total HT:</span>
                                        <span className="font-medium">
                                            {quote.subtotal_ht.toLocaleString('fr-FR', {
                                                style: 'currency',
                                                currency: quote.currency.code
                                            })}
                                        </span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span>TVA:</span>
                                        <span className="font-medium">
                                            {quote.total_tax.toLocaleString('fr-FR', {
                                                style: 'currency',
                                                currency: quote.currency.code
                                            })}
                                        </span>
                                    </div>
                                    <div className="flex justify-between text-lg font-bold border-t pt-2">
                                        <span>Total TTC:</span>
                                        <span>
                                            {quote.total_ttc.toLocaleString('fr-FR', {
                                                style: 'currency',
                                                currency: quote.currency.code
                                            })}
                                        </span>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Conditions et notes */}
                        {(quote.terms_conditions || quote.notes) && (
                            <Card>
                                <CardHeader>
                                    <CardTitle>Conditions et notes</CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    {quote.terms_conditions && (
                                        <div>
                                            <div className="text-sm font-medium text-muted-foreground mb-2">
                                                Conditions générales
                                            </div>
                                            <div className="text-sm whitespace-pre-line">
                                                {quote.terms_conditions}
                                            </div>
                                        </div>
                                    )}
                                    {quote.notes && (
                                        <div>
                                            <div className="text-sm font-medium text-muted-foreground mb-2">
                                                Notes
                                            </div>
                                            <div className="text-sm whitespace-pre-line">
                                                {quote.notes}
                                            </div>
                                        </div>
                                    )}
                                </CardContent>
                            </Card>
                        )}
                    </div>

                    {/* Sidebar */}
                    <div className="space-y-6">
                        {/* Statut et actions */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Statut</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="flex items-center justify-between">
                                    <Badge variant={getStatusBadge(quote.status) as any} className="text-sm">
                                        {getStatusLabel(quote.status)}
                                    </Badge>
                                    {isExpired && (
                                        <Badge variant="destructive" className="text-xs">
                                            Expiré
                                        </Badge>
                                    )}
                                </div>

                                {getAvailableTransitions().length > 0 && (
                                    <Dialog open={showStatusDialog} onOpenChange={setShowStatusDialog}>
                                        <DialogTrigger asChild>
                                            <Button variant="outline" className="w-full">
                                                <ArrowPathIcon className="h-4 w-4 mr-2" />
                                                Changer le statut
                                            </Button>
                                        </DialogTrigger>
                                        <DialogContent>
                                            <DialogHeader>
                                                <DialogTitle>Changer le statut du devis</DialogTitle>
                                            </DialogHeader>
                                            <div className="space-y-4">
                                                <div>
                                                    <Label htmlFor="new_status">Nouveau statut</Label>
                                                    <Select value={newStatus} onValueChange={setNewStatus}>
                                                        <SelectTrigger>
                                                            <SelectValue placeholder="Sélectionner un statut" />
                                                        </SelectTrigger>
                                                        <SelectContent>
                                                            {getAvailableTransitions().map((transition) => (
                                                                <SelectItem key={transition.value} value={transition.value}>
                                                                    {transition.label}
                                                                </SelectItem>
                                                            ))}
                                                        </SelectContent>
                                                    </Select>
                                                </div>
                                                <div>
                                                    <Label htmlFor="comment">Commentaire (optionnel)</Label>
                                                    <Textarea
                                                        id="comment"
                                                        value={statusComment}
                                                        onChange={(e) => setStatusComment(e.target.value)}
                                                        placeholder="Ajouter un commentaire..."
                                                    />
                                                </div>
                                                <div className="flex justify-end space-x-2">
                                                    <Button variant="outline" onClick={() => setShowStatusDialog(false)}>
                                                        Annuler
                                                    </Button>
                                                    <Button onClick={handleStatusChange} disabled={!newStatus}>
                                                        Confirmer
                                                    </Button>
                                                </div>
                                            </div>
                                        </DialogContent>
                                    </Dialog>
                                )}
                            </CardContent>
                        </Card>

                        {/* Informations */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Informations</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="space-y-2 text-sm">
                                    <div className="flex justify-between">
                                        <span className="text-muted-foreground">Date:</span>
                                        <span>{new Date(quote.quote_date).toLocaleDateString('fr-FR')}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-muted-foreground">Validité:</span>
                                        <span className={isExpired ? 'text-destructive font-medium' : ''}>
                                            {new Date(quote.valid_until).toLocaleDateString('fr-FR')}
                                        </span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-muted-foreground">Articles:</span>
                                        <span>{quote.items.length}</span>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Commande liée */}
                        {quote.order && (
                            <Card>
                                <CardHeader>
                                    <CardTitle>Commande liée</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <Link href={route('orders.show', quote.order.id)}>
                                        <Button variant="outline" className="w-full">
                                            <ShoppingCartIcon className="h-4 w-4 mr-2" />
                                            {quote.order.order_number}
                                        </Button>
                                    </Link>
                                </CardContent>
                            </Card>
                        )}

                        {/* Notes internes */}
                        {quote.internal_notes && (
                            <Card>
                                <CardHeader>
                                    <CardTitle>Notes internes</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="text-sm whitespace-pre-line bg-muted p-3 rounded">
                                        {quote.internal_notes}
                                    </div>
                                </CardContent>
                            </Card>
                        )}

                        {/* Historique */}
                        {quote.status_histories.length > 0 && (
                            <Card>
                                <CardHeader>
                                    <CardTitle>Historique</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-3">
                                        {quote.status_histories.map((history) => (
                                            <div key={history.id} className="text-sm">
                                                <div className="flex items-center justify-between">
                                                    <Badge variant="outline" className="text-xs">
                                                        {getStatusLabel(history.to_status)}
                                                    </Badge>
                                                    <span className="text-xs text-muted-foreground">
                                                        {new Date(history.created_at).toLocaleDateString('fr-FR')}
                                                    </span>
                                                </div>
                                                {history.user && (
                                                    <div className="text-xs text-muted-foreground mt-1">
                                                        Par {history.user.name}
                                                    </div>
                                                )}
                                                {history.comment && (
                                                    <div className="text-xs mt-1 p-2 bg-muted rounded">
                                                        {history.comment}
                                                    </div>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                </CardContent>
                            </Card>
                        )}
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}