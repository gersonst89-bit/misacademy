<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class CarritoCompra extends Model
{
    protected $table = 'carrito_compras';
    protected $primaryKey = 'id_carrito';
    public $timestamps = false;
    protected $fillable = [
        'id_usuario', 'fecha_creacion', 'fecha_actualizacion', 'estado'
    ];

    public function usuario()
    {
        return $this->belongsTo(Usuario::class, 'id_usuario');
    }

    public function items()
    {
        return $this->hasMany(CarritoItem::class, 'id_carrito');
    }
}
