<?php

namespace App\Http\Requests;

class EvaluacionRequest extends BaseApiRequest
{
    public function authorize()
    {
        return true;
    }

    public function rules()
    {
        return [
            'id_curso' => 'required|exists:cursos,id_curso',
            'titulo' => 'required|string|max:100',
            'descripcion' => 'nullable|string',
            'puntuacion_requerida' => 'required|numeric|min:0|max:100',
            'duracion' => 'nullable|integer|min:1',
            'intentos_maximos' => 'required|integer|min:1',
            'estado' => 'required|in:Publicado,Archivado',
            'tipo' => 'required|in:final,test',
        ];
    }
}
