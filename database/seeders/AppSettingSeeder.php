<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\AppSetting;

class AppSettingSeeder extends Seeder
{
    public function run()
    {
        AppSetting::firstOrCreate([
            'app_name' => 'X-Zone',
            'app_slogan' => 'Technologie',
            'primary_color' => '#6366f1',
            'secondary_color' => '#f59e42',
            'contact_email' => 'contact@x-zone.com',
            'copyright' => '© 2024 X-Zone.',
        ]);
    }
}
