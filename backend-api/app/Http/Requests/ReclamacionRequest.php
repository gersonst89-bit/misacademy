<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Contracts\Validation\Validator;
use Illuminate\Http\Exceptions\HttpResponseException;

class ReclamacionRequest extends BaseApiRequest
{
    public function rules()
    {
        return [
            'nombre_completo' => 'required|string|max:255',
            'dni' => 'required|string|max:20',
            'email' => 'required|email|max:255',
            'tipo_reclamo' => 'required|string|max:100',
            'asunto' => 'required|string|max:255',
            'descripcion' => 'required|string|min:10',
        ];
    }

    public function messages()
    {
        return [
            'nombre_completo.required' => 'El nombre completo es obligatorio.',
            'dni.required' => 'El DNI es obligatorio.',
            'email.required' => 'El correo electrónico es obligatorio.',
            'email.email' => 'El correo electrónico debe ser válido.',
            'tipo_reclamo.required' => 'El tipo de reclamo es obligatorio.',
            'asunto.required' => 'El asunto es obligatorio.',
            'descripcion.required' => 'La descripción es obligatoria.',
            'descripcion.min' => 'La descripción debe tener al menos 10 caracteres.',
        ];
    }
}
