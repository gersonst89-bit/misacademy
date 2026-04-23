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
        Schema::create('usuarios', function (Blueprint $table) {
            $table->id('id_usuario');
            $table->unsignedBigInteger('id_rol');
            $table->string('nombre', 100);
            $table->string('apellido', 100);
            $table->string('dni', 20)->unique()->nullable();
            $table->string('email', 100)->unique();
            $table->string('password', 255);
            $table->string('telefono', 20)->nullable();
            $table->string('imagen_perfil', 255)->nullable();
            $table->text('biografia')->nullable();
            $table->boolean('email_verificado')->default(false);
            $table->enum('estado', ['Activo', 'Inactivo', 'Suspendido'])->default('Activo');
            $table->datetime('fecha_registro')->useCurrent();
            $table->datetime('ultimo_acceso')->useCurrent();
            
            $table->foreign('id_rol')->references('id_rol')->on('rol')->onDelete('restrict')->onUpdate('cascade');
            $table->index(['email']);
            $table->index(['nombre', 'apellido']);
            $table->index(['estado']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('usuarios');
    }
};
