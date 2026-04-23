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
        Schema::create('detalle_pagos', function (Blueprint $table) {
            $table->id('id_detalle');
            $table->unsignedBigInteger('id_pago');
            $table->unsignedBigInteger('id_curso');
            $table->decimal('precio_unitario', 10, 2);
            $table->decimal('descuento', 10, 2)->default(0);
            $table->decimal('total', 10, 2);
            
            $table->foreign('id_pago')->references('id_pago')->on('pagos')->onDelete('cascade')->onUpdate('cascade');
            $table->foreign('id_curso')->references('id_curso')->on('cursos')->onDelete('cascade')->onUpdate('cascade');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('detalle_pagos');
    }
};
