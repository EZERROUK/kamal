<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class AppSetting extends Model
{
    protected $fillable = [
        'app_name', 'app_slogan', 'logo_path', 'logo_dark_path', 'favicon_path',
        'primary_color', 'secondary_color',
        'contact_email', 'contact_phone', 'contact_address',
        'cgu_url', 'privacy_url', 'copyright',
        'social_links', 'meta_keywords', 'meta_description'
    ];

    protected $casts = [
        'social_links' => 'array',
    ];
}
