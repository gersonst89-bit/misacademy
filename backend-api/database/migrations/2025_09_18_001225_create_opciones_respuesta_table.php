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
        Schema::create('opciones_respuesta', function (Blueprint $table) {
            $table->id('id_opcion');
            $table->unsignedBigInteger('id_pregunta');
            $table->text('texto_opcion');
            $table->boolean('es_correcta')->default(false);
            
            $table->foreign('id_pregunta')->references('id_pregunta')->on('preguntas')->onDelete('cascade')->onUpdate('cascade');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('opciones_respuesta');
    }
};
