<?php

namespace App\Http\Requests\Admin;

use App\Http\Requests\BaseApiRequest;

class StoreModuloRequest extends BaseApiRequest
{
    public function rules()
    {
        return [
            'id_curso' => 'required|exists:cursos,id_curso',
            'titulo' => 'required|string|max:100',
            'descripcion' => 'nullable|string',
            'orden' => 'required|integer|min:1',
                'estado' => 'required|in:Publicado,Archivado',
            'fecha_creacion' => 'nullable|date',
            'fecha_actualizacion' => 'nullable|date',
        ];
    }
}