<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\SoftDeletes;

abstract class SpecializedProduct extends Model
{
    use HasFactory, SoftDeletes;

    /** Clé = product_id (UUID) */
    protected $primaryKey = 'product_id';
    public $incrementing  = false;
    protected $keyType    = 'string';

    /** Par défaut tous les champs sont assignables (à affiner au besoin) */
    protected $guarded = ['product_id'];

    /** Inverse 1‑to‑1 vers Product */
    public function product(): BelongsTo
    {
        return $this->belongsTo(Product::class);
    }
}
