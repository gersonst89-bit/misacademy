<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('materiales', function (Blueprint $table) {
            $table->id('id_material');
            $table->unsignedBigInteger('id_modulo');
            $table->string('nombre', 100);
            $table->text('descripcion')->nullable();
            $table->string('url_archivo', 255);
            $table->enum('estado', ['Publicado', 'Archivado'])->default('Publicado');
            $table->integer('tamanio')->nullable()->comment('Tamaño en KB');
            $table->dateTime('fecha_creacion')->default(DB::raw('CURRENT_TIMESTAMP'));

            $table->foreign('id_modulo')->references('id_modulo')->on('modulos')->onDelete('cascade')->onUpdate('cascade');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('materiales');
    }
};
