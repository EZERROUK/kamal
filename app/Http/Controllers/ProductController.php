<?php

namespace App\Http\Controllers;

use App\Models\{
    Product,
    Brand,
    Category,
    Currency,
    TaxRate,
    ProductImage,
    ProductCompatibility
};
use App\Http\Requests\ProductRequest;
use Illuminate\Http\Request;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;

class ProductController extends Controller
{
    public function index(Request $request): Response
    {
        $query = Product::query()
            ->with(['brand:id,name', 'category:id,name', 'currency:code,symbol']);

        if ($search = trim($request->input('search'))) {
            foreach (preg_split('/\s+/', $search, -1, PREG_SPLIT_NO_EMPTY) as $t) {
                $like = "%{$t}%";
                $query->where(fn ($q) => $q
                    ->where('name', 'like', $like)
                    ->orWhere('description', 'like', $like));
            }
        }

        if ($name = $request->input('name')) {
            $query->where('name', 'like', "%{$name}%");
        }
        if ($cat = $request->input('category')) {
            $query->whereHas('category', fn ($q) => $q->where('name', 'like', "%{$cat}%"));
        }
        if ($status = $request->input('status')) {
            $status === 'actif'
                ? $query->whereNull('deleted_at')
                : $query->whereNotNull('deleted_at');
        }

        $query->orderBy($request->input('sort', 'created_at'), $request->input('dir', 'desc'));
        $per = (int) $request->input('per_page', 10);
        $products = $per === -1
            ? $query->paginate($query->count())->appends($request->query())
            : $query->paginate($per)->appends($request->query());

        return Inertia::render('Products/Index', [
            'products' => $products,
            'filters'  => $request->only(['search', 'name', 'category', 'status']),
            'sort'     => $request->input('sort', 'created_at'),
            'dir'      => $request->input('dir', 'desc'),
            'flash'    => session()->only(['success', 'error']),
        ]);
    }

    public function create(): Response
    {
        return Inertia::render('Products/Create', [
            'brands'     => Brand::orderBy('name')->get(['id', 'name']),
            'categories' => Category::orderBy('name')->get(['id', 'name', 'slug']),
            'currencies' => Currency::all(['code', 'symbol']),
            'taxRates'   => TaxRate::all(['id', 'name', 'rate']),
        ]);
    }

    public function store(ProductRequest $request): RedirectResponse
    {
        $validated = $request->validated();
        $category  = Category::findOrFail($validated['category_id']);
        $slug      = $category->slug;
        $config    = config('catalog.specializations');

        $product = Product::create([...$validated, 'id' => (string) Str::uuid()]);

        if (isset($config[$slug]) && isset($validated['spec'])) {
            $modelClass = $config[$slug]['model'] ?? null;
            $fields     = $config[$slug]['fields'] ?? [];

            $specData = array_merge($fields, $validated['spec'], ['product_id' => $product->id]);
            $relation = Str::camel(Str::singular($slug));

            if (method_exists($product, $relation) && method_exists($product->{$relation}(), 'create')) {
                $product->{$relation}()->create($specData);
            } elseif ($modelClass && class_exists($modelClass)) {
                $modelClass::create($specData);
            }
        }

        foreach ($request->input('compatibilities', []) as $entry) {
            $product->compatibleWith()->attach(
                $entry['compatible_with_id'],
                [
                    'direction' => $entry['direction'] ?? 'bidirectional',
                    'note'      => $entry['note'] ?? null,
                ]
            );
        }

        $this->syncImages($request, $product);

        return to_route('products.index')->with('success', 'Produit créé.');
    }

    public function show(Product $product): Response
    {
        $product->load([
            'brand','category','currency','taxRate','images',
            'ram','processor','hardDrive','powerSupply','motherboard','networkCard',
            'graphicCard','license','software','accessory','laptop','desktop','server',
            'compatibleWith.category','isCompatibleWith.category',
        ]);

        $all = collect();

        foreach ($product->compatibleWith as $p) {
            $all->push((object)[
                'id' => $p->id,
                'name' => $p->name,
                'category' => $p->category?->name,
                'direction' => $p->pivot->direction,
                'note' => $p->pivot->note,
            ]);
        }
        foreach ($product->isCompatibleWith as $p) {
            $all->push((object)[
                'id' => $p->id,
                'name' => $p->name,
                'category' => $p->category?->name,
                'direction' => $p->pivot->direction,
                'note' => $p->pivot->note,
            ]);
        }

        $allCompatibilities = $all->unique('id')->values();
        $base = $product->toArray();
        $config = config('catalog.specializations');

        foreach ($config as $slug => $_) {
            $relation = Str::camel(Str::singular($slug));
            if ($product->relationLoaded($relation)) {
                $base[$relation] = $product->getRelation($relation);
            }
        }

        return Inertia::render('Products/Show', [
            'product' => $base,
            'allCompatibilities' => $allCompatibilities,
        ]);
    }

