<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('carrito_items', function (Blueprint $table) {
            $table->id('id_item');
            $table->unsignedBigInteger('id_carrito');
            $table->unsignedBigInteger('id_curso');
            $table->decimal('precio', 10, 2);
            $table->datetime('fecha_agregado');
            
            $table->foreign('id_carrito')->references('id_carrito')->on('carrito_compras')->onDelete('cascade')->onUpdate('cascade');
            $table->foreign('id_curso')->references('id_curso')->on('cursos')->onDelete('cascade')->onUpdate('cascade');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('carrito_items');
    }
};
