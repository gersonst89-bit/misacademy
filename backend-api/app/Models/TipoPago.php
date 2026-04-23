<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class TipoPago extends Model
{
    protected $table = 'tipos_pagos';
    protected $primaryKey = 'id_tipo_pago';
    public $timestamps = false;
    protected $fillable = [
        'nombre', 'descripcion', 'activo', 'comision'
    ];

    public function pagos()
    {
        return $this->hasMany(Pago::class, 'id_tipo_pago');
    }
}
