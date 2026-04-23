<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Evaluacion extends Model
{
    protected $table = 'evaluaciones';
    protected $primaryKey = 'id_evaluacion';
    public $timestamps = false;
    protected $fillable = [
        'id_curso', 'titulo', 'descripcion', 'puntuacion_requerida', 'puntaje_maximo', 'duracion', 'intentos_maximos', 'estado', 'tipo', 'fecha_creacion', 'fecha_actualizacion'
    ];

    public function curso()
    {
        return $this->belongsTo(Curso::class, 'id_curso');
    }

    public function preguntas(): HasMany
    {
        return $this->hasMany(Pregunta::class, 'id_evaluacion');
    }
}
