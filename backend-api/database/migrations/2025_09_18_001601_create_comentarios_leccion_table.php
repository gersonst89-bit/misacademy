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
        Schema::create('comentarios_leccion', function (Blueprint $table) {
            $table->id('id_comentario');
            $table->unsignedBigInteger('id_usuario');
            $table->unsignedBigInteger('id_leccion');
            $table->text('comentario');
            $table->datetime('fecha_comentario');
            $table->unsignedBigInteger('comentario_padre_id')->nullable();
            
            $table->foreign('id_usuario')->references('id_usuario')->on('usuarios')->onDelete('cascade')->onUpdate('cascade');
            $table->foreign('id_leccion')->references('id_leccion')->on('lecciones')->onDelete('cascade')->onUpdate('cascade');
            $table->foreign('comentario_padre_id')->references('id_comentario')->on('comentarios_leccion')->onDelete('cascade')->onUpdate('cascade');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('comentarios_leccion');
    }
};
