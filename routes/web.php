<?php

use Illuminate\Support\Facades\Route;
use Inertia\Inertia;
use App\Http\Controllers\{
    UserController,
    RoleController,
    PermissionController,
    CategoryController,
    ProductController,
    AuditLogExportController,
    LoginLogController,
    LoginLogExportController,
    TaxRateController,
    CurrencyController,
};
use Spatie\Activitylog\Models\Activity;

/*
|--------------------------------------------------------------------------
| Accueil public
|--------------------------------------------------------------------------
*/
Route::get('/', fn () => Inertia::render('welcome'))->name('home');

/*
|--------------------------------------------------------------------------
| Zone protégée (auth + e-mail vérifié)
|--------------------------------------------------------------------------
*/
Route::middleware(['auth', 'verified'])->group(function () {

    /* Dashboard */
    Route::get('/dashboard', fn () => Inertia::render('dashboard'))->name('dashboard');

    /* Catalogue – Catégories */
    Route::prefix('categories')->name('categories.')->group(function () {
        Route::get('/', [CategoryController::class, 'index'])->middleware('permission:category_list')->name('index');
        Route::get('/create', [CategoryController::class, 'create'])->middleware('permission:category_create')->name('create');
        Route::post('/', [CategoryController::class, 'store'])->middleware('permission:category_create')->name('store');
        Route::get('/{category}', [CategoryController::class, 'show'])->middleware('permission:category_show')->name('show');
        Route::get('/{category}/edit', [CategoryController::class, 'edit'])->middleware('permission:category_edit')->name('edit');
        Route::patch('/{category}', [CategoryController::class, 'update'])->middleware('permission:category_edit')->name('update');
        Route::delete('/{category}', [CategoryController::class, 'destroy'])->middleware('permission:category_delete')->name('destroy');
        Route::post('/{id}/restore', [CategoryController::class, 'restore'])->middleware('permission:category_restore')->name('restore');
        Route::delete('/{id}/force-delete', [CategoryController::class, 'forceDelete'])->middleware('permission:category_delete')->name('force-delete');
    });

    /* Catalogue – Produits */
    Route::prefix('products')->name('products.')->group(function () {
        Route::get('/', [ProductController::class, 'index'])->middleware('permission:product_list')->name('index');
        Route::get('/create', [ProductController::class, 'create'])->middleware('permission:product_create')->name('create');
        Route::post('/', [ProductController::class, 'store'])->middleware('permission:product_create')->name('store');
        Route::get('/{product}', [ProductController::class, 'show'])->middleware('permission:product_show')->name('show');
        Route::get('/{product}/edit', [ProductController::class, 'edit'])->middleware('permission:product_edit')->name('edit');
        Route::patch('/{product}', [ProductController::class, 'update'])->middleware('permission:product_edit')->name('update');
        Route::delete('/{product}', [ProductController::class, 'destroy'])->middleware('permission:product_delete')->name('destroy');
        Route::post('/{id}/restore', [ProductController::class, 'restore'])->middleware('permission:product_restore')->name('restore');
        Route::delete('/{id}/force-delete', [ProductController::class, 'forceDelete'])->middleware('permission:product_delete')->name('force-delete');
    });

    /* Taxes */
    Route::prefix('tax-rates')->name('taxrates.')->group(function () {
        Route::get('/', [TaxRateController::class, 'index'])->middleware('permission:taxrate_list')->name('index');
        Route::get('/create', [TaxRateController::class, 'create'])->middleware('permission:taxrate_create')->name('create');
        Route::get('/{taxRate}', [TaxRateController::class, 'show'])->middleware('permission:taxrate_show')->name('show');
        Route::post('/', [TaxRateController::class, 'store'])->middleware('permission:taxrate_create')->name('store');
        Route::get('/{taxRate}/edit', [TaxRateController::class, 'edit'])->middleware('permission:taxrate_edit')->name('edit');
        Route::put('/{taxRate}', [TaxRateController::class, 'update'])->middleware('permission:taxrate_edit')->name('update');
        Route::delete('/{taxRate}', [TaxRateController::class, 'destroy'])->middleware('permission:taxrate_delete')->name('destroy');
        Route::post('/{id}/restore', [TaxRateController::class, 'restore'])->middleware('permission:taxrate_restore')->name('restore');
    });

Route::prefix('currencies')->name('currencies.')->group(function () {
    Route::get('/', [CurrencyController::class, 'index'])->middleware('permission:currency_list')->name('index');
    Route::get('/create', [CurrencyController::class, 'create'])->middleware('permission:currency_create')->name('create');
    Route::post('/', [CurrencyController::class, 'store'])->middleware('permission:currency_create')->name('store');
    Route::get('/{currency}', [CurrencyController::class, 'show'])->middleware('permission:currency_show')->name('show'); // <-- ajoute cette ligne
    Route::get('/{currency}/edit', [CurrencyController::class, 'edit'])->middleware('permission:currency_edit')->name('edit');
    Route::put('/{currency}', [CurrencyController::class, 'update'])->middleware('permission:currency_edit')->name('update');
    Route::delete('/{currency}', [CurrencyController::class, 'destroy'])->middleware('permission:currency_delete')->name('destroy');
    Route::post('/{id}/restore', [CurrencyController::class, 'restore'])->middleware('permission:currency_restore')->name('restore');
});


    /* Utilisateurs */
    Route::prefix('users')->name('users.')->group(function () {
        Route::get('/', [UserController::class, 'index'])->name('index');
        Route::get('/export', [UserController::class, 'export'])->name('export');
        Route::get('/create', [UserController::class, 'create'])->name('create');
        Route::post('/', [UserController::class, 'store'])->name('store');
        Route::get('/{id}', [UserController::class, 'show'])->name('show');
        Route::get('/{user}/edit', [UserController::class, 'edit'])->name('edit');
        Route::patch('/{user}', [UserController::class, 'update'])->name('update');
        Route::post('/{id}/restore', [UserController::class, 'restore'])->name('restore');
        Route::delete('/{id}', [UserController::class, 'destroy'])->name('destroy');
        Route::delete('/{id}/force-delete', [UserController::class, 'forceDelete'])->name('force-delete');
    });

    /* Rôles */
    Route::prefix('roles')->name('roles.')->group(function () {
        Route::get('/', [RoleController::class, 'index'])->name('index');
        Route::get('/create', [RoleController::class, 'create'])->name('create');
        Route::post('/', [RoleController::class, 'store'])->name('store');
        Route::get('/{id}', [RoleController::class, 'show'])->name('show');
        Route::get('/{role}/edit', [RoleController::class, 'edit'])->name('edit');
        Route::patch('/{role}', [RoleController::class, 'update'])->name('update');
        Route::delete('/{id}', [RoleController::class, 'destroy'])->name('destroy');
        Route::post('/{id}/restore', [RoleController::class, 'restore'])->name('restore');
    });

    /* Permissions */
    Route::prefix('permissions')->name('permissions.')->group(function () {
        Route::get('/', [PermissionController::class, 'index'])->name('index');
        Route::get('/create', [PermissionController::class, 'create'])->name('create');
        Route::post('/', [PermissionController::class, 'store'])->name('store');
        Route::get('/{permission}/edit', [PermissionController::class, 'edit'])->name('edit');
        Route::patch('/{permission}', [PermissionController::class, 'update'])->name('update');
        Route::delete('/{id}', [PermissionController::class, 'destroy'])->name('destroy');
        Route::post('/{id}/restore', [PermissionController::class, 'restore'])->name('restore');
    });

    /* Logs d’audit & de connexion */
    Route::get('/audit-logs', function () {
        $logs = Activity::with('causer')->latest()->get();
        return Inertia::render('audit-logs/Index', [
            'logs' => [
                'data'         => $logs,
                'current_page' => 1,
                'per_page'     => 10,
                'total'        => $logs->count(),
            ],
        ]);
    })->name('audit-logs.index');

    Route::get('/audit-logs/export', [AuditLogExportController::class, 'export'])->name('audit-logs.export');
    Route::get('/login-logs', [LoginLogController::class, 'index'])->name('login-logs.index');
    Route::get('/login-logs/export', [LoginLogExportController::class, 'export'])->name('login-logs.export');

});

/* Autres groupes de routes */
require __DIR__.'/settings.php';
require __DIR__.'/auth.php';
