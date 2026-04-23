<?php

namespace App\Http\Requests;

use Illuminate\Validation\Rule;
use Illuminate\Contracts\Validation\Validator;
use Illuminate\Http\Exceptions\HttpResponseException;

class AsociarCursosRutaRequest extends BaseApiRequest
{
    public function rules()
    {
        return [
            'cursos' => ['required', 'array', 'min:1'],
            'cursos.*.id_curso' => ['required', 'integer', 'exists:cursos,id_curso'],
            'cursos.*.orden' => ['nullable', 'integer', 'min:1'],
        ];
    }

    public function messages()
    {
        return [
            'cursos.required' => 'Debes enviar al menos un curso.',
            'cursos.array' => 'El campo cursos debe ser un array.',
            'cursos.*.id_curso.required' => 'El id_curso es obligatorio.',
            'cursos.*.id_curso.exists' => 'El curso no existe.',
        ];
    }
}
