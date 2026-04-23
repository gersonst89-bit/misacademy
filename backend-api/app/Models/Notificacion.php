<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Notificacion extends Model
{
    protected $table = 'notificaciones';
    protected $primaryKey = 'id_notificacion';
    public $timestamps = false;
    protected $fillable = [
        'id_usuario', 'titulo', 'mensaje', 'tipo', 'leida', 'fecha_creacion', 'fecha_leida'
    ];

    public function usuario()
    {
        return $this->belongsTo(Usuario::class, 'id_usuario');
    }
}
