<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use OwenIt\Auditing\Contracts\Auditable;

class Certificacion extends Model implements Auditable
{
    use \OwenIt\Auditing\Auditable;
    protected $table = 'certificaciones';
    protected $primaryKey = 'id_certificacion';
    public $timestamps = false;
    protected $fillable = [
        'id_usuario',
        'id_curso',
        'fecha_emision',
        'codigo_certificado',
        'calificacion_final',
        'url_certificado',
        'tipo_certificado',
        'nombre_curso',
        'nombre_estudiante',
        'fecha_inicio',
        'fecha_fin',
        'total_horas',
        'email_destinatario',
    ];

    protected $auditExclude = [];
    public function usuario()
    {
        return $this->belongsTo(Usuario::class, 'id_usuario');
    }

    public function curso()
    {
        return $this->belongsTo(Curso::class, 'id_curso');
    }
}
