<?php

namespace Database\Factories;

use App\Models\Product;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;

class ProductFactory extends Factory
{
    protected $model = Product::class;

    public function definition(): array
    {
        return [
            'id'             => Str::uuid()->toString(),
            'name'           => $this->faker->unique()->words(3, true),
            'sku'            => strtoupper($this->faker->bothify('SRV-######')),
            'description'    => $this->faker->paragraph(),
            'price'          => $this->faker->randomFloat(2, 50, 2500),
            'stock_quantity' => $this->faker->numberBetween(0, 150),
            'currency_code'  => 'USD',                 // surchargé par seeder
            'tax_rate_id'    => 1,                     // idem
            'category_id'    => 1,                     // idem
            'is_active'      => $this->faker->boolean(90),
        ];
    }
}
