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
        Schema::create('notificaciones', function (Blueprint $table) {
            $table->id('id_notificacion');
            $table->unsignedBigInteger('id_usuario');
            $table->string('titulo', 100);
            $table->text('mensaje');
            $table->enum('tipo', ['Sistema', 'Curso', 'Pago', 'Certificacion']);
            $table->boolean('leida')->default(false);
            $table->datetime('fecha_creacion');
            $table->datetime('fecha_leida')->nullable();
            
            $table->foreign('id_usuario')->references('id_usuario')->on('usuarios')->onDelete('cascade')->onUpdate('cascade');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('notificaciones');
    }
};
