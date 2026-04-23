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
        Schema::create('pagos', function (Blueprint $table) {
            $table->id('id_pago');
            $table->unsignedBigInteger('id_usuario');
            $table->unsignedBigInteger('id_tipo_pago');
            $table->decimal('monto', 10, 2);
            $table->datetime('fecha_pago');
            $table->enum('estado', ['Pendiente', 'Completado', 'Fallido', 'Reembolsado']);
            $table->text('detalles_transaccion')->nullable();
            
            $table->foreign('id_usuario')->references('id_usuario')->on('usuarios')->onDelete('cascade')->onUpdate('cascade');
            $table->foreign('id_tipo_pago')->references('id_tipo_pago')->on('tipos_pagos')->onDelete('restrict')->onUpdate('cascade');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('pagos');
    }
};
