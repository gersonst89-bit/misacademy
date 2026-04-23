<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::table('evaluaciones', function (Blueprint $table) {
            $table->enum('tipo', ['final', 'test'])->default('test')->after('estado');
        });
    }

    public function down(): void
    {
        Schema::table('evaluaciones', function (Blueprint $table) {
            $table->dropColumn('tipo');
        });
    }
};
