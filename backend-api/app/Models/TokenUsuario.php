<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class TokenUsuario extends Model
{
    protected $table = 'tokens_usuario';
    protected $primaryKey = 'id_token';
    public $timestamps = false;
    protected $fillable = [
        'id_usuario', 'token', 'tipo', 'fecha_creacion', 'fecha_expiracion', 'usado'
    ];

    public function usuario()
    {
        return $this->belongsTo(Usuario::class, 'id_usuario');
    }
}
