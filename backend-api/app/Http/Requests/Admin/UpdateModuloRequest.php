<?php

namespace App\Http\Requests\Admin;

use App\Http\Requests\BaseApiRequest;

class UpdateModuloRequest extends BaseApiRequest
{
    public function rules()
    {
        return [
            'id_curso' => 'sometimes|required|exists:cursos,id_curso',
            'titulo' => 'sometimes|required|string|max:100',
            'descripcion' => 'nullable|string',
            'orden' => 'sometimes|required|integer|min:1',
                'estado' => 'sometimes|required|in:Publicado,Archivado',
            'fecha_creacion' => 'nullable|date',
            'fecha_actualizacion' => 'nullable|date',
        ];
    }
}