<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class RespuestaUsuario extends Model
{
    protected $table = 'respuestas_usuario';
    protected $primaryKey = 'id_respuesta';
    public $timestamps = false;
    protected $fillable = [
        'id_intento', 'id_pregunta', 'id_opcion', 'respuesta_texto', 'puntos_obtenidos'
    ];

    public function intento()
    {
        return $this->belongsTo(IntentoEvaluacion::class, 'id_intento');
    }

    public function pregunta()
    {
        return $this->belongsTo(Pregunta::class, 'id_pregunta');
    }

    public function opcion()
    {
        return $this->belongsTo(OpcionRespuesta::class, 'id_opcion');
    }
}
