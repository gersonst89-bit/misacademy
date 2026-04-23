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
        Schema::create('sesiones_usuario', function (Blueprint $table) {
            $table->string('id_sesion', 255)->primary();
            $table->unsignedBigInteger('id_usuario');
            $table->string('ip_address', 45)->nullable();
            $table->text('user_agent')->nullable();
            $table->text('payload')->nullable();
            $table->dateTime('ultimo_acceso');

            $table->foreign('id_usuario')->references('id_usuario')->on('usuarios')->onDelete('cascade')->onUpdate('cascade');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('sesiones_usuario');
    }
};
