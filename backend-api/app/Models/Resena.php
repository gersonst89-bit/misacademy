<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Resena extends Model
{
    protected $table = 'resenas';
    protected $primaryKey = 'id_resena';
    public $timestamps = false;
    protected $fillable = [
        'id_usuario', 'id_curso', 'calificacion', 'comentario', 'fecha_resena'
    ];

    public function curso()
    {
        return $this->belongsTo(Curso::class, 'id_curso');
    }

    public function usuario()
    {
        return $this->belongsTo(Usuario::class, 'id_usuario');
    }
}
