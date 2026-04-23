<?php

namespace App\Http\Requests;

class OpcionRespuestaRequest extends BaseApiRequest
{
    public function authorize()
    {
        return true;
    }

    public function rules()
    {
        return [
            'id_pregunta' => 'required|exists:preguntas,id_pregunta',
            'texto_opcion' => 'required|string',
            'es_correcta' => 'required|boolean',
        ];
    }
}
