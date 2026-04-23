<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\EvaluacionRequest;
use App\Models\Evaluacion;
use App\Models\IntentoEvaluacion;
use Illuminate\Http\Request;

class EvaluacionController extends Controller
{
    // Listar todas las evaluaciones (admin puede ver todas, docente solo las suyas)
    public function index(Request $request)
    {
        $this->authorize('viewAny', Evaluacion::class);
        
        $user = $request->user();
        $query = Evaluacion::with(['curso:id_curso,titulo,id_docente']);
        
        // Docente solo ve evaluaciones de sus cursos
        if ($user->rol && strtolower($user->rol->nombre_rol) === 'docente') {
            $query->whereHas('curso', function ($q) use ($user) {
                $q->where('id_docente', $user->id_usuario);
            });
        }
        
        // Filtros opcionales
        if ($request->filled('id_curso')) {
            $query->where('id_curso', $request->id_curso);
        }
        
        if ($request->filled('estado')) {
            $query->where('estado', $request->estado);
        }
        
        if ($request->filled('tipo')) {
            $query->where('tipo', $request->tipo);
        }
        
        $evaluaciones = $query->orderByDesc('created_at')->paginate(15);
        
        return response()->json($evaluaciones);
    }

    // Ver evaluación específica con detalles administrativos
    public function show($id)
    {
        $evaluacion = Evaluacion::with([
            'curso:id_curso,titulo,id_docente',
            'preguntas.opciones',
            'intentos.usuario:id_usuario,nombre,apellido'
        ])->findOrFail($id);
        
        $this->authorize('view', $evaluacion);
        
        // Estadísticas adicionales para admins/docentes
        $estadisticas = [
            'total_intentos' => $evaluacion->intentos()->count(),
            'intentos_completados' => $evaluacion->intentos()->where('estado', 'Finalizado')->count(),
            'promedio_calificacion' => $evaluacion->intentos()
                ->where('estado', 'Finalizado')
                ->avg('calificacion'),
            'mejor_calificacion' => $evaluacion->intentos()
                ->where('estado', 'Finalizado')
                ->max('calificacion'),
            'peor_calificacion' => $evaluacion->intentos()
                ->where('estado', 'Finalizado')
                ->min('calificacion')
        ];
        
        return response()->json([
            'evaluacion' => $evaluacion,
            'estadisticas' => $estadisticas
        ]);
    }

    // Crear evaluación (admin o docente de curso)
    public function store(EvaluacionRequest $request)
    {
        $this->authorize('create', Evaluacion::class);
        
        $data = $request->validated();
        
        // Si es docente, verificar que sea dueño del curso
        $user = $request->user();
        if ($user->rol && strtolower($user->rol->nombre_rol) === 'docente') {
            $curso = \App\Models\Curso::findOrFail($data['id_curso']);
            if ($curso->id_docente !== $user->id_usuario) {
                return response()->json(['message' => 'No puedes crear evaluaciones para cursos que no son tuyos'], 403);
            }
        }
        
        $evaluacion = Evaluacion::create($data);
        $evaluacion->load('curso:id_curso,titulo');
        
        return response()->json([
            'message' => 'Evaluación creada correctamente',
            'evaluacion' => $evaluacion
        ], 201);
    }

    // Actualizar evaluación (admin o docente dueño)
    public function update(EvaluacionRequest $request, $id)
    {
        $evaluacion = Evaluacion::findOrFail($id);
        $this->authorize('update', $evaluacion);
        
        $evaluacion->update($request->validated());
        $evaluacion->load('curso:id_curso,titulo');
        
        return response()->json([
            'message' => 'Evaluación actualizada correctamente',
            'evaluacion' => $evaluacion
        ]);
    }

    // Eliminar evaluación (admin o docente dueño)
    public function destroy($id)
    {
        $evaluacion = Evaluacion::findOrFail($id);
        $this->authorize('delete', $evaluacion);
        
        // Verificar que no tenga intentos completados
        $intentosCompletados = $evaluacion->intentos()->where('estado', 'Finalizado')->count();
        if ($intentosCompletados > 0) {
            return response()->json([
                'message' => 'No se puede eliminar una evaluación que ya tiene intentos completados',
                'intentos_completados' => $intentosCompletados
            ], 400);
        }
        
        $evaluacion->delete();
        
        return response()->json([
            'message' => 'Evaluación eliminada correctamente'
        ]);
    }

    // Cambiar estado de evaluación (admin o docente dueño)
    public function updateEstado(\App\Http\Requests\Admin\UpdateEstadoRequest $request, $id)
    {
        $evaluacion = Evaluacion::findOrFail($id);
        $this->authorize('update', $evaluacion);
        
        $evaluacion->estado = $request->estado;
        $evaluacion->save();
        
        return response()->json([
            'message' => 'Estado actualizado correctamente',
            'evaluacion' => $evaluacion->only(['id_evaluacion', 'titulo', 'estado'])
        ]);
    }

    // Ver intentos de una evaluación específica (admin/docente)
    public function intentos($id)
    {
        $evaluacion = Evaluacion::findOrFail($id);
        $this->authorize('view', $evaluacion);
        
        $intentos = IntentoEvaluacion::with([
            'usuario:id_usuario,nombre,apellido,email',
            'respuestas.pregunta:id_pregunta,texto_pregunta,puntos',
            'respuestas.opcion:id_opcion,texto_opcion,es_correcta'
        ])
        ->where('id_evaluacion', $evaluacion->id_evaluacion)
        ->orderByDesc('fecha_inicio')
        ->paginate(20);
        
        return response()->json([
            'evaluacion' => $evaluacion->only(['id_evaluacion', 'titulo']),
            'intentos' => $intentos
        ]);
    }

    // Reportes y estadísticas detalladas (solo admin)
    public function reportes(Request $request)
    {
        $user = $request->user();
        if (!$user->rol || strtolower($user->rol->nombre_rol) !== 'administrador') {
            return response()->json(['message' => 'Solo administradores pueden acceder a reportes'], 403);
        }
        
        $filtros = $request->only(['fecha_inicio', 'fecha_fin', 'id_curso', 'tipo']);
        
        $query = Evaluacion::with('curso:id_curso,titulo');
        
        // Aplicar filtros
        if (!empty($filtros['fecha_inicio'])) {
            $query->where('created_at', '>=', $filtros['fecha_inicio']);
        }
        
        if (!empty($filtros['fecha_fin'])) {
            $query->where('created_at', '<=', $filtros['fecha_fin']);
        }
        
        if (!empty($filtros['id_curso'])) {
            $query->where('id_curso', $filtros['id_curso']);
        }
        
        if (!empty($filtros['tipo'])) {
            $query->where('tipo', $filtros['tipo']);
        }
        
        $evaluaciones = $query->get();
        
        $reporte = [
            'total_evaluaciones' => $evaluaciones->count(),
            'por_tipo' => $evaluaciones->groupBy('tipo')->map->count(),
            'por_estado' => $evaluaciones->groupBy('estado')->map->count(),
            'estadisticas_generales' => [
                'promedio_duracion' => $evaluaciones->avg('duracion'),
                'promedio_puntuacion_requerida' => $evaluaciones->avg('puntuacion_requerida'),
                'promedio_intentos_permitidos' => $evaluaciones->avg('intentos_maximos')
            ]
        ];
        
        return response()->json($reporte);
    }
}
