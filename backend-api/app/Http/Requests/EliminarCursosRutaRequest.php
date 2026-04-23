<?php

namespace App\Http\Requests;

class EliminarCursosRutaRequest extends BaseApiRequest
{
    public function rules()
    {
        return [
            'cursos' => ['required', 'array', 'min:1'],
            'cursos.*' => ['required', 'integer', 'exists:cursos,id_curso'],
        ];
    }

    public function messages()
    {
        return [
            'cursos.required' => 'Debes enviar al menos un curso.',
            'cursos.array' => 'El campo cursos debe ser un array.',
            'cursos.*.required' => 'El id_curso es obligatorio.',
            'cursos.*.exists' => 'El curso no existe.',
        ];
    }
}
