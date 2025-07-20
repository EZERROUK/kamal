<?php

namespace App\Http\Controllers;

use App\Models\{Quote, Client, Product, Currency, TaxRate};
use Illuminate\Http\Request;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use Inertia\Response;

class QuoteController extends Controller
{
    public function index(Request $request): Response
    {
        $query = Quote::with(['client', 'user', 'currency'])
            ->withCount('items');

        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('quote_number', 'like', "%{$search}%")
                  ->orWhereHas('client', function ($clientQuery) use ($search) {
                      $clientQuery->where('company_name', 'like', "%{$search}%");
                  });
            });
        }

        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }

        if ($request->filled('client_id')) {
            $query->where('client_id', $request->client_id);
        }

        $quotes = $query->latest()
            ->paginate($request->input('per_page', 15))
            ->appends($request->all());

        return Inertia::render('Quotes/Index', [
            'quotes' => $quotes,
            'filters' => $request->only(['search', 'status', 'client_id']),
            'clients' => Client::active()->orderBy('company_name')->get(['id', 'company_name']),
        ]);
    }

    public function create(): Response
    {
        return Inertia::render('Quotes/Create', [
            'clients' => Client::active()->orderBy('company_name')->get(),
            'products' => Product::with(['brand', 'category', 'currency', 'taxRate'])
                ->where('is_active', true)
                ->orderBy('name')
                ->get(),
            'currencies' => Currency::all(),
            'taxRates' => TaxRate::all(),
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'client_id' => 'required|exists:clients,id',
            'quote_date' => 'required|date',
            'valid_until' => 'required|date|after:quote_date',
            'currency_code' => 'required|exists:currencies,code',
            'terms_conditions' => 'nullable|string',
            'notes' => 'nullable|string',
            'internal_notes' => 'nullable|string',
            'items' => 'required|array|min:1',
            'items.*.product_id' => 'required|exists:products,id',
            'items.*.quantity' => 'required|numeric|min:0.01',
            'items.*.unit_price_ht' => 'required|numeric|min:0',
            'items.*.tax_rate' => 'required|numeric|min:0|max:100',
        ]);

        $client = Client::findOrFail($validated['client_id']);

        $quote = Quote::create([
            'client_id' => $validated['client_id'],
            'user_id' => Auth::id(),
            'quote_date' => $validated['quote_date'],
            'valid_until' => $validated['valid_until'],
            'currency_code' => $validated['currency_code'],
            'terms_conditions' => $validated['terms_conditions'],
            'notes' => $validated['notes'],
            'internal_notes' => $validated['internal_notes'],
            'client_snapshot' => $client->toSnapshot(),
        ]);

        // Créer les items
        foreach ($validated['items'] as $index => $itemData) {
            $product = Product::findOrFail($itemData['product_id']);
            
            $quote->items()->create([
                'product_id' => $product->id,
                'product_name_snapshot' => $product->name,
                'product_description_snapshot' => $product->description,
                'product_sku_snapshot' => $product->sku,
                'unit_price_ht_snapshot' => $itemData['unit_price_ht'],
                'tax_rate_snapshot' => $itemData['tax_rate'],
                'quantity' => $itemData['quantity'],
                'sort_order' => $index,
            ]);
        }

        return redirect()->route('quotes.show', $quote)
            ->with('success', 'Devis créé avec succès.');
    }

    public function show(Quote $quote): Response
    {
        $quote->load([
            'client',
            'user',
            'currency',
            'items.product',
            'statusHistories.user',
            'order',
            'duplicatedFrom',
            'duplicates'
        ]);

        return Inertia::render('Quotes/Show', [
            'quote' => $quote,
        ]);
    }

    public function edit(Quote $quote): Response
    {
        if (!in_array($quote->status, ['draft'])) {
            return redirect()->route('quotes.show', $quote)
                ->with('error', 'Seuls les devis en brouillon peuvent être modifiés.');
        }

        $quote->load(['client', 'items.product']);

        return Inertia::render('Quotes/Edit', [
            'quote' => $quote,
            'clients' => Client::active()->orderBy('company_name')->get(),
            'products' => Product::with(['brand', 'category', 'currency', 'taxRate'])
                ->where('is_active', true)
                ->orderBy('name')
                ->get(),
            'currencies' => Currency::all(),
            'taxRates' => TaxRate::all(),
        ]);
    }

    public function update(Request $request, Quote $quote): RedirectResponse
    {
        if (!in_array($quote->status, ['draft'])) {
            return back()->with('error', 'Seuls les devis en brouillon peuvent être modifiés.');
        }

        $validated = $request->validate([
            'client_id' => 'required|exists:clients,id',
            'quote_date' => 'required|date',
            'valid_until' => 'required|date|after:quote_date',
            'currency_code' => 'required|exists:currencies,code',
            'terms_conditions' => 'nullable|string',
            'notes' => 'nullable|string',
            'internal_notes' => 'nullable|string',
            'items' => 'required|array|min:1',
            'items.*.product_id' => 'required|exists:products,id',
            'items.*.quantity' => 'required|numeric|min:0.01',
            'items.*.unit_price_ht' => 'required|numeric|min:0',
            'items.*.tax_rate' => 'required|numeric|min:0|max:100',
        ]);

        $client = Client::findOrFail($validated['client_id']);

        $quote->update([
            'client_id' => $validated['client_id'],
            'quote_date' => $validated['quote_date'],
            'valid_until' => $validated['valid_until'],
            'currency_code' => $validated['currency_code'],
            'terms_conditions' => $validated['terms_conditions'],
            'notes' => $validated['notes'],
            'internal_notes' => $validated['internal_notes'],
            'client_snapshot' => $client->toSnapshot(),
        ]);

        // Supprimer les anciens items et recréer
        $quote->items()->delete();

        foreach ($validated['items'] as $index => $itemData) {
            $product = Product::findOrFail($itemData['product_id']);
            
            $quote->items()->create([
                'product_id' => $product->id,
                'product_name_snapshot' => $product->name,
                'product_description_snapshot' => $product->description,
                'product_sku_snapshot' => $product->sku,
                'unit_price_ht_snapshot' => $itemData['unit_price_ht'],
                'tax_rate_snapshot' => $itemData['tax_rate'],
                'quantity' => $itemData['quantity'],
                'sort_order' => $index,
            ]);
        }

        return redirect()->route('quotes.show', $quote)
            ->with('success', 'Devis mis à jour avec succès.');
    }

    public function destroy(Quote $quote): RedirectResponse
    {
        if (!in_array($quote->status, ['draft', 'rejected'])) {
            return back()->with('error', 'Seuls les devis en brouillon ou refusés peuvent être supprimés.');
        }

        $quote->delete();

        return redirect()->route('quotes.index')
            ->with('success', 'Devis supprimé.');
    }

    public function changeStatus(Request $request, Quote $quote): RedirectResponse
    {
        $validated = $request->validate([
            'status' => 'required|string',
            'comment' => 'nullable|string',
        ]);

        if (!$quote->changeStatus($validated['status'], Auth::user(), $validated['comment'])) {
            return back()->with('error', 'Transition de statut non autorisée.');
        }

        return back()->with('success', 'Statut du devis mis à jour.');
    }

    public function convertToOrder(Quote $quote): RedirectResponse
    {
        if (!$quote->can_be_converted) {
            return back()->with('error', 'Ce devis ne peut pas être converti en commande.');
        }

        $order = $quote->convertToOrder(Auth::user());

        if (!$order) {
            return back()->with('error', 'Erreur lors de la conversion en commande.');
        }

        return redirect()->route('orders.show', $order)
            ->with('success', "Devis converti en commande #{$order->order_number}");
    }

    public function duplicate(Quote $quote): RedirectResponse
    {
        $newQuote = Quote::create([
            'client_id' => $quote->client_id,
            'user_id' => Auth::id(),
            'duplicated_from_id' => $quote->id,
            'quote_date' => now()->toDateString(),
            'valid_until' => now()->addDays(30)->toDateString(),
            'currency_code' => $quote->currency_code,
            'terms_conditions' => $quote->terms_conditions,
            'notes' => $quote->notes,
            'internal_notes' => $quote->internal_notes,
            'client_snapshot' => $quote->client->toSnapshot(),
        ]);

        // Copier les items
        foreach ($quote->items as $item) {
            $newQuote->items()->create([
                'product_id' => $item->product_id,
                'product_name_snapshot' => $item->product_name_snapshot,
                'product_description_snapshot' => $item->product_description_snapshot,
                'product_sku_snapshot' => $item->product_sku_snapshot,
                'unit_price_ht_snapshot' => $item->unit_price_ht_snapshot,
                'tax_rate_snapshot' => $item->tax_rate_snapshot,
                'quantity' => $item->quantity,
                'sort_order' => $item->sort_order,
            ]);
        }

        // Enregistrer l'activité de duplication
        activity('quote')
            ->performedOn($newQuote)
            ->causedBy(Auth::user())
            ->withProperties([
                'action' => 'duplicated',
                'original_quote_id' => $quote->id,
                'original_quote_number' => $quote->quote_number,
                'new_quote_number' => $newQuote->quote_number,
                'client_name' => $quote->client->company_name,
                'duplicated_by' => Auth::user()->name,
                'duplicated_at' => now()->toIso8601String(),
                'items_count' => $quote->items->count(),
                'total_amount' => $quote->total_ttc,
                'currency' => $quote->currency_code,
            ])
            ->log('Devis dupliqué');

        // Enregistrer aussi sur le devis original
        activity('quote')
            ->performedOn($quote)
            ->causedBy(Auth::user())
            ->withProperties([
                'action' => 'source_of_duplication',
                'new_quote_id' => $newQuote->id,
                'new_quote_number' => $newQuote->quote_number,
                'duplicated_by' => Auth::user()->name,
                'duplicated_at' => now()->toIso8601String(),
            ])
            ->log('Devis utilisé comme source de duplication');

        return redirect()->route('quotes.edit', $newQuote)
            ->with('success', 'Devis dupliqué avec succès.');
    }
}