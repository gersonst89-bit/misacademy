<?php

namespace App\Http\Requests;

use App\Http\Requests\BaseApiRequest;

class RutaAcademicaRequest extends BaseApiRequest
{
    public function authorize()
    {
        return true;
    }

    public function rules()
    {
        return [
            'nombre' => 'required|string|max:100',
            'descripcion' => 'nullable|string',
            'id_linea_academica' => 'required|integer|exists:lineas_academicas,id_linea',
            'imagen' => 'nullable|string|max:255',
            'horas_totales' => 'required|integer|min:1',
            'nivel' => 'required|in:Principiante,Intermedio,Avanzado',
            'precio' => 'required|numeric|min:0',
            'estado' => 'required|in:Activa,Inactiva,Borrador',
            'destacado' => 'boolean',
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
