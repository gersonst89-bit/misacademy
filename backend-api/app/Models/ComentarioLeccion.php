<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ComentarioLeccion extends Model
{
    protected $table = 'comentarios_leccion';
    protected $primaryKey = 'id_comentario';
    public $timestamps = false;
    protected $fillable = [
        'id_usuario', 'id_leccion', 'comentario', 'fecha_comentario', 'comentario_padre_id'
    ];

    public function usuario()
    {
        return $this->belongsTo(Usuario::class, 'id_usuario');
    }

    public function leccion()
    {
        return $this->belongsTo(Leccion::class, 'id_leccion');
    }

    public function respuestas()
    {
        return $this->hasMany(ComentarioLeccion::class, 'comentario_padre_id');
    }

    public function padre()
    {
        return $this->belongsTo(ComentarioLeccion::class, 'comentario_padre_id');
    }
}
