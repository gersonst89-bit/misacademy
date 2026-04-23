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
        Schema::create('preguntas', function (Blueprint $table) {
            $table->id('id_pregunta');
            $table->unsignedBigInteger('id_evaluacion');
            $table->text('texto_pregunta');
            $table->enum('tipo', ['Opcion multiple', 'Verdadero/Falso', 'Texto libre']);
            $table->decimal('puntos', 5, 2)->default(1.0);
            $table->integer('orden');
            
            $table->foreign('id_evaluacion')->references('id_evaluacion')->on('evaluaciones')->onDelete('cascade')->onUpdate('cascade');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('preguntas');
    }
};
