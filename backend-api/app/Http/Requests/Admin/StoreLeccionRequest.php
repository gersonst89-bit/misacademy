<?php

namespace App\Http\Requests\Admin;

use App\Http\Requests\BaseApiRequest;

class StoreLeccionRequest extends BaseApiRequest
{
    public function authorize()
    {
        return true;
    }

    public function rules()
    {
        return [
            'id_modulo' => 'required|exists:modulos,id_modulo',
            'titulo' => 'required|string|max:100',
            'descripcion' => 'nullable|string',
            'url_video' => 'nullable|string|max:255',
            'duracion' => 'nullable|integer|min:0',
            'orden' => [
                'required',
                'integer',
                'min:1',
                function ($attribute, $value, $fail) {
                    $id_modulo = $this->input('id_modulo');
                    if ($id_modulo && \App\Models\Leccion::where('id_modulo', $id_modulo)->where('orden', $value)->exists()) {
                        $fail('Ya existe una lección con ese orden en el módulo seleccionado.');
                    }
                }
            ],
            'estado' => 'required|in:Archivado,Publicado',
        ];
    }
}
