<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Reclamacion extends Model
{
    protected $table = 'reclamaciones';

    protected $fillable = [
        'nombre_completo',
        'dni',
        'email',
        'tipo_reclamo',
        'asunto',
        'descripcion',
    ];
}
