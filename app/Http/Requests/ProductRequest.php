<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class ProductRequest extends FormRequest
{
    public function authorize(): bool
    {
        return match ($this->method()) {
            'POST'   => $this->user()->can('product_create'),
            'PATCH'  => $this->user()->can('product_edit'),
            'DELETE' => $this->user()->can('product_delete'),
            default  => true,
        };
    }

    public function rules(): array
    {
        $id = $this->route('product');

        // Règles de base
        $rules = [
            'name'           => ['required', 'string', 'max:255'],
            'sku'            => ['required', 'string', 'max:50', Rule::unique('products','sku')->ignore($id)],
            'description'    => ['nullable', 'string'],
            'price'          => ['required', 'numeric', 'min:0'],
            'stock_quantity' => ['required', 'integer', 'min:0'],
            'currency_code'  => ['required', 'exists:currencies,code'],
            'tax_rate_id'    => ['required', 'exists:tax_rates,id'],
            'category_id'    => ['required', 'exists:categories,id'],
            'is_active'      => ['boolean'],
        ];


        if ($this->isMethod('POST') || $this->isMethod('PATCH')) {
            $rules['images']               = ['nullable', 'array'];
            $rules['images.*']             = ['image', 'mimes:jpg,jpeg,png,webp', 'max:2048'];
            $rules['primary_image_index']  = ['nullable', 'integer', 'min:0'];

            $rules['deleted_image_ids']    = ['nullable', 'array'];
            $rules['deleted_image_ids.*']  = ['integer', 'exists:product_images,id'];

            $rules['restored_image_ids']   = ['nullable', 'array'];
            $rules['restored_image_ids.*'] = ['integer', 'exists:product_images,id'];
        }

        return $rules;
    }
}
