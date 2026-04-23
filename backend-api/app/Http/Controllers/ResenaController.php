<?php

namespace App\Http\Controllers;

use App\Models\Resena;
use App\Models\Inscripcion;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class ResenaController extends Controller
{
    // Listar reseñas de un curso
    public function index($id)
    {
        $resenas = Resena::where('id_curso', $id)
            ->with('usuario:id_usuario,nombre,apellido,imagen_perfil')
            ->orderByDesc('fecha_resena')
            ->get();
        return response()->json(['resenas' => $resenas]);
    }

    // Crear reseña (solo si el usuario terminó el curso)
    public function store(Request $request, $id)
    {
        $userId = Auth::id();
        // Validar que el usuario haya completado el curso
        $inscripcion = Inscripcion::where('id_usuario', $userId)
            ->where('id_curso', $id)
            ->where('estado', 'Completado')
            ->first();
        if (!$inscripcion) {
            return response()->json([
                'mensaje' => 'Solo puedes dejar una reseña si completaste el curso.',
                'status' => 'error'
            ], 403);
        }
        $request->validate([
            'calificacion' => 'required|integer|min:1|max:5',
            'comentario' => 'nullable|string|max:1000',
        ]);
        // Evitar duplicados: solo una reseña por usuario/curso
        $yaExiste = Resena::where('id_usuario', $userId)->where('id_curso', $id)->exists();
        if ($yaExiste) {
            return response()->json([
                'mensaje' => 'Ya has dejado una reseña para este curso.',
                'status' => 'error'
            ], 409);
        }
        $resena = Resena::create([
            'id_usuario' => $userId,
            'id_curso' => $id,
            'calificacion' => $request->calificacion,
            'comentario' => $request->comentario,
            'fecha_resena' => now(),
        ]);
        return response()->json([
            'mensaje' => 'Reseña guardada',
            'resena' => $resena,
            'status' => 'success'
        ], 201);
    }

    // Editar reseña (solo el autor)
    public function update(Request $request, $id)
    {
        $userId = Auth::id();
        $resena = Resena::find($id);
        if (!$resena) {
            return response()->json([
                'mensaje' => 'Reseña no encontrada.',
                'status' => 'error'
            ], 404);
        }
        if ($resena->id_usuario !== $userId) {
            return response()->json([
                'mensaje' => 'No tienes permiso para editar esta reseña.',
                'status' => 'error'
            ], 403);
        }
        $request->validate([
            'calificacion' => 'required|integer|min:1|max:5',
            'comentario' => 'nullable|string|max:1000',
        ]);
        $resena->calificacion = $request->calificacion;
        $resena->comentario = $request->comentario;
        $resena->save();
        return response()->json([
            'mensaje' => 'Reseña actualizada',
            'resena' => $resena,
            'status' => 'success'
        ], 200);
    }

    // Eliminar reseña (solo el autor)
    public function destroy($id)
    {
        $userId = Auth::id();
        $resena = Resena::find($id);
        if (!$resena) {
            return response()->json([
                'mensaje' => 'Reseña no encontrada.',
                'status' => 'error'
            ], 404);
        }
        if ($resena->id_usuario !== $userId) {
            return response()->json([
                'mensaje' => 'No tienes permiso para eliminar esta reseña.',
                'status' => 'error'
            ], 403);
        }
        $resena->delete();
        return response()->json([
            'mensaje' => 'Reseña eliminada',
            'status' => 'success'
        ], 200);
    }

    // Listar todas las reseñas del usuario autenticado
    public function misResenas()
    {
        $userId = Auth::id();
        $resenas = Resena::where('id_usuario', $userId)
            ->with([
                'curso:id_curso,nombre,descripcion,imagen', // Incluye imagen del curso
                'usuario:id_usuario,nombre,apellido,imagen_perfil'
            ])
            ->orderByDesc('fecha_resena')
            ->get();
        return response()->json(['resenas' => $resenas]);
    }
}
