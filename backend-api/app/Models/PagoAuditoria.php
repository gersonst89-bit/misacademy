<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class PagoAuditoria extends Model
{
    protected $table = 'pagos_auditoria';
    protected $primaryKey = 'id_auditoria';
    public $timestamps = false;
    protected $fillable = [
        'id_pago', 'estado_anterior', 'estado_nuevo', 'cambiado_por', 'fecha_cambio'
    ];
}
