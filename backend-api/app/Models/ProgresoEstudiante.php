<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ProgresoEstudiante extends Model
{
    protected $table = 'progreso_estudiante';
    protected $primaryKey = 'id_progreso';
    public $timestamps = false;
    protected $fillable = [
        'id_inscripcion', 'id_leccion', 'estado', 'tiempo_visualizacion', 'porcentaje_completado', 'ultima_actividad', 'fecha_completado',
        'ultimo_segundo_visto', 'segmentos_vistos', 'duracion_video', 'primera_visualizacion'
    ];
    protected $casts = [
    'segmentos_vistos' => 'array',
    'primera_visualizacion' => 'datetime',
];

    public function inscripcion()
    {
        return $this->belongsTo(Inscripcion::class, 'id_inscripcion');
    }

    public function leccion()
    {
        return $this->belongsTo(Leccion::class, 'id_leccion');
    }
    
}
