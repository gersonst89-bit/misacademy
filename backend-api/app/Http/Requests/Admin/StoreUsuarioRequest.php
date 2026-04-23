<?php

namespace App\Http\Requests\Admin;

use App\Http\Requests\BaseApiRequest;

class StoreUsuarioRequest extends BaseApiRequest
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
            'email' => 'required|email|max:100|unique:usuarios,email',
            'dni' => 'nullable|string|max:20|unique:usuarios,dni',
            'password' => 'required|string|min:8',
            'id_rol' => 'required|exists:rol,id_rol',
            'telefono' => 'nullable|string|max:20',
            'imagen_perfil' => 'nullable|image|mimes:jpeg,jpg,png|max:5120',
            'biografia' => 'nullable|string',
            'estado' => 'in:Activo,Inactivo,Suspendido',
            'email_verificado' => 'sometimes|boolean',
        ];
    }
}
