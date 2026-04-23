<?php

namespace App\Http\Requests\Admin;

use App\Http\Requests\BaseApiRequest;

class UpdateLeccionRequest extends BaseApiRequest
{
    public function authorize()
    {
        return true;
    }

    public function rules()
    {
        return [
            'id_modulo' => 'sometimes|required|exists:modulos,id_modulo',
            'titulo' => 'sometimes|required|string|max:100',
            'descripcion' => 'nullable|string',
            'url_video' => 'nullable|string|max:255',
            'duracion' => 'nullable|integer|min:0',
            'orden' => 'sometimes|required|integer|min:1',
            'estado' => 'sometimes|required|in:Archivado,Publicado',
        ];
    }
}