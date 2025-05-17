<?php
// app/Http/Controllers/ProductController.php

namespace App\Http\Controllers;

use App\Models\{Product, Category, Currency, TaxRate, ProductImage};
use App\Http\Requests\ProductRequest;
use Illuminate\Http\RedirectResponse;
use Inertia\Inertia;
use Inertia\Response;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\Storage;

class ProductController extends Controller
{
    public function index(): Response
    {
        $products = Product::with('category','currency')
            ->orderBy('created_at','desc')
            ->paginate(20);

        return Inertia::render('Products/Index', compact('products'));
    }

    public function create(): Response
    {
        return Inertia::render('Products/Create', [
            'categories' => Category::orderBy('name')->get(['id','name']),
            'currencies' => Currency::all(['code','symbol']),
            'taxRates'   => TaxRate::all(['id','name','rate']),
        ]);
    }

    public function store(ProductRequest $request): RedirectResponse
    {
        $data = $request->validated();
        $data['id'] = (string) Str::uuid();

        $product = Product::create($data);
        $this->syncImages($request, $product);

        return redirect()->route('products.index')
                         ->with('success', 'Produit créé.');
    }

    public function show(Product $product): Response
    {
        $product->load('category','currency','taxRate','images');

        return Inertia::render('Products/Show', [
            'product' => $product,
        ]);
    }

    public function edit(Product $product): Response
    {
        return Inertia::render('Products/Edit', [
            'product'    => $product->load('category','currency','taxRate','images'),
            'categories' => Category::orderBy('name')->get(['id','name']),
            'currencies' => Currency::all(['code','symbol']),
            'taxRates'   => TaxRate::all(['id','name','rate']),
        ]);
    }

    public function update(ProductRequest $request, Product $product): RedirectResponse
    {
        $product->update($request->validated());
        $this->syncImages($request, $product);

        return redirect()->route('products.show', $product->id)
                 ->with('success', 'Produit mis à jour.');
    }

    public function destroy(Product $product): RedirectResponse
    {
        $product->delete();
        return back()->with('success', 'Produit supprimé.');
    }

    protected function syncImages(ProductRequest $request, Product $product): void
    {
        // 1) Soft-delete
        if ($ids = $request->input('deleted_image_ids', [])) {
            ProductImage::whereIn('id', $ids)->delete();
        }

        // 2) Restore
        if ($ids = $request->input('restored_image_ids', [])) {
            ProductImage::withTrashed()->whereIn('id', $ids)->restore();
        }

        // 3) New uploads
        if ($request->hasFile('images')) {
            $files        = $request->file('images');
            $primaryIndex = (int) $request->input('primary_image_index', 0);

            foreach ($files as $i => $file) {
                $path = $file->store("products/{$product->id}", 'public');
                $img  = $product->images()->create([
                    'path'       => $path,
                    'is_primary' => ($i === $primaryIndex),
                ]);

                if ($i === $primaryIndex) {
                    $product->update(['image_main' => $path]);
                }
            }
        }
    }

    public function restoreImage(Product $product, int $imageId): RedirectResponse
    {
        $image = ProductImage::withTrashed()->findOrFail($imageId);
        $image->restore();

        return back()->with('success', 'Image restaurée.');
    }

    public function forceDeleteImage(Product $product, int $imageId): RedirectResponse
    {
        $image = ProductImage::withTrashed()->findOrFail($imageId);
        Storage::disk('public')->delete($image->path);
        $image->forceDelete();

        return back()->with('success', 'Image définitivement supprimée.');
    }
}
