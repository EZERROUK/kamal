<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\{
    Category,Product, Ram, Processor, HardDrive, PowerSupply,
    Motherboard, NetworkCard, GraphicCard, License, Accessory
};
use Database\Factories\{
    RamFactory, ProcessorFactory, HardDriveFactory, PowerSupplyFactory,
    MotherboardFactory, NetworkCardFactory, GraphicCardFactory,
    LicenseFactory, AccessoryFactory
};
use Illuminate\Support\Arr;

class ProductSeeder extends Seeder
{
    public function run(): void
    {
        $categories = Category::pluck('id', 'slug');
        $taxRateId  = 1;

        /** combien de produits par type ? */
        $counts = [
            'rams'          => 30,
            'processors'    => 20,
            'hard_drives'   => 20,
            'graphic_cards' => 10,
            'licenses'      => 10,
            'accessories'   => 10,
        ];

        foreach ($counts as $slug => $qty) {
            for ($i = 0; $i < $qty; $i++) {
                $product = Product::factory()->create([
                    'category_id'   => $categories[$slug],
                    'currency_code' => Arr::random(['USD', 'EUR']),
                    'tax_rate_id'   => $taxRateId,
                ]);

                /** Spécifique : crée l’enfant avec le même UUID */
                match ($slug) {
                    'rams'          => Ram::factory()->create(['product_id' => $product->id]),
                    'processors'    => Processor::factory()->create(['product_id' => $product->id]),
                    'hard_drives'   => HardDrive::factory()->create(['product_id' => $product->id]),
                    'graphic_cards' => GraphicCard::factory()->create(['product_id' => $product->id]),
                    'licenses'      => License::factory()->create(['product_id' => $product->id]),
                    'accessories'   => Accessory::factory()->create(['product_id' => $product->id]),
                };
            }
        }
    }
}