    public function edit(Product $product): Response
    {
        $slug = $product->category?->slug;
        $relations = ['brand', 'category', 'currency', 'taxRate', 'images'];

        if ($slug) {
            $relations[] = Str::camel(Str::singular($slug));
        }

        $product->load(array_merge($relations, ['compatibleWith', 'isCompatibleWith']));

        $compatibilities = $product->compatibleWith
            ->merge($product->isCompatibleWith)
            ->values()
            ->map(fn ($p) => [
                'compatible_with_id' => $p->id,
                'name' => $p->name,
                'direction' => $p->pivot->direction,
                'note' => $p->pivot->note,
            ]);

        return Inertia::render('Products/Edit', [
            'brands' => Brand::orderBy('name')->get(['id', 'name']),
            'product' => $product,
            'categories' => Category::orderBy('name')->get(['id', 'name', 'slug']),
            'currencies' => Currency::all(['code', 'symbol']),
            'taxRates' => TaxRate::all(['id', 'name', 'rate']),
            'compatibilities' => $compatibilities,
        ]);
    }

    public function update(ProductRequest $request, Product $product): RedirectResponse
    {
        DB::transaction(function () use ($request, $product) {
            $validated = $request->validated();
            $product->update($validated);

            $category = Category::findOrFail($validated['category_id']);
            $slug = $category->slug;
            $config = config('catalog.specializations');

            if (isset($config[$slug]) && isset($validated['spec'])) {
                $relation = Str::camel(Str::singular($slug));

                if (method_exists($product, $relation)) {
                    $product->{$relation}()->updateOrCreate(
                        ['product_id' => $product->id],
                        $validated['spec']
                    );
                }
            }

            $sent = collect($request->input('compatibilities', []))
                ->filter(fn ($e) => !empty($e['compatible_with_id']))
                ->map(fn ($e) => [
                    'id' => (string) $e['compatible_with_id'],
                    'direction' => $e['direction'] ?? 'bidirectional',
                    'note' => $e['note'] ?? null,
                ]);

            $toSync = $sent->mapWithKeys(fn ($e) => [
                $e['id'] => ['direction' => $e['direction'], 'note' => $e['note']],
            ]);

            $existing = ProductCompatibility::withTrashed()
                ->where(fn ($q) => $q
                    ->where('product_id', $product->id)
                    ->orWhere('compatible_with_id', $product->id))
                ->get();

            foreach ($existing as $pivot) {
                $otherId = $pivot->product_id === $product->id
                    ? $pivot->compatible_with_id
                    : $pivot->product_id;

                if ($toSync->has($otherId)) {
                    $attrs = $toSync[$otherId];
                    if ($pivot->trashed()) $pivot->restore();
                    $pivot->update($attrs);
                    $toSync->forget($otherId);
                } elseif (is_null($pivot->deleted_at)) {
                    $pivot->delete();
                }
            }

            foreach ($toSync as $otherId => $attrs) {
                $product->compatibleWith()->attach($otherId, $attrs);
            }

            $this->syncImages($request, $product);
        });

        return to_route('products.show', $product)->with('success', 'Produit mis à jour.');
    }

    public function destroy(Product $product): RedirectResponse
    {
        $product->delete();
        return back()->with('success', 'Produit supprimé.');
    }

    protected function syncImages(ProductRequest $request, Product $product): void
    {
        if ($ids = $request->input('deleted_image_ids', [])) {
            ProductImage::whereIn('id', $ids)->delete();
        }
        if ($ids = $request->input('restored_image_ids', [])) {
            ProductImage::withTrashed()->whereIn('id', $ids)->restore();
        }

        ProductImage::where('product_id', $product->id)
            ->whereNull('deleted_at')
            ->update(['is_primary' => false]);

        $primaryIdx = (int) $request->input('primary_image_index', 0);
        $globalIdx = 0;
        $primaryPath = null;

        if ($request->hasFile('images')) {
            foreach ($request->file('images') as $file) {
                $path = $file->store("products/{$product->id}", 'public');
                $isPrimary = $globalIdx === $primaryIdx;

                $product->images()->create([
                    'path' => $path,
                    'is_primary' => $isPrimary,
                ]);

                if ($isPrimary) $primaryPath = $path;
                $globalIdx++;
            }
        }

        $existing = $product->images()
            ->whereNull('deleted_at')
            ->orderBy('id')
            ->get();

        foreach ($existing as $img) {
            $isPrimary = $globalIdx === $primaryIdx;
            if ($isPrimary) {
                $img->update(['is_primary' => true]);
                $primaryPath = $img->path;
            }
            $globalIdx++;
        }

        if (!$primaryPath && $first = $existing->first()) {
            $first->update(['is_primary' => true]);
            $primaryPath = $first->path;
        }

        if ($primaryPath) {
            $product->updateQuietly(['image_main' => $primaryPath]);
        }
    }

    public function compatibleList()
    {
        $machineSlugs = ['desktop', 'desktops', 'laptop', 'laptops', 'server', 'servers'];

        return Product::query()
            ->select('products.id', 'products.name')
            ->join('categories', 'categories.id', '=', 'products.category_id')
            ->whereIn('categories.slug', $machineSlugs)
            ->whereNull('products.deleted_at')
            ->orderBy('products.name')
            ->get();
    }
}
