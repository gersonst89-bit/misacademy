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
        Schema::create('certificaciones', function (Blueprint $table) {
            $table->id('id_certificacion');
            $table->string('tipo_certificado', 20)->default('empresa'); // empresa o adicional
            $table->unsignedBigInteger('id_usuario'); // solo para empresa
            $table->unsignedBigInteger('id_curso');    // solo para empresa
            $table->datetime('fecha_emision');
            $table->string('codigo_certificado', 50)->unique();
            $table->decimal('calificacion_final', 5, 2); // solo para empresa
            $table->string('url_certificado', 255)->nullable();

            // Campos para certificados adicionales
            $table->string('nombre_curso', 255)->nullable();
            $table->string('nombre_estudiante', 255)->nullable();
            $table->date('fecha_inicio')->nullable();
            $table->date('fecha_fin')->nullable();
            $table->integer('total_horas')->nullable();
            $table->string('email_destinatario', 255)->nullable();

            $table->foreign('id_usuario')->references('id_usuario')->on('usuarios')->onDelete('cascade')->onUpdate('cascade');
            $table->foreign('id_curso')->references('id_curso')->on('cursos')->onDelete('cascade')->onUpdate('cascade');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('certificaciones');
    }
};
