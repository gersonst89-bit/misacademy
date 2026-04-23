<?php

namespace App\Http\Requests\Admin;

use App\Http\Requests\BaseApiRequest;

class UpdateEstadoRequest extends BaseApiRequest
{
    public function authorize()
    {
        return true;
    }

    public function rules()
    {
        return [
            'estado' => 'required|in:Publicado,Archivado',
        ];
    }
}
