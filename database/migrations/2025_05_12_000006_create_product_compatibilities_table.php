<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('product_compatibilities', function (Blueprint $table) {
            $table->id();
            $table->uuid('product_id');
            $table->uuid('compatible_with_id');
            $table->string('type')->nullable();       // Electrical, Firmware...
            $table->string('direction')->default('bidirectional'); // or 'uni'
            $table->text('note')->nullable();
            $table->timestamps();
            $table->softDeletes();

            $table->foreign('product_id')
                  ->references('id')->on('products')
                  ->onDelete('cascade');
            $table->foreign('compatible_with_id')
                  ->references('id')->on('products')
                  ->onDelete('cascade');

            $table->unique(['product_id', 'compatible_with_id']);
        });
    }
    public function down(): void { Schema::dropIfExists('product_compatibilities'); }
};
