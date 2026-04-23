<?php

namespace App\Http\Requests;

use App\Http\Requests\BaseApiRequest;

class UpdatePerfilRequest extends BaseApiRequest
{
    public function authorize(): bool
    {
        return $this->user() != null;
    }

    public function rules(): array
    {
        return [
            'nombre' => 'sometimes|required|string|max:100',
            'apellido' => 'sometimes|required|string|max:100',
            'telefono' => 'nullable|string|max:20',
            'biografia' => 'nullable|string',
            'password' => 'nullable|string|min:8',
            'imagen_perfil' => 'nullable|image|mimes:jpeg,jpg,png|max:5120',
        ];
    }

    public function messages(): array
    {
        return [
            'nombre.required' => 'El nombre es obligatorio.',
            'apellido.required' => 'El apellido es obligatorio.',
            'password.min' => 'La contraseña debe tener al menos 8 caracteres.',
            'imagen_perfil.image' => 'El archivo debe ser una imagen.',
            'imagen_perfil.mimes' => 'La imagen debe ser de tipo: jpeg, jpg, png.',
            'imagen_perfil.max' => 'La imagen no puede superar 5MB.',
        ];
    }
}
