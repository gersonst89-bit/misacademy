<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use OwenIt\Auditing\Contracts\Auditable;

class Inscripcion extends Model implements Auditable
{
    use \OwenIt\Auditing\Auditable;
    protected $table = 'inscripciones';
    protected $primaryKey = 'id_inscripcion';
    public $timestamps = false;
    protected $fillable = [
        'id_usuario', 'id_curso', 'fecha_inscripcion', 'estado', 'progreso_total', 'fecha_completado'
    ];

    protected $auditExclude = [];
    public function usuario()
    {
        return $this->belongsTo(Usuario::class, 'id_usuario');
    }

    public function curso()
    {
        return $this->belongsTo(Curso::class, 'id_curso');
    }
    public function progresos()
{
    return $this->hasMany(\App\Models\ProgresoEstudiante::class, 'id_inscripcion');
}
}
