<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class IntentoEvaluacion extends Model
{
    protected $table = 'intentos_evaluacion';
    protected $primaryKey = 'id_intento';
    public $timestamps = false;
    protected $fillable = [
        'id_usuario', 'id_evaluacion', 'fecha_inicio', 'fecha_finalizacion', 'calificacion', 'intento_numero', 'estado', 'resultado'
    ];

    public function usuario()
    {
        return $this->belongsTo(Usuario::class, 'id_usuario');
    }

    public function evaluacion()
    {
        return $this->belongsTo(Evaluacion::class, 'id_evaluacion');
    }

    public function respuestas()
    {
        return $this->hasMany(RespuestaUsuario::class, 'id_intento');
    }
}
