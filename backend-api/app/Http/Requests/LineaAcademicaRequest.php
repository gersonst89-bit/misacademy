<?php

namespace App\Http\Requests;

use App\Http\Requests\BaseApiRequest;

class LineaAcademicaRequest extends BaseApiRequest
{
    public function authorize()
    {
        return true;
    }

    public function rules()
    {
        return [
            'nombre' => [
                'required',
                'string',
                'max:100',
                \Illuminate\Validation\Rule::unique('lineas_academicas', 'nombre')->ignore($this->route('id'), 'id_linea'),
            ],
            'descripcion' => 'nullable|string',
            'imagen' => 'nullable|string|max:255',
            'estado' => 'required|in:Publicado,Archivado',
        ];
    }
    /**
     * Forzar respuesta JSON en errores de validación para APIs.
     */
    protected function failedValidation(\Illuminate\Contracts\Validation\Validator $validator)
    {
        $response = response()->json([
            'message' => 'Los datos proporcionados no son válidos.',
            'errors' => $validator->errors(),
        ], 422);
        throw new \Illuminate\Validation\ValidationException($validator, $response);
    }
}
