import { Head, useForm } from '@inertiajs/react';
import { FormEventHandler } from 'react';
import { ArrowLeftIcon } from '@heroicons/react/24/outline';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import AppLayout from '@/layouts/app-layout';
import toast from 'react-hot-toast';

export default function ClientCreate() {
    const { data, setData, post, processing, errors } = useForm({
        company_name: '',
        contact_name: '',
        email: '',
        phone: '',
        address: '',
        city: '',
        postal_code: '',
        country: 'Maroc',
        ice: '',
        rc: '',
        patente: '',
        cnss: '',
        if_number: '',
        tax_regime: 'normal' as 'normal' | 'auto_entrepreneur' | 'exonere',
        is_tva_subject: true,
        is_active: true,
        notes: '',
    });

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        post(route('clients.store'), {
            onSuccess: () => toast.success('Client créé avec succès'),
            onError: () => toast.error('Erreur lors de la création'),
        });
    };

    return (
        <AppLayout>
            <Head title="Nouveau client" />

            <div className="space-y-6">
                {/* Header */}
                <div className="flex items-center space-x-4">
                    <Button variant="outline" size="sm" onClick={() => window.history.back()}>
                        <ArrowLeftIcon className="h-4 w-4 mr-2" />
                        Retour
                    </Button>
                    <div>
                        <h1 className="text-3xl font-bold text-foreground">Nouveau client</h1>
                        <p className="text-muted-foreground">
                            Créez un nouveau client avec ses informations fiscales
                        </p>
                    </div>
                </div>

                <form onSubmit={submit} className="space-y-6">
                    {/* Informations générales */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Informations générales</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <Label htmlFor="company_name">Nom de l'entreprise *</Label>
                                    <Input
                                        id="company_name"
                                        value={data.company_name}
                                        onChange={(e) => setData('company_name', e.target.value)}
                                        error={errors.company_name}
                                        required
                                    />
                                </div>
                                <div>
                                    <Label htmlFor="contact_name">Nom du contact</Label>
                                    <Input
                                        id="contact_name"
                                        value={data.contact_name}
                                        onChange={(e) => setData('contact_name', e.target.value)}
                                        error={errors.contact_name}
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <Label htmlFor="email">Email *</Label>
                                    <Input
                                        id="email"
                                        type="email"
                                        value={data.email}
                                        onChange={(e) => setData('email', e.target.value)}
                                        error={errors.email}
                                        required
                                    />
                                </div>
                                <div>
                                    <Label htmlFor="phone">Téléphone</Label>
                                    <Input
                                        id="phone"
                                        value={data.phone}
                                        onChange={(e) => setData('phone', e.target.value)}
                                        error={errors.phone}
                                        placeholder="+212 6 12 34 56 78"
                                    />
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Adresse */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Adresse</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div>
                                <Label htmlFor="address">Adresse *</Label>
                                <Textarea
                                    id="address"
                                    value={data.address}
                                    onChange={(e) => setData('address', e.target.value)}
                                    error={errors.address}
                                    required
                                />
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div>
                                    <Label htmlFor="city">Ville *</Label>
                                    <Input
                                        id="city"
                                        value={data.city}
                                        onChange={(e) => setData('city', e.target.value)}
                                        error={errors.city}
                                        required
                                    />
                                </div>
                                <div>
                                    <Label htmlFor="postal_code">Code postal</Label>
                                    <Input
                                        id="postal_code"
                                        value={data.postal_code}
                                        onChange={(e) => setData('postal_code', e.target.value)}
                                        error={errors.postal_code}
                                    />
                                </div>
                                <div>
                                    <Label htmlFor="country">Pays *</Label>
                                    <Input
                                        id="country"
                                        value={data.country}
                                        onChange={(e) => setData('country', e.target.value)}
                                        error={errors.country}
                                        required
                                    />
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Informations fiscales */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Informations fiscales marocaines</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <Label htmlFor="ice">ICE (15 chiffres)</Label>
                                    <Input
                                        id="ice"
                                        value={data.ice}
                                        onChange={(e) => setData('ice', e.target.value)}
                                        error={errors.ice}
                                        placeholder="001234567890123"
                                        maxLength={15}
                                    />
                                </div>
                                <div>
                                    <Label htmlFor="rc">Registre de Commerce</Label>
                                    <Input
                                        id="rc"
                                        value={data.rc}
                                        onChange={(e) => setData('rc', e.target.value)}
                                        error={errors.rc}
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div>
                                    <Label htmlFor="patente">Patente</Label>
                                    <Input
                                        id="patente"
                                        value={data.patente}
                                        onChange={(e) => setData('patente', e.target.value)}
                                        error={errors.patente}
                                    />
                                </div>
                                <div>
                                    <Label htmlFor="cnss">CNSS</Label>
                                    <Input
                                        id="cnss"
                                        value={data.cnss}
                                        onChange={(e) => setData('cnss', e.target.value)}
                                        error={errors.cnss}
                                    />
                                </div>
                                <div>
                                    <Label htmlFor="if_number">Identifiant Fiscal</Label>
                                    <Input
                                        id="if_number"
                                        value={data.if_number}
                                        onChange={(e) => setData('if_number', e.target.value)}
                                        error={errors.if_number}
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <Label htmlFor="tax_regime">Régime fiscal *</Label>
                                    <Select value={data.tax_regime} onValueChange={(value) => setData('tax_regime', value as any)}>
                                        <SelectTrigger>
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="normal">Normal</SelectItem>
                                            <SelectItem value="auto_entrepreneur">Auto-entrepreneur</SelectItem>
                                            <SelectItem value="exonere">Exonéré</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="flex items-center space-x-2 pt-6">
                                    <Checkbox
                                        id="is_tva_subject"
                                        checked={data.is_tva_subject}
                                        onCheckedChange={(checked) => setData('is_tva_subject', !!checked)}
                                    />
                                    <Label htmlFor="is_tva_subject">Assujetti à la TVA</Label>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Paramètres */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Paramètres</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex items-center space-x-2">
                                <Checkbox
                                    id="is_active"
                                    checked={data.is_active}
                                    onCheckedChange={(checked) => setData('is_active', !!checked)}
                                />
                                <Label htmlFor="is_active">Client actif</Label>
                            </div>

                            <div>
                                <Label htmlFor="notes">Notes internes</Label>
                                <Textarea
                                    id="notes"
                                    value={data.notes}
                                    onChange={(e) => setData('notes', e.target.value)}
                                    error={errors.notes}
                                    placeholder="Notes internes sur ce client..."
                                />
                            </div>
                        </CardContent>
                    </Card>

                    {/* Actions */}
                    <div className="flex items-center justify-end space-x-4">
                        <Button type="button" variant="outline" onClick={() => window.history.back()}>
                            Annuler
                        </Button>
                        <Button type="submit" disabled={processing}>
                            {processing ? 'Création...' : 'Créer le client'}
                        </Button>
                    </div>
                </form>
            </div>
        </AppLayout>
    );
}