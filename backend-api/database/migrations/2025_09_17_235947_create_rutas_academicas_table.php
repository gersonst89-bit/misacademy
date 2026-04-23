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
        Schema::create('rutas_academicas', function (Blueprint $table) {
            $table->id('id_ruta');
            $table->string('nombre', 100);
            $table->text('descripcion')->nullable();
            $table->unsignedBigInteger('id_linea_academica');
            $table->string('imagen', 255)->nullable();
            $table->integer('horas_totales');
            $table->enum('nivel', ['Principiante', 'Intermedio', 'Avanzado']);
            $table->decimal('precio', 10, 2);
            $table->enum('estado', ['Activa', 'Inactiva', 'Borrador'])->default('Activa');
            $table->boolean('destacado')->default(false);
            $table->datetime('fecha_creacion')->useCurrent();
            $table->datetime('fecha_actualizacion')->nullable()->useCurrentOnUpdate();
            
            $table->foreign('id_linea_academica')->references('id_linea')->on('lineas_academicas')->onDelete('restrict')->onUpdate('cascade');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('rutas_academicas');
    }
};
