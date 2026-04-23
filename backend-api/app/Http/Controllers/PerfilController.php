<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Http\Requests\UpdatePerfilRequest;
use App\Models\Usuario;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Log;

class PerfilController extends Controller
{

    public function update(Request $request)
    {
        $userId = Auth::id();
        $usuario = Usuario::findOrFail($userId);
        
        // Validar manualmente
        $data = $request->validate([
            'nombre' => 'sometimes|required|string|max:100',
            'apellido' => 'sometimes|required|string|max:100',
            'telefono' => 'nullable|string|max:20',
            'biografia' => 'nullable|string',
            'imagen_perfil' => 'nullable|image|mimes:jpeg,jpg,png|max:5120',
        ]);

        if ($request->hasFile('imagen_perfil')) {
            if ($usuario->imagen_perfil && file_exists(public_path($usuario->imagen_perfil))) {
                unlink(public_path($usuario->imagen_perfil));
            }
            $file = $request->file('imagen_perfil');
            $fileName = time() . '_' . $file->getClientOriginalName();
            $file->move(public_path('fotos_perfil'), $fileName);
            $data['imagen_perfil'] = 'fotos_perfil/' . $fileName;
        }

        // No actualizar contraseña en este método

        $usuario->update($data);
        unset($usuario->password);
        
        // Convertir ruta relativa a URL completa
        if ($usuario->imagen_perfil) {
            $usuario->imagen_perfil = url($usuario->imagen_perfil);
        }

        return response()->json([
            'message' => 'Perfil actualizado correctamente',
            'usuario' => $usuario
        ]);
    }
}
