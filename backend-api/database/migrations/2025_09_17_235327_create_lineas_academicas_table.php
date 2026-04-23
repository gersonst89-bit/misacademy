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
        Schema::create('lineas_academicas', function (Blueprint $table) {
            $table->id('id_linea');
            $table->string('nombre', 100)->unique();
            $table->text('descripcion')->nullable();
            $table->string('imagen', 255)->nullable();
            $table->enum('estado', ['Publicado', 'Archivado'])->default('Publicado');
            $table->datetime('fecha_creacion')->useCurrent();
            $table->datetime('fecha_actualizacion')->nullable()->useCurrentOnUpdate();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('lineas_academicas');
    }
};
