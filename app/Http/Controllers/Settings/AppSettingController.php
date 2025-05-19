<?php

namespace App\Http\Controllers\Settings;

use App\Http\Controllers\Controller;
use App\Models\AppSetting;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;
use Inertia\Response;
use Intervention\Image\ImageManager;
use Intervention\Image\Drivers\Gd\Driver;
use Intervention\Image\Encoders\PngEncoder;

class AppSettingController extends Controller
{
    public function edit(): Response
    {
        $settings = AppSetting::first();
        if (!$settings) {
            $settings = AppSetting::create(['app_name' => 'X-Zone']);
        }

        return Inertia::render('settings/app', [
            'settings' => $settings,
        ]);
    }

    public function update(Request $request)
    {
        $data = $request->validate([
            'app_name'         => 'required|string|max:100',
            'app_slogan'       => 'nullable|string|max:255',
            'primary_color'    => 'nullable|string|max:32',
            'secondary_color'  => 'nullable|string|max:32',
            'contact_email'    => 'nullable|email|max:100',
            'contact_phone'    => 'nullable|string|max:32',
            'contact_address'  => 'nullable|string|max:255',
            'cgu_url'          => 'nullable|url|max:255',
            'privacy_url'      => 'nullable|url|max:255',
            'copyright'        => 'nullable|string|max:255',
            'meta_keywords'    => 'nullable|string|max:1000',
            'meta_description' => 'nullable|string|max:1000',
            'logo'             => 'nullable|image|mimes:jpeg,png,svg,webp|max:2048',
            'logo_dark'        => 'nullable|image|mimes:jpeg,png,svg,webp|max:2048',
            'favicon'          => 'nullable|image|mimes:png,ico|max:512',
            'social_links'     => 'nullable|array',
            'social_links.*'   => 'nullable|url|max:255',
        ]);

        $settings = AppSetting::firstOrFail();

        // Initialize ImageManager with GD driver
        $manager = new ImageManager(new Driver());

        // LOGO PRINCIPAL
        if ($request->hasFile('logo')) {
            $logoPath = $request->file('logo')->store('logos', 'public');
            $data['logo_path'] = $logoPath;

            // Générer le favicon à partir du logo si non fourni
            if (!$request->hasFile('favicon')) {
                // Read the image file
                $img = $manager->read($request->file('logo')->getPathname());

                // Resize the image (fixed method call)
                $img->resize(48, 48);

                // Encode to PNG using the proper encoder
                $encodedImage = $img->encode(new PngEncoder());

                // Save the image
                $faviconPath = 'favicons/' . uniqid() . '.png';
                Storage::disk('public')->put($faviconPath, $encodedImage);
                $data['favicon_path'] = $faviconPath;
            }
        }

        // LOGO DARK (optionnel)
        if ($request->hasFile('logo_dark')) {
            $data['logo_dark_path'] = $request->file('logo_dark')->store('logos', 'public');
        }

        // FAVICON MANUEL (prioritaire)
        if ($request->hasFile('favicon')) {
            $data['favicon_path'] = $request->file('favicon')->store('favicons', 'public');
        }

        // Réseaux sociaux
        if ($request->filled('social_links')) {
            $data['social_links'] = json_encode($request->input('social_links'));
        }

        $settings->update($data);

        return redirect()->route('settings.app.edit')->with('success', 'Paramètres enregistrés !');
    }
}
