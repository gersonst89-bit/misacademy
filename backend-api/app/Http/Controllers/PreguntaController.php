<?php

namespace App\Http\Controllers;

use App\Http\Requests\BaseApiRequest;
use App\Models\Pregunta;
use App\Models\Evaluacion;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Exception;

class PreguntaController extends Controller
{
    // Listar preguntas (Admin/Docente)
    public function index(Request $request)
    {
        $user = $request->user();
        
        if (!$user || !$user->rol) {
            return response()->json(['message' => 'Usuario no autorizado'], 403);
        }
        
        $rol = strtolower($user->rol->nombre_rol);
        
        // Admin: ve todas las preguntas
        if ($rol === 'administrador') {
            $query = Pregunta::with([
                'opciones:id_opcion,id_pregunta,texto_opcion,es_correcta'
            ]);
            
            // Filtros opcionales para admin
            if ($request->filled('id_evaluacion')) {
                $query->where('id_evaluacion', $request->id_evaluacion);
            }
            if ($request->filled('tipo')) {
                $query->where('tipo', $request->tipo);
            }
            
            $preguntas = $query->get();
            
            return response()->json([
                'preguntas' => $preguntas,
                'total' => $preguntas->count(),
                'status' => 'success'
            ]);
            
        } elseif ($rol === 'docente') {
            // Docente: solo preguntas de evaluaciones de sus cursos
            $query = Pregunta::with([
                'opciones:id_opcion,id_pregunta,texto_opcion,es_correcta'
            ])
                ->whereHas('evaluacion.curso', function ($q) use ($user) {
                    $q->where('id_docente', $user->id_usuario);
                });
            
            // Filtros opcionales para docente
            if ($request->filled('id_evaluacion')) {
                // Verificar que la evaluación pertenezca al docente
                $evaluacion = Evaluacion::whereHas('curso', function ($q) use ($user) {
                    $q->where('id_docente', $user->id_usuario);
                })->find($request->id_evaluacion);
                
                if (!$evaluacion) {
                    return response()->json(['message' => 'Evaluación no encontrada o sin permisos'], 404);
                }
                
                $query->where('id_evaluacion', $request->id_evaluacion);
            }
            
            $preguntas = $query->get();
            
            return response()->json([
                'preguntas' => $preguntas,
                'total' => $preguntas->count(),
                'status' => 'success'
            ]);
            
        } elseif ($rol === 'estudiante') {
            try {
                // Estudiante: SOLO preguntas de UNA evaluación específica
                if ($request->filled('id_evaluacion')) {
                    // Si especifica evaluación, verificar que tenga intento activo
                    $intentoActivo = DB::table('intentos_evaluacion')
                        ->where('id_usuario', $user->id_usuario)
                        ->where('id_evaluacion', $request->id_evaluacion)
                        ->where('estado', 'En progreso')
                        ->first();
                    
                    if (!$intentoActivo) {
                        return response()->json([
                            'message' => 'No tienes un intento activo para esta evaluación',
                        ], 403);
                    }
                    
                    $preguntas = Pregunta::with([
                        'opciones:id_opcion,id_pregunta,texto_opcion'
                    ])
                    ->where('id_evaluacion', $request->id_evaluacion)
                    ->orderBy('orden')
                    ->get();
                    
                } else {
                    // Si no especifica, tomar la evaluación más reciente iniciada
                    $intentoReciente = DB::table('intentos_evaluacion')
                        ->where('id_usuario', $user->id_usuario)
                        ->where('estado', 'En progreso')
                        ->orderBy('fecha_inicio', 'desc')
                        ->first();
                    
                    if (!$intentoReciente) {
                        return response()->json([
                            'preguntas' => [],
                            'total' => 0,
                            'status' => 'success',
                            'message' => 'No hay evaluaciones iniciadas'
                        ]);
                    }
                    
                    $preguntas = Pregunta::with([
                        'opciones:id_opcion,id_pregunta,texto_opcion'
                    ])
                    ->where('id_evaluacion', $intentoReciente->id_evaluacion)
                    ->orderBy('orden')
                    ->get();
                }
                
                return response()->json([
                    'preguntas' => $preguntas,
                    'total' => $preguntas->count(),
                    'status' => 'success'
                ]);
                
            } catch (Exception $e) {
                Log::error('Error preguntas estudiante: ' . $e->getMessage());
                return response()->json([
                    'message' => 'Error al obtener preguntas',
                    'error' => $e->getMessage()
                ], 500);
            }
        }
        
        return response()->json(['message' => 'Rol no autorizado'], 403);
    }

