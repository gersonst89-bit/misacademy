<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class DetallePago extends Model
{
    protected $table = 'detalle_pagos';
    protected $primaryKey = 'id_detalle';
    public $timestamps = false;
    protected $fillable = [
        'id_pago', 'id_curso', 'precio_unitario', 'descuento', 'total'
    ];

    public function pago()
    {
        return $this->belongsTo(Pago::class, 'id_pago');
    }

    public function curso()
    {
        return $this->belongsTo(Curso::class, 'id_curso');
    }
}
