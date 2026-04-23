<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class CarritoItem extends Model
{
    protected $table = 'carrito_items';
    protected $primaryKey = 'id_item';
    public $timestamps = false;
    protected $fillable = [
        'id_carrito', 'id_curso', 'precio', 'fecha_agregado'
    ];

    public function carrito()
    {
        return $this->belongsTo(CarritoCompra::class, 'id_carrito');
    }

    public function curso()
    {
        return $this->belongsTo(Curso::class, 'id_curso');
    }
}
