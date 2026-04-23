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
        Schema::create('lecciones', function (Blueprint $table) {
            $table->id('id_leccion');
            $table->unsignedBigInteger('id_modulo');
            $table->string('titulo', 100);
            $table->text('descripcion')->nullable();
            $table->string('url_video', 255)->nullable();
            $table->integer('duracion')->nullable()->comment('Duración en segundos');
            $table->integer('orden');
            $table->enum('estado', ['Archivado', 'Publicado'])->default('Publicado');
            $table->datetime('fecha_creacion')->useCurrent();
            $table->datetime('fecha_actualizacion')->nullable()->useCurrentOnUpdate();
            $table->foreign('id_modulo')->references('id_modulo')->on('modulos')->onDelete('cascade')->onUpdate('cascade');
            $table->index(['id_modulo']);
            $table->unique(['id_modulo', 'orden'], 'leccion_orden_unico_por_modulo');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('lecciones');
    }
};
