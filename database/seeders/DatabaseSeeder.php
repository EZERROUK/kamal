<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        $this->call([
            RolePermissionSeeder::class,
            CategorySeeder::class,
            CurrencySeeder::class,
            TaxRateSeeder::class,
            ProductSeeder::class,
            AppSettingSeeder::class,

        ]);

        \App\Models\User::factory()->create([
            'name' => 'SuperAdmin',
            'email' => 'SuperAdmin@example.com',
        ])->assignRole('SuperAdmin');
    }
}

