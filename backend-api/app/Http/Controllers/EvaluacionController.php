<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Models\Evaluacion;
use App\Models\IntentoEvaluacion;
use App\Models\RespuestaUsuario;
use App\Models\Pregunta;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Exception;

class EvaluacionController extends Controller
{
    // Listar evaluaciones según rol del usuario
    public function index(Request $request)
    {
        $user = $request->user();
        $query = Evaluacion::query();

        // Filtros opcionales
        if ($request->filled('id_curso')) {
            $query->where('id_curso', $request->id_curso);
        }

        // Estudiante: solo evaluaciones activas de cursos comprados
        if ($user && $user->rol && strtolower($user->rol->nombre_rol) === 'estudiante') {
            $cursosDisponibles = DB::table('inscripciones as i')
                ->join('detalle_pagos as dp', 'i.id_curso', '=', 'dp.id_curso')
                ->join('pagos as p', 'dp.id_pago', '=', 'p.id_pago')
                ->where('i.id_usuario', $user->id_usuario)
                ->where('i.estado', 'Activo')
                ->where('p.id_usuario', $user->id_usuario)
                ->where('p.estado', 'Completado')
                ->pluck('i.id_curso');
            
            $evaluaciones = Evaluacion::whereIn('id_curso', $cursosDisponibles)
                ->where('estado', 'Publicado')
                ->get()
                ->map(function ($evaluacion) use ($user) {
                    $intentos = IntentoEvaluacion::where('id_usuario', $user->id_usuario)
                        ->where('id_evaluacion', $evaluacion->id_evaluacion)
                        ->count();
                    
                    $evaluacion->intentos_realizados = $intentos;
                    $evaluacion->puede_intentar = $intentos < ($evaluacion->intentos_maximos ?? 3);
                    return $evaluacion;
                });
            
            return response()->json([
                'evaluaciones' => $evaluaciones,
                'status' => 'success'
            ]);
        } elseif ($user && $user->rol && strtolower($user->rol->nombre_rol) === 'docente') {
            // Docente: solo evaluaciones de sus cursos (todos los estados)
            if ($request->filled('titulo')) {
                $query->where('titulo', 'like', '%' . $request->titulo . '%');
            }
            $query->whereHas('curso', function ($q) use ($user) {
                $q->where('id_docente', $user->id_usuario);
            });
        } else {
            // Admin: todas las evaluaciones, aplicar filtros
            if ($request->filled('titulo')) {
                $query->where('titulo', 'like', '%' . $request->titulo . '%');
            }
        }

        $evaluaciones = $query->orderByDesc('id_evaluacion')->paginate(15);

        return response()->json([
            'data' => $evaluaciones,
            'message' => 'Evaluaciones obtenidas exitosamente'
        ]);
    }

    // Ver evaluación específica como estudiante
    public function show(Request $request, $id)
    {
        $evaluacion = Evaluacion::with(['preguntas.opciones'])->findOrFail($id);
        $this->authorize('view', $evaluacion);
        
        $user = $request->user();
        
        // Verificar intentos previos
        $intentos = IntentoEvaluacion::where('id_usuario', $user->id_usuario)
            ->where('id_evaluacion', $evaluacion->id_evaluacion)
            ->count();

        // Log para depuración
        Log::info('EvaluacionController@show', [
            'id_evaluacion' => $evaluacion->id_evaluacion,
            'id_usuario' => $user->id_usuario,
            'intentos_realizados' => $intentos,
            'intentos_maximos' => $evaluacion->intentos_maximos
        ]);

        if ($intentos >= ($evaluacion->intentos_maximos ?? 3)) {
            return response()->json([
                'message' => 'Has agotado el número máximo de intentos para esta evaluación',
                'status' => 'error'
            ], 403);
        }

        return response()->json([
            'evaluacion' => $evaluacion,
            'intentos_realizados' => $intentos,
            'intentos_permitidos' => $evaluacion->intentos_maximos ?? 3,
            'puede_intentar' => $intentos < ($evaluacion->intentos_maximos ?? 3),
            'status' => 'success'
        ]);
    }

    // FUNCIONALIDAD ESPECÍFICA PARA ESTUDIANTES

