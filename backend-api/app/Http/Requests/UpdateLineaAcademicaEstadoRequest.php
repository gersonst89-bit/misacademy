<?php

namespace App\Http\Requests;

use App\Http\Requests\BaseApiRequest;

class UpdateLineaAcademicaEstadoRequest extends BaseApiRequest
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
