<?php

namespace App\Http\Requests;

use App\Http\Requests\BaseApiRequest;

class StoreInscripcionRequest extends BaseApiRequest
{
    public function authorize()
    {
        return true;
    }

    public function rules()
    {
        $tipo = $this->input('tipo');
        $idRule = 'required|integer';
        if ($tipo === 'ruta') {
            $idRule .= '|exists:rutas_academicas,id_ruta';
        } else {
            // default to curso
            $idRule .= '|exists:cursos,id_curso';
        }

        return [
            'tipo' => 'required|in:curso,ruta',
            'id_objeto' => $idRule,
            'metadata' => 'nullable|array',
        ];
    }
}
