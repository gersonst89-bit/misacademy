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
        Schema::create('modulos', function (Blueprint $table) {
            $table->id('id_modulo');
            $table->unsignedBigInteger('id_curso');
            $table->string('titulo', 100);
            $table->text('descripcion')->nullable();
            $table->integer('orden');
            $table->enum('estado', ['Publicado', 'Archivado'])->default('Publicado');
            $table->datetime('fecha_creacion')->useCurrent();
            $table->datetime('fecha_actualizacion')->nullable()->useCurrentOnUpdate();
            $table->unique(['id_curso', 'orden'], 'modulo_orden_unico_por_curso');
            $table->foreign('id_curso')->references('id_curso')->on('cursos')->onDelete('cascade')->onUpdate('cascade');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('modulos');
    }
};
