<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Laravel\Sanctum\HasApiTokens;
use OwenIt\Auditing\Contracts\Auditable;
use Illuminate\Database\Eloquent\SoftDeletes;

class Usuario extends Authenticatable implements Auditable
{
    use HasFactory, HasApiTokens, \OwenIt\Auditing\Auditable, SoftDeletes;

    protected $table = 'usuarios';
    protected $primaryKey = 'id_usuario';
    public $timestamps = false;

    protected $fillable = [
        'id_rol',
        'nombre',
        'apellido',
        'dni',
        'email',
        'password',
        'telefono',
        'imagen_perfil',
        'biografia',
        'email_verificado',
        'estado',
        'fecha_registro',
        'ultimo_acceso',
    ];

    public function rol()
    {
        return $this->belongsTo(Rol::class, 'id_rol');
    }

    public function inscripciones()
    {
        return $this->hasMany(Inscripcion::class, 'id_usuario');
    }

    public function certificaciones()
    {
        return $this->hasMany(Certificacion::class, 'id_usuario');
    }

    public function pagos()
    {
        return $this->hasMany(Pago::class, 'id_usuario');
    }

    protected $hidden = [
        'password',
    ];

    protected $casts = [
        'email_verificado' => 'boolean',
        'fecha_registro' => 'datetime',
        'ultimo_acceso' => 'datetime',
    ];
    protected $auditExclude = [
        'password',
        'remember_token'
    ];
    protected $with = ['rol'];

    // Relaciones y métodos adicionales según necesidades
}
