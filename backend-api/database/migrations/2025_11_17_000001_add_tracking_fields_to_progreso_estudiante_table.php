<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class AddTrackingFieldsToProgresoEstudianteTable extends Migration
{
    public function up()
    {
        Schema::table('progreso_estudiante', function (Blueprint $table) {
            $table->integer('ultimo_segundo_visto')->default(0)->after('porcentaje_completado');
            $table->json('segmentos_vistos')->nullable()->after('ultimo_segundo_visto');
            $table->integer('duracion_video')->default(0)->after('segmentos_vistos');
            $table->dateTime('primera_visualizacion')->nullable()->after('duracion_video');

            // Índice para reportes
            $table->index(['estado', 'porcentaje_completado'], 'idx_estado_porcentaje');
        });
    }

    public function down()
    {
        Schema::table('progreso_estudiante', function (Blueprint $table) {
            $table->dropColumn('ultimo_segundo_visto');
            $table->dropColumn('segmentos_vistos');
            $table->dropColumn('duracion_video');
            $table->dropColumn('primera_visualizacion');
            $table->dropIndex('idx_estado_porcentaje');
        });
    }
}