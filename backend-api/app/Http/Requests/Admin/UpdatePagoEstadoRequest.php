<?php

namespace App\Http\Requests\Admin;

use App\Http\Requests\BaseApiRequest;

class UpdatePagoEstadoRequest extends BaseApiRequest
{
    public function authorize()
    {
        return true;
    }

    public function rules()
    {
        return [
            'estado' => 'required|in:Pendiente,Completado,Fallido,Reembolsado',
        ];
    }
}
