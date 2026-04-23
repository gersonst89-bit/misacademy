<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Leccion extends Model
{
    protected $table = 'lecciones';
    protected $primaryKey = 'id_leccion';
    public $timestamps = false;
    protected $fillable = [
        'id_modulo', 'titulo', 'descripcion', 'url_video', 'duracion', 'orden', 'estado', 'fecha_creacion', 'fecha_actualizacion'
    ];

public function curso()
{
    return $this->hasOneThrough(
        \App\Models\Curso::class,
        \App\Models\Modulo::class,
        'id_modulo',
        'id_curso',
        'id_modulo',
        'id_curso'
    );
}
    public function modulo()
    {
        return $this->belongsTo(Modulo::class, 'id_modulo');
    }
}
