<?php
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up() {
        Schema::table('certificaciones', function (Blueprint $table) {
            // Cambia el tipo del campo a ENUM
            $table->enum('tipo_certificado', ['empresa', 'adicional'])->default('empresa')->change();
        });
    }

    public function down() {
        Schema::table('certificaciones', function (Blueprint $table) {
            // Revertir a string (ajusta según el tipo original)
            $table->string('tipo_certificado', 20)->default('empresa')->change();
        });
    }
};
