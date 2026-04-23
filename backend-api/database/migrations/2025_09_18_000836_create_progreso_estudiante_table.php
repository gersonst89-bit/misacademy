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
        Schema::create('progreso_estudiante', function (Blueprint $table) {
            $table->id('id_progreso');
            $table->unsignedBigInteger('id_inscripcion');
            $table->unsignedBigInteger('id_leccion');
            $table->enum('estado', ['No iniciado', 'En progreso', 'Completado'])->default('No iniciado');
            $table->integer('tiempo_visualizacion')->default(0)->comment('Tiempo en segundos');
            $table->decimal('porcentaje_completado', 5, 2)->default(0);
            $table->datetime('ultima_actividad')->nullable();
            $table->datetime('fecha_completado')->nullable();
            
            $table->foreign('id_inscripcion')->references('id_inscripcion')->on('inscripciones')->onDelete('cascade')->onUpdate('cascade');
            $table->foreign('id_leccion')->references('id_leccion')->on('lecciones')->onDelete('cascade')->onUpdate('cascade');
            
            $table->unique(['id_inscripcion', 'id_leccion'], 'unique_progreso');
            $table->index(['id_inscripcion']);
            $table->index(['estado']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('progreso_estudiante');
    }
};
