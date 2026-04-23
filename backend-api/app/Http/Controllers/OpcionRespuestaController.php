<?php

namespace App\Http\Controllers;

use App\Http\Requests\BaseApiRequest;
use App\Models\OpcionRespuesta;
use App\Models\Pregunta;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Exception;

class OpcionRespuestaController extends Controller
{
    // Listar opciones (Admin/Docente)
    public function index(Request $request)
    {
        $user = $request->user();
        
        if (!$user || !$user->rol) {
            return response()->json(['message' => 'Usuario no autorizado'], 403);
        }
        
        $rol = strtolower($user->rol->nombre_rol);
        
        // Admin: ve todas las opciones
        if ($rol === 'administrador') {
            try {
                $query = OpcionRespuesta::query();
                
                // Filtros opcionales para admin
                if ($request->filled('id_pregunta')) {
                    $query->where('id_pregunta', $request->id_pregunta);
                }
                
                $opciones = $query->get();
                
                return response()->json([
                    'opciones' => $opciones,
                    'total' => $opciones->count(),
                    'status' => 'success',
                    'debug' => 'Admin query executed successfully'
                ]);
                
            } catch (Exception $e) {
                return response()->json([
                    'message' => 'Error en admin opciones',
                    'error' => $e->getMessage(),
                    'file' => $e->getFile(),
                    'line' => $e->getLine()
                ], 500);
            }
            
        } elseif ($rol === 'docente') {
            try {
                // Docente: solo opciones de preguntas de evaluaciones de sus cursos
                $query = OpcionRespuesta::whereHas('pregunta.evaluacion.curso', function ($q) use ($user) {
                    $q->where('id_docente', $user->id_usuario);
                });
                
                // Filtros opcionales para docente
                if ($request->filled('id_pregunta')) {
                    // Verificar que la pregunta pertenezca al docente
                    $pregunta = Pregunta::whereHas('evaluacion.curso', function ($q) use ($user) {
                        $q->where('id_docente', $user->id_usuario);
                    })->find($request->id_pregunta);
                    
                    if (!$pregunta) {
                        return response()->json(['message' => 'Pregunta no encontrada o sin permisos'], 404);
                    }
                    
                    $query->where('id_pregunta', $request->id_pregunta);
                }
                
                $opciones = $query->get();
                
                return response()->json([
                    'opciones' => $opciones,
                    'total' => $opciones->count(),
                    'status' => 'success'
                ]);
                
            } catch (Exception $e) {
                Log::error('Error en opciones docente: ' . $e->getMessage());
                return response()->json([
                    'message' => 'Error al obtener opciones',
                    'error' => $e->getMessage()
                ], 500);
            }
        }
        
        return response()->json(['message' => 'Rol no autorizado'], 403);
    }

    // Ver opción específica (Admin/Docente)
    public function show(Request $request, $id)
    {
        $opcion = OpcionRespuesta::with(['pregunta.evaluacion.curso'])->findOrFail($id);
        $this->authorize('view', $opcion);
        
        return response()->json([
            'opcion' => $opcion,
            'status' => 'success'
        ]);
    }

    // Crear opción (Admin/Docente)
    public function store(Request $request)
    {
        try {
            $data = $request->validate([
                'id_pregunta' => 'required|exists:preguntas,id_pregunta',
                'texto_opcion' => 'required|string|max:500',
                'es_correcta' => 'required|boolean'
            ]);

            $pregunta = Pregunta::with('evaluacion.curso')->findOrFail($data['id_pregunta']);
            $user = $request->user();
            
            // Verificación específica para docentes: solo pueden crear opciones en preguntas de sus cursos
            if ($user->rol && strtolower($user->rol->nombre_rol) === 'docente') {
                $curso = $pregunta->evaluacion->curso;
                if (!$curso || $curso->id_docente !== $user->id_usuario) {
                    return response()->json([
                        'message' => 'No tienes permisos para crear opciones en esta pregunta',
                        'error' => 'Unauthorized'
                    ], 403);
                }
            }

            $opcion = new OpcionRespuesta($data);
            $this->authorize('create', $opcion);

            $opcion->save();
            $opcion->load(['pregunta']);

            return response()->json([
                'data' => $opcion,
                'message' => 'Opción creada exitosamente'
            ], 201);
            
        } catch (Exception $e) {
            Log::error('Error al crear opción: ' . $e->getMessage());
            return response()->json([
                'message' => 'Error al crear la opción',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    // Actualizar opción (Admin/Docente)
    public function update(Request $request, $id)
    {
        try {
            $opcion = OpcionRespuesta::findOrFail($id);
            $this->authorize('update', $opcion);

            $data = $request->validate([
                'texto_opcion' => 'string|max:500',
                'es_correcta' => 'boolean'
            ]);

            $opcion->update($data);
            $opcion->load(['pregunta']);

            return response()->json([
                'data' => $opcion,
                'message' => 'Opción actualizada exitosamente'
            ]);
            
        } catch (Exception $e) {
            Log::error('Error al actualizar opción: ' . $e->getMessage());
            return response()->json([
                'message' => 'Error al actualizar la opción',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    // Eliminar opción (Admin/Docente)
    public function destroy($id)
    {
        try {
            $opcion = OpcionRespuesta::findOrFail($id);
            $this->authorize('delete', $opcion);
            
            $opcion->delete();
            
            return response()->json([
                'message' => 'Opción eliminada exitosamente'
            ]);
            
        } catch (Exception $e) {
            Log::error('Error al eliminar opción: ' . $e->getMessage());
            return response()->json([
                'message' => 'Error al eliminar la opción',
                'error' => $e->getMessage()
            ], 500);
        }
    }
}