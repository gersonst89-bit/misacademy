<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class BuscarCursoRequest extends FormRequest
{
    public function authorize()
    {
        return true;
    }

    public function rules()
    {
        return [
            'q' => 'nullable|string|max:255',
            'per_page' => 'nullable|integer|min:1|max:100',
        ];
    }
}