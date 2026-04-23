<?php

namespace App\Http\Requests\Auth;

use Illuminate\Foundation\Http\FormRequest;

class RegisterRequest extends FormRequest
{
    public function authorize()
    {
        return true;
    }

    public function rules()
    {
        return [
            'id_rol' => 'sometimes|integer|exists:rol,id_rol',
            'nombre' => 'required|string|max:100',
            'apellido' => 'required|string|max:100',
            'dni' => 'nullable|string|max:20',
            'email' => 'required|email|max:100|unique:usuarios,email',
            'password' => 'required|string|min:8|confirmed',
            'telefono' => 'nullable|string|max:20',
            'imagen_perfil' => 'nullable|string|max:255',
            'biografia' => 'nullable|string',
            'estado' => 'sometimes|in:Activo,Inactivo,Suspendido',
            'fecha_registro' => 'sometimes|date',
            'ultimo_acceso' => 'sometimes|date',
        ];
    }

    public function messages()
    {
        return [
            'nombre.required' => 'El nombre es obligatorio.',
            'apellido.required' => 'El apellido es obligatorio.',
            'email.required' => 'El correo electrónico es obligatorio.',
            'email.email' => 'El correo electrónico no es válido.',
            'email.unique' => 'El correo electrónico ya está registrado.',
            'password.required' => 'La contraseña es obligatoria.',
            'password.min' => 'La contraseña debe tener al menos 8 caracteres.',
            'password.confirmed' => 'Las contraseñas no coinciden.',
            'estado.in' => 'El estado debe ser Activo, Inactivo o Suspendido.',
        ];
    }
}
