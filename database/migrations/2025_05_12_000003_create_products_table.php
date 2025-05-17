<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('products', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->string('name');
            $table->string('sku')->unique();
            $table->text('description')->nullable();
            $table->decimal('price', 12, 2);
            $table->unsignedInteger('stock_quantity')->default(0);

            $table->char('currency_code', 3);
            $table->foreign('currency_code')
                  ->references('code')->on('currencies');

            $table->foreignId('tax_rate_id')->constrained('tax_rates');
            $table->foreignId('category_id')->constrained('categories');

            $table->string('image_main')->nullable();
            $table->boolean('is_active')->default(true);

            $table->timestamps();
            $table->softDeletes();

            $table->index(['name', 'sku']);
        });
    }
    public function down(): void { Schema::dropIfExists('products'); }
};
