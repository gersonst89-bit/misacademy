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
        Schema::create('cursos_rutas', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('id_curso');
            $table->unsignedBigInteger('id_ruta');
            $table->integer('orden');

            $table->foreign('id_curso')->references('id_curso')->on('cursos')->onDelete('cascade')->onUpdate('cascade');
            $table->foreign('id_ruta')->references('id_ruta')->on('rutas_academicas')->onDelete('cascade')->onUpdate('cascade');
            $table->unique(['id_curso', 'id_ruta'], 'unique_curso_ruta');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('cursos_rutas');
    }
};
