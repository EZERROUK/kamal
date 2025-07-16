import React, { useState } from 'react';
import { Head, useForm } from '@inertiajs/react';
import { route } from 'ziggy-js';
import toast from 'react-hot-toast';

import AppLayout from '@/layouts/app-layout';
import ParticlesBackground from '@/components/ParticlesBackground';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

import {
  Plus,
  Trash2,
  Save,
  ArrowLeft,
  Building2,
  Calendar,
  DollarSign,
  Package,
  Calculator,
} from 'lucide-react';

/* -------------------------------------------------------------------------- */
/*                                   TYPES                                    */
/* -------------------------------------------------------------------------- */
interface Client {
  id: number;
  company_name: string;
  contact_name?: string;
  email: string;
}

interface Product {
  id: string;
  name: string;
  sku: string;
  price: number;
  currency: {
    code: string;
    symbol: string;
  };
  tax_rate: {
    id: number;
    rate: number;
  };
}

interface Currency {
  code: string;
  symbol: string;
  name: string;
}

interface TaxRate {
  id: number;
  name: string;
  rate: number;
}

interface QuoteItem {
  product_id: string;
  quantity: number;
  unit_price_ht: number;
  tax_rate: number;
}

interface Props {
  clients: Client[];
  products: Product[];
  currencies: Currency[];
  taxRates: TaxRate[];
}

