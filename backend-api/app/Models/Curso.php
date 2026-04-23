<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use OwenIt\Auditing\Contracts\Auditable;

class Curso extends Model implements Auditable
{
    use \OwenIt\Auditing\Auditable;
    // Relación muchos a muchos con rutas académicas
    public function rutas()
    {
        return $this->belongsToMany(RutaAcademica::class, 'cursos_rutas', 'id_curso', 'id_ruta')->withPivot('orden');
    }
    protected $table = 'cursos';
    protected $primaryKey = 'id_curso';
    public $timestamps = false;
    protected $fillable = [
        'nombre',
        'descripcion',
        'descripcion_corta',
        'descripcion_larga',
        'imagen',
        'video_previsualizacion',
        'lo_que_aprenderas',
        'requisitos',
        'duracion',
        'tiempo',
        'precio',
        'nivel',
        'estado',
        'destacado',
        'fecha_creacion',
        'fecha_actualizacion',
        'id_docente',
    ];
    protected $auditExclude = ['imagen'];

    public function modulos()
    {
        return $this->hasMany(Modulo::class, 'id_curso');
    }

    public function lecciones()
{
    return $this->hasManyThrough(
        Leccion::class,
        Modulo::class,
        'id_curso',    // Foreign key en módulos
        'id_modulo',   // Foreign key en lecciones
        'id_curso',    // Local key en cursos
        'id_modulo'    // Local key en módulos
    );
}
    public function evaluaciones()
    {
        return $this->hasMany(Evaluacion::class, 'id_curso');
    }

    public function resenas()
    {
        return $this->hasMany(Resena::class, 'id_curso');
    }

    // Relación con el docente (usuario)
    public function docente()
    {
        return $this->belongsTo(Usuario::class, 'id_docente', 'id_usuario');
    }

    // Relación con los detalles de pago (cursos comprados)
    public function detallesPago()
    {
        return $this->hasMany(DetallePago::class, 'id_curso', 'id_curso');
    }

        // Relación con inscripciones
        public function inscripciones()
        {
            return $this->hasMany(Inscripcion::class, 'id_curso', 'id_curso');
        }
}
