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
        Schema::create('tokens_usuario', function (Blueprint $table) {
            $table->id('id_token');
            $table->unsignedBigInteger('id_usuario');
            $table->string('token', 100)->unique();
            $table->enum('tipo', ['Verificacion', 'Reseteo', 'API']);
            $table->dateTime('fecha_creacion')->default(DB::raw('CURRENT_TIMESTAMP'));
            $table->dateTime('fecha_expiracion');
            $table->boolean('usado')->default(false);

            $table->foreign('id_usuario')->references('id_usuario')->on('usuarios')->onDelete('cascade')->onUpdate('cascade');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('tokens_usuario');
    }
};
