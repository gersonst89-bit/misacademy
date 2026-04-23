<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Modulo extends Model
{
    protected $table = 'modulos';
    protected $primaryKey = 'id_modulo';
    public $timestamps = false;
    protected $fillable = [
    'id_curso', 'titulo', 'descripcion', 'orden', 'estado', 'fecha_creacion', 'fecha_actualizacion'
    ];

    public function curso()
    {
        return $this->belongsTo(Curso::class, 'id_curso');
    }

    public function lecciones(): HasMany
    {
        return $this->hasMany(Leccion::class, 'id_modulo');
    }
}
