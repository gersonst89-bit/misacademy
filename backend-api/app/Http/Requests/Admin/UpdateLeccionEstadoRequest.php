<?php

namespace App\Http\Requests\Admin;

use App\Http\Requests\BaseApiRequest;

class UpdateLeccionEstadoRequest extends BaseApiRequest
{
    public function authorize()
    {
        // Solo admins, pero el middleware EnsureAdmin ya lo controla
        return true;
    }

    public function rules()
    {
        return [
            'estado' => 'required|string|in:Archivado,Publicado',
        ];
    }
}
