<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Material extends Model
{
    protected $table = 'materiales';
    protected $primaryKey = 'id_material';
    public $timestamps = false;
    protected $fillable = [
    'id_modulo', 'nombre', 'descripcion', 'url_archivo', 'tamanio', 'fecha_creacion', 'estado'
    ];

    public function modulo()
    {
        return $this->belongsTo(Modulo::class, 'id_modulo');
    }
}
