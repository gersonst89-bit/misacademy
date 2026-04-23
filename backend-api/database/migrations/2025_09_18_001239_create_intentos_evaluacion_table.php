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
        Schema::create('intentos_evaluacion', function (Blueprint $table) {
            $table->id('id_intento');
            $table->unsignedBigInteger('id_usuario');
            $table->unsignedBigInteger('id_evaluacion');
            $table->datetime('fecha_inicio');
            $table->datetime('fecha_finalizacion')->nullable();
            $table->decimal('calificacion', 5, 2)->nullable();
            $table->integer('intento_numero');
            $table->enum('estado', ['En progreso', 'Completado', 'Abandonado']);
            
            $table->foreign('id_usuario')->references('id_usuario')->on('usuarios')->onDelete('cascade')->onUpdate('cascade');
            $table->foreign('id_evaluacion')->references('id_evaluacion')->on('evaluaciones')->onDelete('cascade')->onUpdate('cascade');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('intentos_evaluacion');
    }
};
