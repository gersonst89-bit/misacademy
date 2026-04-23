<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Pregunta extends Model
{
    protected $table = 'preguntas';
    protected $primaryKey = 'id_pregunta';
    public $timestamps = false;
    protected $fillable = [
        'id_evaluacion', 'texto_pregunta', 'tipo', 'puntos', 'orden'
    ];

    public function evaluacion()
    {
        return $this->belongsTo(Evaluacion::class, 'id_evaluacion');
    }

    public function opciones()
    {
        return $this->hasMany(OpcionRespuesta::class, 'id_pregunta');
    }
}
