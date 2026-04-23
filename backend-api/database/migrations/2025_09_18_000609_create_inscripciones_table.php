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
        Schema::create('inscripciones', function (Blueprint $table) {
            $table->id('id_inscripcion');
            $table->unsignedBigInteger('id_usuario');
            $table->unsignedBigInteger('id_curso');
            $table->datetime('fecha_inscripcion')->useCurrent();
            $table->enum('estado', ['Activo', 'Completado', 'Abandonado', 'Suspendido'])->default('Activo');
            $table->decimal('progreso_total', 5, 2)->default(0);
            $table->datetime('fecha_completado')->nullable();
            
            $table->foreign('id_usuario')->references('id_usuario')->on('usuarios')->onDelete('cascade')->onUpdate('cascade');
            $table->foreign('id_curso')->references('id_curso')->on('cursos')->onDelete('restrict')->onUpdate('cascade');
            
            $table->unique(['id_usuario', 'id_curso'], 'unique_inscripcion');
            $table->index(['id_usuario']);
            $table->index(['id_curso']);
            $table->index(['estado']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('inscripciones');
    }
};
