<?php

namespace App\Http\Requests;

class PreguntaRequest extends BaseApiRequest
{
    public function authorize()
    {
        return true;
    }

    public function rules()
    {
        return [
            'id_evaluacion' => 'required|exists:evaluaciones,id_evaluacion',
            'texto_pregunta' => 'required|string',
            'tipo' => 'required|in:Opcion multiple,Verdadero/Falso,Texto libre',
            'puntos' => 'required|numeric|min:0.1',
            'orden' => 'required|integer|min:1',
        ];
    }
}