    // Iniciar un intento de evaluación (solo estudiantes por policy)
    public function iniciar(Request $request, $id)
    {
        $evaluacion = Evaluacion::findOrFail($id);
        $this->authorize('iniciar', $evaluacion);

        $user = $request->user();
        
        // Verificar si ya tiene un intento en progreso
        $intentoEnProgreso = IntentoEvaluacion::where('id_usuario', $user->id_usuario)
            ->where('id_evaluacion', $evaluacion->id_evaluacion)
            ->where('estado', 'En Progreso')
            ->first();

        if ($intentoEnProgreso) {
            return response()->json([
                'intento' => $intentoEnProgreso,
                'message' => 'Ya tienes un intento en progreso',
                'status' => 'warning'
            ]);
        }

        // Verificar límite de intentos
        $intentos = IntentoEvaluacion::where('id_usuario', $user->id_usuario)
            ->where('id_evaluacion', $evaluacion->id_evaluacion)
            ->count();

        if ($intentos >= ($evaluacion->intentos_maximos ?? 3)) {
            return response()->json([
                'message' => 'Has agotado el número máximo de intentos',
                'status' => 'error'
            ], 403);
        }

        // Crear nuevo intento
        $intento = IntentoEvaluacion::create([
            'id_usuario' => $user->id_usuario,
            'id_evaluacion' => $evaluacion->id_evaluacion,
            'fecha_inicio' => now(),
            'intento_numero' => $intentos + 1,
            'estado' => 'En Progreso'
        ]);

        // Ocultar el campo 'es_correcta' en las opciones antes de enviar al frontend
        $evaluacion->load('preguntas.opciones');
        foreach ($evaluacion->preguntas as $pregunta) {
            foreach ($pregunta->opciones as $opcion) {
                unset($opcion->es_correcta);
            }
        }
        return response()->json([
            'intento' => $intento,
            'evaluacion' => $evaluacion,
            'message' => 'Evaluación iniciada correctamente',
            'status' => 'success'
        ], 201);
    }

    // Responder una evaluación (simplificado para testing)
    public function responder(Request $request, $idEvaluacion)
    {
        $request->validate([
            'respuestas' => 'required|array',
            'respuestas.*.id_pregunta' => 'required|exists:preguntas,id_pregunta',
            'respuestas.*.id_opcion' => 'nullable|exists:opciones_respuesta,id_opcion',
            'respuestas.*.respuesta_texto' => 'nullable|string|max:1000'
        ]);

        $user = $request->user();
        
        // Buscar intento activo del usuario para esta evaluación
        $intento = DB::table('intentos_evaluacion')
            ->where('id_usuario', $user->id_usuario)
            ->where('id_evaluacion', $idEvaluacion)
            ->where('estado', 'En progreso')
            ->first();
            
        if (!$intento) {
            return response()->json([
                'message' => 'No tienes un intento activo para esta evaluación'
            ], 403);
        }

        try {
            $puntajeTotal = 0;
            $puntajeMaximo = 0;

            foreach ($request->respuestas as $respuestaData) {
                $pregunta = Pregunta::with('opciones')->findOrFail($respuestaData['id_pregunta']);
                $puntajeMaximo += $pregunta->puntos;

                // Calcular puntos obtenidos
                $puntosObtenidos = 0;
                if ($pregunta->tipo === 'Opcion multiple' && isset($respuestaData['id_opcion'])) {
                    $opcion = $pregunta->opciones()->find($respuestaData['id_opcion']);
                    if ($opcion && $opcion->es_correcta) {
                        $puntosObtenidos = $pregunta->puntos;
                    }
                }

                $puntajeTotal += $puntosObtenidos;

                // Guardar respuesta usando DB directamente
                DB::table('respuestas_usuario')->insert([
                    'id_intento' => $intento->id_intento,
                    'id_pregunta' => $pregunta->id_pregunta,
                    'id_opcion' => $respuestaData['id_opcion'] ?? null,
                    'respuesta_texto' => $respuestaData['respuesta_texto'] ?? null,
                    'puntos_obtenidos' => $puntosObtenidos
                ]);
            }

            // Finalizar intento
            $calificacion = $puntajeMaximo > 0 ? ($puntajeTotal / $puntajeMaximo) * 100 : 0;
            
            // Obtener puntuación requerida de la evaluación
            $evaluacion = Evaluacion::findOrFail($idEvaluacion);
            $resultado = $calificacion >= $evaluacion->puntuacion_requerida ? 'Aprobado' : 'Desaprobado';
            
            DB::table('intentos_evaluacion')
                ->where('id_intento', $intento->id_intento)
                ->update([
                    'fecha_finalizacion' => now(),
                    'calificacion' => $calificacion,
                    'estado' => 'Completado',
                    'resultado' => $resultado
                ]);

            return response()->json([
                'puntos_obtenidos' => $puntajeTotal,
                'puntos_maximos' => $puntajeMaximo,
                'calificacion' => round($calificacion, 2),
                'message' => 'Evaluación enviada correctamente',
                'status' => 'success'
            ]);

        } catch (\Exception $e) {
            Log::error('Error al procesar respuestas: ' . $e->getMessage());
            return response()->json([
                'message' => 'Error al procesar las respuestas',
                'error' => $e->getMessage(),
                'file' => $e->getFile(),
                'line' => $e->getLine(),
                'status' => 'error'
            ], 500);
        }
    }

