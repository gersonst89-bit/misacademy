<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('materiales', function (Blueprint $table) {
            if (Schema::hasColumn('materiales', 'tipo')) {
                $table->dropColumn('tipo');
            }
        });
    }

    public function down(): void
    {
        Schema::table('materiales', function (Blueprint $table) {
            if (!Schema::hasColumn('materiales', 'tipo')) {
                $table->enum('tipo', ['PDF', 'DOC', 'PPT', 'Imagen', 'Otro'])->after('descripcion');
            }
        });
    }
};