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
        Schema::create('tipos_pagos', function (Blueprint $table) {
            $table->id('id_tipo_pago');
            $table->string('nombre', 50);
            $table->text('descripcion')->nullable();
            $table->boolean('activo')->default(true);
            $table->decimal('comision', 5, 2)->default(0);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('tipos_pagos');
    }
};
