<?php

namespace App\Http\Requests;

use App\Http\Requests\BaseApiRequest;

use Illuminate\Contracts\Validation\Validator;
use Illuminate\Http\Exceptions\HttpResponseException;

class ContactoRequest extends BaseApiRequest
{
    public function authorize()
    {
        return true;
    }

    public function rules()
    {
        return [
            'nombre' => 'required|string|max:100',
            'apellido' => 'required|string|max:100',
            'email' => 'required|email|max:100',
            'asunto' => 'required|string|max:255',
            'mensaje' => 'required|string',
            'telefono' => 'nullable|string|max:20',
        ];
    }

    public function messages()
    {
        return [
            'nombre.required' => 'El nombre es obligatorio.',
            'apellido.required' => 'El apellido es obligatorio.',
            'email.required' => 'El correo electrónico es obligatorio.',
            'email.email' => 'El correo electrónico debe tener un formato válido.',
            'asunto.required' => 'El asunto es obligatorio.',
            'mensaje.required' => 'El mensaje es obligatorio.'
        ];
    }

    /**
     * Forzar respuesta JSON en errores de validación
     */
    protected function failedValidation(Validator $validator)
    {
        throw new HttpResponseException(
            response()->json([
                'message' => 'Datos inválidos.',
                'errors' => $validator->errors(),
            ], 422)
        );
    }
}
