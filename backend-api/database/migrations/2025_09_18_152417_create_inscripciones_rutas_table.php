<?php


use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('inscripciones_rutas', function (Blueprint $table) {
            $table->id('id_inscripcion_ruta');
            $table->unsignedBigInteger('id_usuario');
            $table->unsignedBigInteger('id_ruta');
            $table->dateTime('fecha_inscripcion')->default(DB::raw('CURRENT_TIMESTAMP'));
            $table->enum('estado', ['Activo', 'Completado', 'Abandonado', 'Suspendido'])->default('Activo');
            $table->decimal('progreso_total', 5, 2)->default(0);
            $table->dateTime('fecha_completado')->nullable();

            $table->foreign('id_usuario')->references('id_usuario')->on('usuarios')->onDelete('cascade')->onUpdate('cascade');
            $table->foreign('id_ruta')->references('id_ruta')->on('rutas_academicas')->onDelete('restrict')->onUpdate('cascade');
            $table->unique(['id_usuario', 'id_ruta'], 'unique_inscripcion_ruta');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('inscripciones_rutas');
    }
};
