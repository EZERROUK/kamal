<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasOne;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Product extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'id', 'name', 'sku', 'description',
        'price', 'stock_quantity', 'currency_code',
        'tax_rate_id', 'category_id', 'image_main', 'is_active',
    ];

    public $incrementing = false;  // UUIDv7
    protected $keyType    = 'string';

    /* === Relations génériques ======================================= */
    public function category()       { return $this->belongsTo(Category::class); }
    public function taxRate()        { return $this->belongsTo(TaxRate::class); }
    public function currency()       { return $this->belongsTo(Currency::class, 'currency_code', 'code'); }
    public function images(): HasMany{ return $this->hasMany(ProductImage::class); }
    public function prices(): HasMany{ return $this->hasMany(PriceHistory::class); }
    public function compatibilities(){ return $this->hasMany(ProductCompatibility::class); }

    /* === Relations spécialisées : 1 méthode / table ================= */
    public function ram():           HasOne { return $this->hasOne(Ram::class); }
    public function processor():     HasOne { return $this->hasOne(Processor::class); }
    public function hardDrive():     HasOne { return $this->hasOne(HardDrive::class); }
    public function powerSupply():   HasOne { return $this->hasOne(PowerSupply::class); }
    public function motherboard():   HasOne { return $this->hasOne(Motherboard::class); }
    public function networkCard():   HasOne { return $this->hasOne(NetworkCard::class); }
    public function raidController():HasOne { return $this->hasOne(RaidController::class); }
    public function coolingSolution():HasOne{ return $this->hasOne(CoolingSolution::class); }
    public function chassis():       HasOne { return $this->hasOne(Chassis::class); }
    public function graphicCard():   HasOne { return $this->hasOne(GraphicCard::class); }
    public function fiberOpticCard():HasOne { return $this->hasOne(FiberOpticCard::class); }
    public function expansionCard(): HasOne { return $this->hasOne(ExpansionCard::class); }
    public function cableConnector():HasOne { return $this->hasOne(CableConnector::class); }
    public function battery():       HasOne { return $this->hasOne(Battery::class); }
    public function license():       HasOne { return $this->hasOne(License::class); }
    public function software():      HasOne { return $this->hasOne(Software::class); }
    public function accessory():     HasOne { return $this->hasOne(Accessory::class); }
}
