<?php

namespace App\Models;

class Software extends SpecializedProduct
{
    protected $casts = [
        'license_included' => 'boolean',
    ];
}
