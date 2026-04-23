<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class InscripcionRuta extends Model
{
    protected $table = 'inscripciones_rutas';
    protected $primaryKey = 'id_inscripcion_ruta';
    public $timestamps = false;
    protected $fillable = [
        'id_usuario', 'id_ruta', 'fecha_inscripcion', 'estado', 'progreso_total', 'fecha_completado'
    ];

    public function usuario()
    {
        return $this->belongsTo(Usuario::class, 'id_usuario');
    }

    public function rutaAcademica()
    {
        return $this->belongsTo(RutaAcademica::class, 'id_ruta');
    }
}