    // Historial de intentos del estudiante
    public function misEvaluaciones(Request $request)
    {
        try {
            $user = $request->user();
            
            // Verificar que sea estudiante
            if (!$user->rol || strtolower($user->rol->nombre_rol) !== 'estudiante') {
                return response()->json(['message' => 'Acceso denegado'], 403);
            }
            
            // Debug: Verificar si existen intentos
            $intentosCount = IntentoEvaluacion::where('id_usuario', $user->id_usuario)->count();
            
            if ($intentosCount === 0) {
                return response()->json([
                    'intentos' => [],
                    'message' => 'No tienes evaluaciones realizadas',
                    'status' => 'success'
                ]);
            }
            
            $intentos = IntentoEvaluacion::with(['evaluacion'])
                ->where('id_usuario', $user->id_usuario)
                ->orderByDesc('fecha_inicio')
                ->paginate(15);

            return response()->json([
                'intentos' => $intentos,
                'status' => 'success'
            ]);
            
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Error al obtener evaluaciones',
                'error' => $e->getMessage(),
                'status' => 'error'
            ], 500);
        }
    }

    // Ver resultado de un intento específico
    public function verResultado(Request $request, $idIntento)
    {
        $user = $request->user();
        $intento = IntentoEvaluacion::with([
            'evaluacion.curso:id_curso,nombre',
            'respuestas.pregunta',
            'respuestas.opcion'
        ])->findOrFail($idIntento);

        $this->authorize('view', $intento);

        // Verificar si el usuario agotó todos los intentos
        $intentosRealizados = IntentoEvaluacion::where('id_usuario', $user->id_usuario)
            ->where('id_evaluacion', $intento->id_evaluacion)
            ->count();
        $maximos = $intento->evaluacion->intentos_maximos ?? 3;

        // Calcular si el intento está aprobado
        $puntuacionRequerida = floatval($intento->evaluacion->puntuacion_requerida);
        $calificacion = floatval($intento->calificacion); // calificación es porcentaje
        $aprobado = $intento->estado === 'Completado' && $calificacion >= $puntuacionRequerida;

        if ($intentosRealizados < $maximos && !$aprobado) {
            // Mostrar solo información básica, sin respuestas detalladas
            return response()->json([
                'message' => 'Solo puedes ver el detalle de tus respuestas cuando hayas agotado todos tus intentos o hayas aprobado la evaluación.',
                'intento' => [
                    'id_intento' => $intento->id_intento,
                    'calificacion' => $intento->calificacion,
                    'estado' => $intento->estado,
                    'fecha_finalizacion' => $intento->fecha_finalizacion,
                ],
                'status' => 'limited'
            ], 403);
        }

        // Si ya agotó los intentos o aprobó, mostrar todo
        return response()->json([
            'intento' => $intento,
            'status' => 'success'
        ]);
    }

    // === MÉTODOS ADMINISTRATIVOS ===

    // Crear evaluación (Admin/Docente)
    public function store(Request $request)
    {
        try {
            $data = $request->validate([
                'titulo' => 'required|string|max:255',
                'descripcion' => 'nullable|string',
                'id_curso' => 'required|exists:cursos,id_curso',
                'tipo' => 'required|in:test,final',
                'duracion' => 'required|integer|min:1',
                'intentos_maximos' => 'nullable|integer|min:1',
                'puntuacion_requerida' => 'required|numeric|min:0|max:100',
                'estado' => 'in:Borrador,Publicado,Archivado'
            ]);

            $user = $request->user();
            
            // Verificación específica para docentes: solo pueden crear en sus cursos
            if ($user->rol && strtolower($user->rol->nombre_rol) === 'docente') {
                $curso = \App\Models\Curso::findOrFail($data['id_curso']);
                if ($curso->id_docente !== $user->id_usuario) {
                    return response()->json([
                        'message' => 'No tienes permisos para crear evaluaciones en este curso',
                        'error' => 'Unauthorized'
                    ], 403);
                }
            }

            $evaluacion = new Evaluacion($data);
            $this->authorize('create', $evaluacion);

            $evaluacion->save();

            return response()->json([
                'data' => $evaluacion,
                'message' => 'Evaluación creada exitosamente'
            ], 201);
        } catch (Exception $e) {
            Log::error('Error al crear evaluación: ' . $e->getMessage());
            return response()->json([
                'message' => 'Error al crear la evaluación',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    // Actualizar evaluación (Admin/Docente)
    public function update(Request $request, $id)
    {
        try {
            $evaluacion = Evaluacion::findOrFail($id);
            $this->authorize('update', $evaluacion);

            $data = $request->validate([
                'titulo' => 'string|max:255',
                'descripcion' => 'nullable|string',
                'tipo' => 'in:test,final',
                'duracion' => 'integer|min:1',
                'intentos_maximos' => 'nullable|integer|min:1',
                'puntuacion_requerida' => 'nullable|numeric|min:0|max:100',
                'estado' => 'in:Borrador,Publicado,Archivado'
            ]);

            $evaluacion->update($data);

            return response()->json([
                'data' => $evaluacion,
                'message' => 'Evaluación actualizada exitosamente'
            ]);
        } catch (Exception $e) {
            Log::error('Error al actualizar evaluación: ' . $e->getMessage());
            return response()->json([
                'message' => 'Error al actualizar la evaluación',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    // Eliminar evaluación (Admin/Docente)
    public function destroy($id)
    {
        try {
            $evaluacion = Evaluacion::findOrFail($id);
            $this->authorize('delete', $evaluacion);

            $evaluacion->delete();

            return response()->json([
                'message' => 'Evaluación eliminada exitosamente'
            ]);
        } catch (Exception $e) {
            Log::error('Error al eliminar evaluación: ' . $e->getMessage());
            return response()->json([
                'message' => 'Error al eliminar la evaluación',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    // Cambiar estado de evaluación (Admin/Docente)
    public function updateEstado(Request $request, $id)
    {
        try {
            $evaluacion = Evaluacion::findOrFail($id);
            $this->authorize('update', $evaluacion);

            $data = $request->validate([
                'estado' => 'required|in:Borrador,Publicado,Archivado'
            ]);

            $evaluacion->update($data);

            return response()->json([
                'data' => $evaluacion,
                'message' => 'Estado de evaluación actualizado exitosamente'
            ]);
        } catch (Exception $e) {
            Log::error('Error al cambiar estado: ' . $e->getMessage());
            return response()->json([
                'message' => 'Error al cambiar el estado',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    // Ver intentos de una evaluación (Admin/Docente)
    public function intentos($id)
    {
        try {
            $evaluacion = Evaluacion::findOrFail($id);
            $this->authorize('view', $evaluacion);

            $intentos = IntentoEvaluacion::with(['usuario:id_usuario,nombre,email'])
                ->where('id_evaluacion', $id)
                ->orderByDesc('fecha_inicio')
                ->paginate(15);

            return response()->json([
                'data' => $intentos,
                'evaluacion' => $evaluacion,
                'message' => 'Intentos obtenidos exitosamente'
            ]);
        } catch (Exception $e) {
            Log::error('Error al obtener intentos: ' . $e->getMessage());
            return response()->json([
                'message' => 'Error al obtener los intentos',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    // Reportes generales (Solo Admin)
    public function reportes(Request $request)
    {
        try {
            $user = $request->user();
            
            // Solo admin puede ver reportes
            if (!$user || !$user->rol || strtolower($user->rol->nombre_rol) !== 'administrador') {
                return response()->json(['message' => 'Acceso denegado - Solo administradores'], 403);
            }

            $stats = [
                'total_evaluaciones' => Evaluacion::count(),
                'evaluaciones_activas' => Evaluacion::where('estado', 'Publicado')->count(),
                'total_intentos' => IntentoEvaluacion::count(),
                'intentos_completados' => IntentoEvaluacion::whereNotNull('fecha_fin')->count(),
                'promedio_puntuacion' => IntentoEvaluacion::whereNotNull('puntuacion')->avg('puntuacion')
            ];

            return response()->json([
                'data' => $stats,
                'message' => 'Reportes obtenidos exitosamente'
            ]);
        } catch (Exception $e) {
            Log::error('Error al generar reportes: ' . $e->getMessage());
            return response()->json([
                'message' => 'Error al generar reportes',
                'error' => $e->getMessage()
            ], 500);
        }
    }
    public function checkEligibility(Request $request, $courseId)
    {
        $user = $request->user();
        $evaluacion = Evaluacion::where('id_curso', $courseId)
            ->where('tipo', 'final')
            ->where('estado', 'Publicado')
            ->first();
        if (!$evaluacion) {
            return response()->json([
                'eligible' => false,
                'reason' => 'No existe evaluación publicada para este curso',
            ], 404);
        }
        
        $intentos = IntentoEvaluacion::where('id_usuario', $user->id_usuario)
            ->where('id_evaluacion', $evaluacion->id_evaluacion)
            ->where('estado', 'Completado')
            ->count();
        
        // Obtener el último intento (completado o no)
        $ultimoIntento = IntentoEvaluacion::where('id_usuario', $user->id_usuario)
            ->where('id_evaluacion', $evaluacion->id_evaluacion)
            ->orderBy('fecha_finalizacion', 'desc')
            ->first();
        
        // Preparar datos del último intento
        $lastAttemptData = $ultimoIntento ? [
            'puntos_obtenidos' => $ultimoIntento->calificacion,
            'puntaje_maximo' => $evaluacion->puntaje_maximo,
            'porcentaje' => $evaluacion->puntaje_maximo > 0 
                ? round(($ultimoIntento->calificacion / $evaluacion->puntaje_maximo) * 100, 2)
                : 0,
            'puntaje_requerido' => $evaluacion->puntuacion_requerida,
            'fecha_finalizacion' => $ultimoIntento->fecha_finalizacion,
            'intento_numero' => $ultimoIntento->intento_numero,
        ] : null;
        
        if ($intentos >= ($evaluacion->intentos_maximos ?? 3)) {
            return response()->json([
                'eligible' => false,
                'reason' => 'Has agotado el número máximo de intentos',
                'attempts' => $intentos,
                'lastAttempt' => $lastAttemptData,
            ], 403);
        }
        
        return response()->json([
            'eligible' => true,
            'attempts' => $intentos,
            'maxAttempts' => $evaluacion->intentos_maximos ?? 3,
            'configuration' => [
                'totalQuestions' => $evaluacion->preguntas()->count(),
                'timeLimitSeconds' => $evaluacion->duracion * 60,
                'passingPercentage' => $evaluacion->puntuacion_requerida,
                'maxAttempts' => $evaluacion->intentos_maximos ?? 3,
                'remainingAttempts' => ($evaluacion->intentos_maximos ?? 3) - $intentos,
            ],
        ]);
    }

    // 2. Info/configuración de evaluación
    public function getEvaluationInfo(Request $request, $courseId)
    {
        $evaluacion = Evaluacion::where('id_curso', $courseId)
            ->where('estado', 'Publicado')
            ->where('tipo', 'final')
            ->first();
        if (!$evaluacion) {
            return response()->json([
                'message' => 'No existe evaluación publicada para este curso',
            ], 404);
        }
        return response()->json([
            'id_evaluacion' => $evaluacion->id_evaluacion,
            'configuration' => [
                'totalQuestions' => $evaluacion->preguntas()->count(),
                'timeLimitSeconds' => $evaluacion->duracion * 60,
                'passingPercentage' => $evaluacion->puntuacion_requerida,
                'maxAttempts' => $evaluacion->intentos_maximos ?? 3,
            ],
            'rules' => [
                'No refrescar la página durante la evaluación.',
                'No cambiar de pestaña o ventana.',
                'No copiar ni pegar contenido.',
                'Solo una sesión activa por usuario.',
                'Tiempo límite estricto.',
            ],
        ]);
    }

    // 3. Recuperar sesión activa
    public function resumeSession(Request $request, $sessionId)
    {
        $user = $request->user();
        $intento = IntentoEvaluacion::with(['evaluacion.preguntas.opciones', 'respuestas'])
            ->where('id_intento', $sessionId)
            ->where('id_usuario', $user->id_usuario)
            ->where('estado', 'En Progreso')
            ->first();
        if (!$intento) {
            return response()->json([
                'message' => 'No hay sesión activa para este usuario',
            ], 404);
        }
        // Ocultar el campo 'es_correcta' en las opciones antes de enviar al frontend
        if ($intento && $intento->evaluacion && $intento->evaluacion->preguntas) {
            foreach ($intento->evaluacion->preguntas as $pregunta) {
                foreach ($pregunta->opciones as $opcion) {
                    unset($opcion->es_correcta);
                }
            }
        }
        // Calcular tiempo restante
        $duracionMin = $intento->evaluacion->duracion ?? 0; // minutos
        $fechaInicio = $intento->fecha_inicio ? strtotime($intento->fecha_inicio) : null;
        $ahora = time();
        $tiempoTranscurrido = $fechaInicio ? ($ahora - $fechaInicio) : 0;
        $tiempoRestante = $duracionMin > 0 ? max(0, $duracionMin * 60 - $tiempoTranscurrido) : null;

        return response()->json([
            'session' => $intento,
            'tiempo_restante' => $tiempoRestante,
        ]);
    }

    // 4. Guardar respuesta individual
    public function saveAnswer(Request $request, $sessionId)
    {
        $request->validate([
            'questionId' => 'required|exists:preguntas,id_pregunta',
            'selectedOptions' => 'array',
            'markedForReview' => 'boolean',
            'answeredAt' => 'date',
        ]);
        $user = $request->user();
        $intento = IntentoEvaluacion::where('id_intento', $sessionId)
            ->where('id_usuario', $user->id_usuario)
            ->where('estado', 'En Progreso')
            ->first();
        if (!$intento) {
            return response()->json([
                'message' => 'No hay sesión activa',
            ], 404);
        }
        // Guardar respuesta
        $pregunta = \App\Models\Pregunta::with('opciones')->findOrFail($request->questionId);
        $selectedOptionId = $request->selectedOptions[0] ?? null;
        $puntosObtenidos = 0;
        if ($pregunta->tipo === 'Opcion multiple' && isset($selectedOptionId)) {
            $opcion = $pregunta->opciones()->find($selectedOptionId);
            if ($opcion && $opcion->es_correcta) {
                $puntosObtenidos = $pregunta->puntos;
            }
        }
        $respuesta = RespuestaUsuario::updateOrCreate([
            'id_intento' => $sessionId,
            'id_pregunta' => $request->questionId,
        ], [
            'id_opcion' => $selectedOptionId,
            'marcada_para_revision' => $request->markedForReview ?? false,
            'fecha_respuesta' => $request->answeredAt ?? now(),
            'puntos_obtenidos' => $puntosObtenidos
        ]);
        return response()->json([
            'status' => 'saved',
        ]);
    }

    // 5. Guardar respuestas batch
    public function saveAnswersBatch(Request $request, $sessionId)
    {
        $request->validate([
            'answers' => 'required|array',
        ]);
        $user = $request->user();
        $intento = IntentoEvaluacion::where('id_intento', $sessionId)
            ->where('id_usuario', $user->id_usuario)
            ->where('estado', 'En Progreso')
            ->first();
        if (!$intento) {
            return response()->json([
                'message' => 'No hay sesión activa',
            ], 404);
        }
        $savedAnswers = [];
        foreach ($request->answers as $ans) {
            if (!isset($ans['questionId'])) continue;
            $pregunta = \App\Models\Pregunta::with('opciones')->findOrFail($ans['questionId']);
            $selectedOptionId = $ans['selectedOptions'][0] ?? null;
            $puntosObtenidos = 0;
            if ($pregunta->tipo === 'Opcion multiple' && isset($selectedOptionId)) {
                $opcion = $pregunta->opciones()->find($selectedOptionId);
                if ($opcion && $opcion->es_correcta) {
                    $puntosObtenidos = $pregunta->puntos;
                }
            }
            $respuesta = RespuestaUsuario::updateOrCreate([
                'id_intento' => $sessionId,
                'id_pregunta' => $ans['questionId'],
            ], [
                'id_opcion' => $selectedOptionId,
                'marcada_para_revision' => $ans['markedForReview'] ?? false,
                'fecha_respuesta' => $ans['answeredAt'] ?? now(),
                'puntos_obtenidos' => $puntosObtenidos
            ]);
            $savedAnswers[] = [
                'questionId' => $ans['questionId'],
                'id_respuesta' => $respuesta->id_respuesta ?? null
            ];
        }
        return response()->json([
            'status' => 'batch_saved',
            'savedAnswers' => $savedAnswers,
            'message' => 'Respuestas guardadas correctamente'
        ]);
    }

    // 6. Heartbeat
    public function sendHeartbeat(Request $request, $sessionId)
    {
        $user = $request->user();
        $intento = IntentoEvaluacion::where('id_intento', $sessionId)
            ->where('id_usuario', $user->id_usuario)
            ->where('estado', 'En Progreso')
            ->first();
        if (!$intento) {
            return response()->json([
                'message' => 'No hay sesión activa',
            ], 404);
        }
        // Registrar heartbeat (puedes guardar en log, tabla, etc)
        Log::info('Heartbeat evaluación', [
            'sessionId' => $sessionId,
            'userId' => $user->id_usuario,
            'data' => $request->all(),
        ]);
        return response()->json([
            'status' => 'heartbeat_received',
        ]);
    }

    // 7. Registrar eventos de seguridad
    public function recordEvents(Request $request, $sessionId)
    {
        $user = $request->user();
        $intento = IntentoEvaluacion::where('id_intento', $sessionId)
            ->where('id_usuario', $user->id_usuario)
            ->where('estado', 'En Progreso')
            ->first();
        if (!$intento) {
            return response()->json([
                'message' => 'No hay sesión activa',
            ], 404);
        }
        Log::warning('Evento de seguridad evaluación', [
            'sessionId' => $sessionId,
            'userId' => $user->id_usuario,
            'events' => $request->events,
        ]);
        return response()->json([
            'status' => 'events_recorded',
        ]);
    }

    // 8. Finalizar evaluación (submit)
    public function submitEvaluation(Request $request, $sessionId)
    {
        $user = $request->user();
        $intento = IntentoEvaluacion::with(['evaluacion.preguntas', 'respuestas'])
            ->where('id_intento', $sessionId)
            ->where('id_usuario', $user->id_usuario)
            ->where('estado', 'En Progreso')
            ->first();
        if (!$intento) {
            return response()->json([
                'message' => 'No hay sesión activa',
            ], 404);
        }
        // Calcular puntaje y finalizar
        $puntajeTotal = 0;
        $puntajeMaximo = 0;
        foreach ($intento->evaluacion->preguntas as $pregunta) {
            $puntajeMaximo += $pregunta->puntos;
            $respuesta = $intento->respuestas->where('id_pregunta', $pregunta->id_pregunta)->first();
            if ($respuesta && $pregunta->tipo === 'Opcion multiple') {
                $opcion = $pregunta->opciones->where('id_opcion', $respuesta->id_opcion)->first();
                if ($opcion && $opcion->es_correcta) {
                    $puntajeTotal += $pregunta->puntos;
                }
            }
        }
        $calificacion = $puntajeMaximo > 0 ? ($puntajeTotal / $puntajeMaximo) * 100 : 0;
        $resultado = $calificacion >= $intento->evaluacion->puntuacion_requerida ? 'Aprobado' : 'Desaprobado';
        
        $intento->fecha_finalizacion = now();
        $intento->calificacion = $puntajeTotal; // Guardar puntos obtenidos, no porcentaje
        $intento->estado = 'Completado';
        $intento->resultado = $resultado;
        $intento->save();

        // Marcar inscripción como completada si se aprueba la evaluación final y el curso está al 100%
        if ($intento->evaluacion->tipo === 'final' && $calificacion >= $intento->evaluacion->puntuacion_requerida) {
            $inscripcion = \App\Models\Inscripcion::where('id_usuario', $user->id_usuario)
                ->where('id_curso', $intento->evaluacion->id_curso)
                ->first();
            if ($inscripcion && $inscripcion->progreso_total == 100) {
                $inscripcion->estado = 'Completado';
                $inscripcion->fecha_completado = now();
                $inscripcion->save();
            }
        }

        return response()->json([
            'puntos_obtenidos' => $puntajeTotal,
            'puntos_maximos' => $puntajeMaximo,
            'calificacion' => round($calificacion, 2),
            'status' => 'submitted',
        ]);
    }
}
