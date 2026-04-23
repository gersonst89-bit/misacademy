<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class CreateReclamacionesTable extends Migration
{
    public function up()
    {
        Schema::create('reclamaciones', function (Blueprint $table) {
            $table->id();
            $table->string('nombre_completo');
            $table->string('dni');
            $table->string('email');
            $table->string('tipo_reclamo');
            $table->string('asunto');
            $table->text('descripcion');
            $table->timestamps();
        });
    }

    public function down()
    {
        Schema::dropIfExists('reclamaciones');
    }
}
