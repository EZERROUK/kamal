<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Category;
use Illuminate\Support\Str;

class CategorySeeder extends Seeder
{
    public function run(): void
    {
        $categories = [
            'rams', 'processors', 'hard_drives', 'power_supplies', 'motherboards',
            'network_cards', 'graphic_cards', 'licenses', 'softwares', 'accessories'
        ];

        foreach ($categories as $name) {
            Category::firstOrCreate(
                ['slug' => $name],
                ['name' => Str::title(str_replace('_', ' ', $name))]
            );
        }
    }
}
