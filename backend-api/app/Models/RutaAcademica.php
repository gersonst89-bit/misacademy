<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class RutaAcademica extends Model
{
    protected $table = 'rutas_academicas';
    protected $primaryKey = 'id_ruta';
    public $timestamps = false;
    protected $fillable = [
        'nombre', 'descripcion', 'id_linea_academica', 'imagen', 'horas_totales', 'nivel', 'precio', 'estado', 'destacado', 'fecha_creacion', 'fecha_actualizacion'
    ];

    public function lineaAcademica()
    {
        return $this->belongsTo(LineaAcademica::class, 'id_linea_academica');
    }

    public function cursos()
    {
        return $this->belongsToMany(Curso::class, 'cursos_rutas', 'id_ruta', 'id_curso')->withPivot('orden');
    }
}