    // Ver pregunta específica (Admin/Docente)
    public function show(Request $request, $id)
    {
        $pregunta = Pregunta::with(['opciones', 'evaluacion.curso'])->findOrFail($id);
        $this->authorize('view', $pregunta);
        
        return response()->json([
            'pregunta' => $pregunta,
            'status' => 'success'
        ]);
    }

    // Crear pregunta (Admin/Docente)
    public function store(Request $request)
    {
        try {
            $data = $request->validate([
                'id_evaluacion' => 'required|exists:evaluaciones,id_evaluacion',
                'texto_pregunta' => 'required|string|max:1000',
                'tipo' => 'required|in:Opcion multiple,Verdadero/Falso,Texto libre',
                'puntos' => 'required|numeric|min:0',
                'orden' => 'nullable|integer|min:1'
            ]);

            $evaluacion = Evaluacion::findOrFail($data['id_evaluacion']);
            $user = $request->user();
            
            // Verificación específica para docentes: solo pueden crear preguntas en evaluaciones de sus cursos
            if ($user->rol && strtolower($user->rol->nombre_rol) === 'docente') {
                $curso = $evaluacion->curso;
                if (!$curso || $curso->id_docente !== $user->id_usuario) {
                    return response()->json([
                        'message' => 'No tienes permisos para crear preguntas en esta evaluación',
                        'error' => 'Unauthorized'
                    ], 403);
                }
            }

            $pregunta = new Pregunta($data);
            $this->authorize('create', $pregunta);

            $pregunta->save();
            $pregunta->load(['opciones', 'evaluacion']);

            return response()->json([
                'data' => $pregunta,
                'message' => 'Pregunta creada exitosamente'
            ], 201);
            
        } catch (Exception $e) {
            Log::error('Error al crear pregunta: ' . $e->getMessage());
            return response()->json([
                'message' => 'Error al crear la pregunta',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    // Actualizar pregunta (Admin/Docente)
    public function update(Request $request, $id)
    {
        try {
            $pregunta = Pregunta::findOrFail($id);
            $this->authorize('update', $pregunta);

            $data = $request->validate([
                'texto_pregunta' => 'string|max:1000',
                'tipo' => 'in:Opcion multiple,Verdadero/Falso,Texto libre',
                'puntos' => 'numeric|min:0',
                'orden' => 'nullable|integer|min:1'
            ]);

            $pregunta->update($data);
            $pregunta->load('opciones');

            return response()->json([
                'data' => [
                    'id_pregunta' => $pregunta->id_pregunta,
                    'id_evaluacion' => $pregunta->id_evaluacion,
                    'texto_pregunta' => $pregunta->texto_pregunta,
                    'tipo' => $pregunta->tipo,
                    'puntos' => $pregunta->puntos,
                    'orden' => $pregunta->orden,
                    'opciones' => $pregunta->opciones
                ],
                'message' => 'Pregunta actualizada exitosamente'
            ]);
            
        } catch (Exception $e) {
            Log::error('Error al actualizar pregunta: ' . $e->getMessage());
            return response()->json([
                'message' => 'Error al actualizar la pregunta',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    // Eliminar pregunta (Admin/Docente)
    public function destroy($id)
    {
        try {
            $pregunta = Pregunta::findOrFail($id);
            $this->authorize('delete', $pregunta);
            
            $pregunta->delete();
            
            return response()->json([
                'message' => 'Pregunta eliminada exitosamente'
            ]);
            
        } catch (Exception $e) {
            Log::error('Error al eliminar pregunta: ' . $e->getMessage());
            return response()->json([
                'message' => 'Error al eliminar la pregunta',
                'error' => $e->getMessage()
            ], 500);
        }
    }
}