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
        Schema::create('contacto', function (Blueprint $table) {
            $table->id('id_contacto');
            $table->string('nombre', 100);
            $table->string('apellido', 100);
            $table->string('email', 100);
            $table->string('telefono', 20)->nullable();
            $table->string('asunto', 255);
            $table->text('mensaje');
            $table->dateTime('fecha_envio')->default(DB::raw('CURRENT_TIMESTAMP'));
            $table->enum('estado', ['Pendiente', 'Respondido', 'Archivado'])->default('Pendiente');
            $table->dateTime('fecha_respuesta')->nullable();
            $table->text('respuesta')->nullable();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('contacto');
    }
};
