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
        Schema::table('cursos', function (Blueprint $table) {
            //$table->string('descripcion_corta', 255)->nullable()->after('descripcion');
            // $table->longText('descripcion_larga')->nullable()->after('descripcion_corta'); // Ya existe
            $table->integer('tiempo')->nullable()->after('duracion');
            $table->string('video_previsualizacion', 255)->nullable()->after('imagen');
            $table->text('lo_que_aprenderas')->nullable()->after('video_previsualizacion');
            $table->text('requisitos')->nullable()->after('lo_que_aprenderas');
            // docente ya existe como id_docente
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('cursos', function (Blueprint $table) {
            $table->dropColumn([
                //'descripcion_corta',
                // 'descripcion_larga', // No eliminar porque no la agregamos aquí
                'tiempo',
                'video_previsualizacion',
                'lo_que_aprenderas',
                'requisitos',
            ]);
        });
    }
};
