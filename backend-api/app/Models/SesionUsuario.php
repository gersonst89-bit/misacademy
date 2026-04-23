<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class SesionUsuario extends Model
{
    protected $table = 'sesiones_usuario';
    protected $primaryKey = 'id_sesion';
    public $incrementing = false;
    public $timestamps = false;
    protected $fillable = [
        'id_sesion', 'id_usuario', 'ip_address', 'user_agent', 'payload', 'ultimo_acceso'
    ];

    public function usuario()
    {
        return $this->belongsTo(Usuario::class, 'id_usuario');
    }
}
