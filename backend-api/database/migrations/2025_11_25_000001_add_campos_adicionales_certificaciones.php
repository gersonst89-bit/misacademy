<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('certificaciones', function (Blueprint $table) {

            if (!Schema::hasColumn('certificaciones', 'tipo_certificado')) {
                $table->string('tipo_certificado', 20)->default('empresa')->after('id_certificacion');
            }

            if (!Schema::hasColumn('certificaciones', 'nombre_curso')) {
                $table->string('nombre_curso', 255)->nullable()->after('url_certificado');
            }

            if (!Schema::hasColumn('certificaciones', 'nombre_estudiante')) {
                $table->string('nombre_estudiante', 255)->nullable()->after('nombre_curso');
            }

            if (!Schema::hasColumn('certificaciones', 'fecha_inicio')) {
                $table->date('fecha_inicio')->nullable()->after('nombre_estudiante');
            }

            if (!Schema::hasColumn('certificaciones', 'fecha_fin')) {
                $table->date('fecha_fin')->nullable()->after('fecha_inicio');
            }

            if (!Schema::hasColumn('certificaciones', 'total_horas')) {
                $table->integer('total_horas')->nullable()->after('fecha_fin');
            }

            if (!Schema::hasColumn('certificaciones', 'email_destinatario')) {
                $table->string('email_destinatario', 255)->nullable()->after('total_horas');
            }

        });
    }

    public function down(): void
    {
        Schema::table('certificaciones', function (Blueprint $table) {

            $columns = [
                'tipo_certificado',
                'nombre_curso',
                'nombre_estudiante',
                'fecha_inicio',
                'fecha_fin',
                'total_horas',
                'email_destinatario'
            ];

            foreach ($columns as $column) {
                if (Schema::hasColumn('certificaciones', $column)) {
                    $table->dropColumn($column);
                }
            }

        });
    }
};