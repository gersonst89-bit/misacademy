<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Curso;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Auth;
use Illuminate\Validation\ValidationException;
use Exception;

class CursoController extends Controller
{
    // Crear nuevo curso
    public function store(Request $request)
    {
        try {
            $validated = $request->validate([
                'nombre' => 'required|string|max:100',
                'descripcion' => 'nullable|string',
                'descripcion_corta' => 'nullable|string|max:255',
                'descripcion_larga' => 'nullable|string',
                'imagen' => 'nullable|string|max:255',
                'video_previsualizacion' => 'nullable|string|max:255',
                'lo_que_aprenderas' => 'nullable|string',
                'requisitos' => 'nullable|string',
                'duracion' => 'required|integer|min:1',
                'tiempo' => 'nullable|integer|min:1',
                'precio' => 'required|numeric|min:0',
                'nivel' => 'required|in:Principiante,Intermedio,Avanzado',
                'estado' => 'required|in:Publicado,Archivado',
                'destacado' => 'boolean',
                'id_docente' => 'nullable|exists:usuarios,id_usuario',
                'rutas' => 'array',
                'rutas.*' => 'exists:rutas_academicas,id_ruta',
            ]);
            $validated['fecha_creacion'] = now();
            $rutas = $validated['rutas'] ?? [];
            unset($validated['rutas']);
            $curso = Curso::create($validated);
            if (!empty($rutas)) {
                $attachData = [];
                foreach ($rutas as $id_ruta) {
                    $attachData[$id_ruta] = ['orden' => 0];
                }
                $curso->rutas()->attach($attachData);
            }
            return response()->json([
                'mensaje' => 'Curso creado',
                'curso' => new \App\Http\Resources\CursoResource($curso),
                'status' => 'success'
            ], 201);
        } catch (ValidationException $e) {
            return response()->json([
                'mensaje' => 'Error de validación',
                'errores' => $e->errors(),
                'status' => 'error'
            ], 422);
        } catch (Exception $e) {
            Log::error('Error al crear curso: ' . $e->getMessage());
            return response()->json([
                'mensaje' => 'Error interno al crear el curso',
                'status' => 'error'
            ], 500);
        }
    }

    // Editar curso
    public function update(Request $request, $id)
    {
        try {
            $curso = Curso::find($id);
            if (!$curso) {
                return response()->json([
                    'mensaje' => 'Curso no encontrado',
                    'status' => 'error'
                ], 404);
            }
            $validated = $request->validate([
                'nombre' => 'sometimes|required|string|max:100',
                'descripcion' => 'nullable|string',
                'descripcion_corta' => 'nullable|string|max:255',
                'descripcion_larga' => 'nullable|string',
                'imagen' => 'nullable|string|max:255',
                'video_previsualizacion' => 'nullable|string|max:255',
                'lo_que_aprenderas' => 'nullable|string',
                'requisitos' => 'nullable|string',
                'duracion' => 'sometimes|required|integer|min:1',
                'tiempo' => 'nullable|integer|min:1',
                'precio' => 'sometimes|required|numeric|min:0',
                'nivel' => 'sometimes|required|in:Principiante,Intermedio,Avanzado',
                'estado' => 'sometimes|required|in:Publicado,Archivado',
                'destacado' => 'boolean',
                'id_docente' => 'nullable|exists:usuarios,id_usuario',
                'rutas' => 'array',
                'rutas.*' => 'exists:rutas_academicas,id_ruta',
            ]);
            $validated['fecha_actualizacion'] = now();
            $rutas = $validated['rutas'] ?? null;
            unset($validated['rutas']);
            $curso->update($validated);
            if (is_array($rutas)) {
                $attachData = [];
                foreach ($rutas as $id_ruta) {
                    $attachData[$id_ruta] = ['orden' => 0];
                }
                $curso->rutas()->sync($attachData);
            }
            return response()->json([
                'mensaje' => 'Curso actualizado',
                'curso' => new \App\Http\Resources\CursoResource($curso),
                'status' => 'success'
            ]);
        } catch (ValidationException $e) {
            return response()->json([
                'mensaje' => 'Error de validación',
                'errores' => $e->errors(),
                'status' => 'error'
            ], 422);
        } catch (Exception $e) {
            Log::error('Error al actualizar curso: ' . $e->getMessage());
            return response()->json([
                'mensaje' => 'Error interno al actualizar el curso',
                'status' => 'error'
            ], 500);
        }
    }

    // Cambiar estado del curso (Publicado/Archivado)
    public function cambiarEstado(Request $request, $id)
    {
        try {
            $curso = Curso::find($id);
            if (!$curso) {
                return response()->json([
                    'mensaje' => 'Curso no encontrado',
                    'status' => 'error'
                ], 404);
            }
            $validated = $request->validate([
                'estado' => 'required|in:Publicado,Archivado',
            ]);
            $curso->estado = $validated['estado'];
            $curso->fecha_actualizacion = now();
            $curso->save();
            return response()->json([
                'mensaje' => 'Estado del curso actualizado',
                'curso' => $curso,
                'status' => 'success'
            ]);
        } catch (ValidationException $e) {
            return response()->json([
                'mensaje' => 'Error de validación',
                'errores' => $e->errors(),
                'status' => 'error'
            ], 422);
        } catch (Exception $e) {
            Log::error('Error al cambiar estado del curso: ' . $e->getMessage());
            return response()->json([
                'mensaje' => 'Error interno al cambiar el estado del curso',
                'status' => 'error'
            ], 500);
        }
    }
    
}
