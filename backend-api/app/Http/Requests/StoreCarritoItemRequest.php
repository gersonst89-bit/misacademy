<?php

namespace App\Http\Requests;

class StoreCarritoItemRequest extends BaseApiRequest
{
    public function rules()
    {
        return [
            'id_curso' => 'required|exists:cursos,id_curso',
        ];
    }
}
