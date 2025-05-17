<?php

namespace App\Models;

class PowerSupply extends SpecializedProduct
{
    protected $casts = [
        'power'             => 'integer',
        'modular'           => 'boolean',
    ];
}
