<?php

namespace App\Models;

class GraphicCard extends SpecializedProduct
{
    protected $casts = [
        'vram'             => 'integer',
        'core_clock'       => 'integer',
        'boost_clock'      => 'integer',
        'power_consumption'=> 'integer',
    ];
}
