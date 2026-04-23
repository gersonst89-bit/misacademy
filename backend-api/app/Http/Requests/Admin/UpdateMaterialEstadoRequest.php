<?php

namespace App\Http\Requests\Admin;

use App\Http\Requests\BaseApiRequest;

class UpdateMaterialEstadoRequest extends BaseApiRequest
{
    public function rules()
    {
        return [
            'estado' => 'required|in:Publicado,Archivado',
        ];
    }
}
