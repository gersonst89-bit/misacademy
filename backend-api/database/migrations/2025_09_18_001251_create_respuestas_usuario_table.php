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
        Schema::create('respuestas_usuario', function (Blueprint $table) {
            $table->id('id_respuesta');
            $table->unsignedBigInteger('id_intento');
            $table->unsignedBigInteger('id_pregunta');
            $table->unsignedBigInteger('id_opcion')->nullable();
            $table->text('respuesta_texto')->nullable();
            $table->decimal('puntos_obtenidos', 5, 2)->default(0);
            
            $table->foreign('id_intento')->references('id_intento')->on('intentos_evaluacion')->onDelete('cascade')->onUpdate('cascade');
            $table->foreign('id_pregunta')->references('id_pregunta')->on('preguntas')->onDelete('cascade')->onUpdate('cascade');
            $table->foreign('id_opcion')->references('id_opcion')->on('opciones_respuesta')->onDelete('set null')->onUpdate('cascade');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('respuestas_usuario');
    }
};
