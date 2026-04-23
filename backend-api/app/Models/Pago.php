<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use OwenIt\Auditing\Contracts\Auditable;

class Pago extends Model implements Auditable
{
    use \OwenIt\Auditing\Auditable;
    protected $table = 'pagos';
    protected $primaryKey = 'id_pago';
    public $timestamps = false;
    protected $fillable = [
        'id_usuario', 'id_tipo_pago', 'monto', 'fecha_pago', 'estado', 'detalles_transaccion', 'imagen_comprobante'
    ];

    protected $auditExclude = [];
    public function usuario()
    {
        return $this->belongsTo(Usuario::class, 'id_usuario', 'id_usuario');
    }

    public function tipoPago()
    {
        return $this->belongsTo(TipoPago::class, 'id_tipo_pago', 'id_tipo_pago');
    }

    public function detalles()
    {
        return $this->hasMany(DetallePago::class, 'id_pago');
    }
}
