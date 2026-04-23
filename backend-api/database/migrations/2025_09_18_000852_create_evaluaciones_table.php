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
        Schema::create('evaluaciones', function (Blueprint $table) {
            $table->id('id_evaluacion');
            $table->unsignedBigInteger('id_curso');
            $table->string('titulo', 100);
            $table->text('descripcion')->nullable();
            $table->decimal('puntuacion_requerida', 5, 2);
            $table->integer('duracion')->nullable()->comment('Duración en minutos');
            $table->integer('intentos_maximos')->default(1);
            $table->enum('estado', ['Publicado', 'Archivado'])->default('Publicado');
            $table->datetime('fecha_creacion')->useCurrent();
            $table->datetime('fecha_actualizacion')->nullable()->useCurrentOnUpdate();
            
            $table->foreign('id_curso')->references('id_curso')->on('cursos')->onDelete('cascade')->onUpdate('cascade');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('evaluaciones');
    }
};
