<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('certificaciones', function (Blueprint $table) {
            $table->unsignedBigInteger('id_usuario')->nullable()->change();
            $table->unsignedBigInteger('id_curso')->nullable()->change();
            $table->decimal('calificacion_final', 5, 2)->nullable()->change();
        });
    }

    public function down(): void
    {
        Schema::table('certificaciones', function (Blueprint $table) {
            $table->unsignedBigInteger('id_usuario')->nullable(false)->change();
            $table->unsignedBigInteger('id_curso')->nullable(false)->change();
            $table->decimal('calificacion_final', 5, 2)->nullable(false)->change();
        });
    }
};
