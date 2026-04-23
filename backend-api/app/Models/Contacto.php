<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Contacto extends Model
{
    protected $table = 'contacto';
    protected $primaryKey = 'id_contacto';
    public $timestamps = false;
    protected $fillable = [
        'nombre', 'apellido', 'email', 'telefono', 'asunto', 'mensaje', 'fecha_envio', 'estado', 'fecha_respuesta', 'respuesta'
    ];
}
