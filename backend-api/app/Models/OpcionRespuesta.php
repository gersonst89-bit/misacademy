<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class OpcionRespuesta extends Model
{
    protected $table = 'opciones_respuesta';
    protected $primaryKey = 'id_opcion';
    public $timestamps = false;
    protected $fillable = [
        'id_pregunta', 'texto_opcion', 'es_correcta'
    ];

    public function pregunta()
    {
        return $this->belongsTo(Pregunta::class, 'id_pregunta');
    }
}
