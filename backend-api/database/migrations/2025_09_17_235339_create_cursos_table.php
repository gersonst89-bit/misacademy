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
        Schema::create('cursos', function (Blueprint $table) {
            $table->id('id_curso');
            $table->unsignedBigInteger('id_docente')->nullable();
            $table->string('nombre', 100);
            $table->text('descripcion')->nullable();
            $table->string('imagen', 255)->nullable();
            $table->integer('duracion')->comment('Duración en minutos');
            $table->decimal('precio', 10, 2);
            $table->enum('nivel', ['Principiante', 'Intermedio', 'Avanzado']);
            $table->enum('estado', ['Publicado', 'Archivado'])->default('Publicado');
            $table->boolean('destacado')->default(false);
            $table->datetime('fecha_creacion')->useCurrent();
            $table->datetime('fecha_actualizacion')->nullable()->useCurrentOnUpdate();

            $table->foreign('id_docente')->references('id_usuario')->on('usuarios')->nullOnDelete()->onUpdate('cascade');

            $table->index(['nombre']);
            $table->index(['nivel', 'precio']);
            $table->index(['estado', 'destacado']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('cursos');
    }
};
