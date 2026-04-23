<?php

namespace App\Http\Requests;

use App\Http\Requests\BaseApiRequest;

class StoreInscripcionRutaRequest extends BaseApiRequest
{
    public function authorize()
    {
        return true;
    }

    public function rules()
    {
        return [
            'id_ruta' => 'required|integer|exists:rutas,id_ruta',
            'metadata' => 'nullable|array',
        ];
    }
}
