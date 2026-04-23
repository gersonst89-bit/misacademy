<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class LineaAcademica extends Model
{
    protected $table = 'lineas_academicas';
    protected $primaryKey = 'id_linea';
    public $timestamps = false;
    protected $fillable = [
        'nombre', 'descripcion', 'imagen', 'estado', 'fecha_creacion', 'fecha_actualizacion'
    ];

    public function rutasAcademicas()
    {
        return $this->hasMany(RutaAcademica::class, 'id_linea_academica');
    }
}