/* -------------------------------------------------------------------------- */
/*                                COMPONENT                                   */
/* -------------------------------------------------------------------------- */
export default function QuotesCreate({ clients, products, currencies, taxRates }: Props) {
  const [items, setItems] = useState<QuoteItem[]>([]);

  const { data, setData, post, processing, errors } = useForm({
    client_id: '',
    quote_date: new Date().toISOString().split('T')[0],
    valid_until: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    currency_code: 'MAD',
    terms_conditions: '',
    notes: '',
    internal_notes: '',
    items: [] as QuoteItem[],
  });

  const addItem = () => {
    const newItem: QuoteItem = {
      product_id: '',
      quantity: 1,
      unit_price_ht: 0,
      tax_rate: 20,
    };
    const newItems = [...items, newItem];
    setItems(newItems);
    setData('items', newItems);
  };

  const removeItem = (index: number) => {
    const newItems = items.filter((_, i) => i !== index);
    setItems(newItems);
    setData('items', newItems);
  };

  const updateItem = (index: number, field: keyof QuoteItem, value: any) => {
    const newItems = [...items];
    newItems[index] = { ...newItems[index], [field]: value };

    // Auto-fill price and tax rate when product is selected
    if (field === 'product_id' && value) {
      const product = products.find(p => p.id === value);
      if (product) {
        newItems[index].unit_price_ht = product.price;
        newItems[index].tax_rate = product.tax_rate.rate;
      }
    }

    setItems(newItems);
    setData('items', newItems);
  };

  const calculateTotals = () => {
    let subtotalHT = 0;
    let totalTax = 0;

    items.forEach(item => {
      const lineTotal = item.quantity * item.unit_price_ht;
      const lineTax = lineTotal * (item.tax_rate / 100);
      subtotalHT += lineTotal;
      totalTax += lineTax;
    });

    return {
      subtotalHT,
      totalTax,
      totalTTC: subtotalHT + totalTax,
    };
  };

  const totals = calculateTotals();
  const selectedCurrency = currencies.find(c => c.code === data.currency_code);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (items.length === 0) {
      toast.error('Veuillez ajouter au moins un article au devis');
      return;
    }

    post(route('quotes.store'), {
      onSuccess: () => toast.success('Devis créé avec succès'),
      onError: () => toast.error('Erreur lors de la création du devis'),
    });
  };

  const formatCurrency = (amount: number) => {
    return `${amount.toLocaleString('fr-FR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ${selectedCurrency?.symbol || 'MAD'}`;
  };

  /* -------------------------------------------------------------------- */
  /*                                 RENDER                               */
  /* -------------------------------------------------------------------- */
  return (
    <>
      <Head title="Nouveau devis" />

      <AppLayout
        breadcrumbs={[
          { title: 'Dashboard', href: '/dashboard' },
          { title: 'Devis', href: '/quotes' },
          { title: 'Nouveau devis', href: '/quotes/create' },
        ]}
      >
        <div className="relative">
          <ParticlesBackground />

          <div className="relative z-10 w-full py-6 px-4">
            {/* Header */}
            <div className="flex items-center gap-3 mb-6">
              <Button variant="outline" size="sm" onClick={() => window.history.back()}>
                <ArrowLeft className="w-4 h-4" />
              </Button>
              <div>
                <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
                  Nouveau devis
                </h1>
                <p className="text-sm text-slate-600 dark:text-slate-400">
                  Créer une nouvelle proposition commerciale
                </p>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Informations générales */}
              <div className="bg-white dark:bg-white/5 border border-slate-200 dark:border-slate-700 backdrop-blur-md rounded-xl shadow-xl p-6">
                <h2 className="text-lg font-semibold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                  <Building2 className="w-5 h-5" />
                  Informations générales
                </h2>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="client_id">Client *</Label>
                    <Select value={data.client_id} onValueChange={(value) => setData('client_id', value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Sélectionner un client" />
                      </SelectTrigger>
                      <SelectContent>
                        {clients.map((client) => (
                          <SelectItem key={client.id} value={client.id.toString()}>
                            {client.company_name}
                            {client.contact_name && ` (${client.contact_name})`}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {errors.client_id && <p className="text-red-500 text-sm mt-1">{errors.client_id}</p>}
                  </div>

                  <div>
                    <Label htmlFor="currency_code">Devise</Label>
                    <Select value={data.currency_code} onValueChange={(value) => setData('currency_code', value)}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {currencies.map((currency) => (
                          <SelectItem key={currency.code} value={currency.code}>
                            {currency.name} ({currency.symbol})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="quote_date">Date du devis *</Label>
                    <Input
                      type="date"
                      value={data.quote_date}
                      onChange={(e) => setData('quote_date', e.target.value)}
                    />
                    {errors.quote_date && <p className="text-red-500 text-sm mt-1">{errors.quote_date}</p>}
                  </div>

                  <div>
                    <Label htmlFor="valid_until">Valide jusqu'au *</Label>
                    <Input
                      type="date"
                      value={data.valid_until}
                      onChange={(e) => setData('valid_until', e.target.value)}
                    />
                    {errors.valid_until && <p className="text-red-500 text-sm mt-1">{errors.valid_until}</p>}
                  </div>
                </div>
              </div>

              {/* Articles */}
              <div className="bg-white dark:bg-white/5 border border-slate-200 dark:border-slate-700 backdrop-blur-md rounded-xl shadow-xl p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-semibold text-slate-900 dark:text-white flex items-center gap-2">
                    <Package className="w-5 h-5" />
                    Articles
                  </h2>
                  <Button type="button" onClick={addItem} variant="outline">
                    <Plus className="w-4 h-4 mr-1" />
                    Ajouter un article
                  </Button>
                </div>

                {items.length === 0 ? (
                  <div className="text-center py-8 text-slate-500 dark:text-slate-400">
                    Aucun article ajouté. Cliquez sur "Ajouter un article" pour commencer.
                  </div>
                ) : (
                  <div className="space-y-4">
                    {items.map((item, index) => (
                      <div key={index} className="border border-slate-200 dark:border-slate-700 rounded-lg p-4">
                        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 items-end">
                          <div className="md:col-span-2">
                            <Label>Produit *</Label>
                            <Select
                              value={item.product_id}
                              onValueChange={(value) => updateItem(index, 'product_id', value)}
                            >
                              <SelectTrigger>
                                <SelectValue placeholder="Sélectionner un produit" />
                              </SelectTrigger>
                              <SelectContent>
                                {products.map((product) => (
                                  <SelectItem key={product.id} value={product.id}>
                                    {product.name} ({product.sku})
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>

                          <div>
                            <Label>Quantité *</Label>
                            <Input
                              type="number"
                              min="0.01"
                              step="0.01"
                              value={item.quantity}
                              onChange={(e) => updateItem(index, 'quantity', parseFloat(e.target.value) || 0)}
                            />
                          </div>

                          <div>
                            <Label>Prix unitaire HT *</Label>
                            <Input
                              type="number"
                              min="0"
                              step="0.01"
                              value={item.unit_price_ht}
                              onChange={(e) => updateItem(index, 'unit_price_ht', parseFloat(e.target.value) || 0)}
                            />
                          </div>

                          <div className="flex items-end gap-2">
                            <div className="flex-1">
                              <Label>TVA (%)</Label>
                              <Input
                                type="number"
                                min="0"
                                max="100"
                                step="0.01"
                                value={item.tax_rate}
                                onChange={(e) => updateItem(index, 'tax_rate', parseFloat(e.target.value) || 0)}
                              />
                            </div>
                            <Button
                              type="button"
                              variant="destructive"
                              size="sm"
                              onClick={() => removeItem(index)}
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>

                        <div className="mt-2 text-sm text-slate-600 dark:text-slate-400">
                          Total ligne: {formatCurrency(item.quantity * item.unit_price_ht * (1 + item.tax_rate / 100))}
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Totaux */}
                {items.length > 0 && (
                  <div className="mt-6 border-t border-slate-200 dark:border-slate-700 pt-4">
                    <div className="flex justify-end">
                      <div className="w-full max-w-sm space-y-2">
                        <div className="flex justify-between">
                          <span>Sous-total HT:</span>
                          <span className="font-medium">{formatCurrency(totals.subtotalHT)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>TVA:</span>
                          <span className="font-medium">{formatCurrency(totals.totalTax)}</span>
                        </div>
                        <div className="flex justify-between text-lg font-bold border-t border-slate-200 dark:border-slate-700 pt-2">
                          <span>Total TTC:</span>
                          <span>{formatCurrency(totals.totalTTC)}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Notes */}
              <div className="bg-white dark:bg-white/5 border border-slate-200 dark:border-slate-700 backdrop-blur-md rounded-xl shadow-xl p-6">
                <h2 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">
                  Notes et conditions
                </h2>

                <div className="space-y-4">
                  <div>
                    <Label htmlFor="terms_conditions">Conditions générales</Label>
                    <Textarea
                      placeholder="Conditions de paiement, livraison, etc."
                      value={data.terms_conditions}
                      onChange={(e) => setData('terms_conditions', e.target.value)}
                      rows={3}
                    />
                  </div>

                  <div>
                    <Label htmlFor="notes">Notes client</Label>
                    <Textarea
                      placeholder="Notes visibles par le client"
                      value={data.notes}
                      onChange={(e) => setData('notes', e.target.value)}
                      rows={3}
                    />
                  </div>

                  <div>
                    <Label htmlFor="internal_notes">Notes internes</Label>
                    <Textarea
                      placeholder="Notes internes (non visibles par le client)"
                      value={data.internal_notes}
                      onChange={(e) => setData('internal_notes', e.target.value)}
                      rows={3}
                    />
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex justify-end gap-3">
                <Button type="button" variant="outline" onClick={() => window.history.back()}>
                  Annuler
                </Button>
                <Button type="submit" disabled={processing}>
                  <Save className="w-4 h-4 mr-1" />
                  {processing ? 'Création...' : 'Créer le devis'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      </AppLayout>
    </>
  );
}