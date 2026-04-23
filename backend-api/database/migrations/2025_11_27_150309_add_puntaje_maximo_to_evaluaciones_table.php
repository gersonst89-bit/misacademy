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
        Schema::table('evaluaciones', function (Blueprint $table) {
            $table->decimal('puntaje_maximo', 8, 2)->default(100.00)->after('puntuacion_requerida');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('evaluaciones', function (Blueprint $table) {
            $table->dropColumn('puntaje_maximo');
        });
    }
};
