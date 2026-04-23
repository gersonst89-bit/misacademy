<?php

namespace App\Http\Requests\Admin;

use App\Http\Requests\BaseApiRequest;

class UpdateUsuarioRequest extends BaseApiRequest
{
    public function authorize()
    {
        return true;
    }

    public function rules()
    {
        $id = $this->route('id');
        return [
            'nombre' => 'sometimes|required|string|max:100',
            'apellido' => 'sometimes|required|string|max:100',
            'email' => 'sometimes|required|email|max:100|unique:usuarios,email,' . $id . ',id_usuario',
            'dni' => 'nullable|string|max:20|unique:usuarios,dni,' . $id . ',id_usuario',
            'password' => 'nullable|string|min:8',
            'id_rol' => 'sometimes|required|exists:rol,id_rol',
            'telefono' => 'nullable|string|max:20',
            'imagen_perfil' => 'nullable|image|mimes:jpeg,jpg,png|max:5120',
            'biografia' => 'nullable|string',
            'estado' => 'in:Activo,Inactivo,Suspendido',
        ];
    }
}
