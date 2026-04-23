<?php

namespace App\Http\Controllers;

use App\Services\CursoService;
use Illuminate\Support\Facades\Log;
use Illuminate\Http\Request;
use App\Http\Requests\BuscarCursoRequest;
use Illuminate\Support\Facades\Auth;
use Illuminate\Validation\ValidationException;
use Exception;
use App\Models\Curso;

class CursoController extends Controller

{
    protected $cursoService;

    public function __construct(CursoService $cursoService)
    {
        $this->cursoService = $cursoService;
    }

    // Listado paginado de cursos (vista pública)
    public function index(Request $request)
    {
        $user = Auth::user();

        // Autorizar solo si está autenticado
        if ($user) {
            $this->authorize('viewAny', Curso::class);
        }

        $filters = $request->all();
        $perPage = $request->get('per_page', 15);

        // Solo mostrar cursos publicados para usuarios no autenticados o estudiantes
    if (!$user || (isset($user->rol) && strtolower($user->rol->nombre_rol) === 'estudiante')) {
        $filters['estado'] = 'Publicado';
    }

        $cursos = $this->cursoService->listarCursos($filters, $perPage);
        $cursos->getCollection()->load('rutas');
        return response()->json([
            'data' => \App\Http\Resources\CursoResource::collection($cursos->getCollection()),
            'current_page' => $cursos->currentPage(),
            'last_page' => $cursos->lastPage(),
            'per_page' => $cursos->perPage(),
            'total' => $cursos->total(),
        ]);
    }

    // Listado de cursos del docente autenticado (panel docente)
    public function misCursos(Request $request)
    {
        $user = Auth::user();

        // Solo docentes y admin pueden acceder
        if (!$user || !$user->rol || !in_array(strtolower($user->rol->nombre_rol), ['administrador', 'docente'])) {
            return response()->json(['message' => 'No autorizado'], 403);
        }

        $filters = $request->all();
        $perPage = $request->get('per_page', 15);

        // Filtrar solo los cursos del docente
        if ($user->rol && strtolower($user->rol->nombre_rol) === 'docente') {
            $filters['id_docente'] = $user->id_usuario;
        }

        $cursos = $this->cursoService->listarCursos($filters, $perPage);
        $cursos->getCollection()->load('rutas');
        return response()->json([
            'data' => \App\Http\Resources\CursoResource::collection($cursos->getCollection()),
            'current_page' => $cursos->currentPage(),
            'last_page' => $cursos->lastPage(),
            'per_page' => $cursos->perPage(),
            'total' => $cursos->total(),
        ]);
    }

    // Listado de cursos destacados
    public function destacados()
    {
        $cursos = $this->cursoService->cursoDestacados();
        $cursos->load('rutas');
        return response()->json([
            'data' => \App\Http\Resources\CursoResource::collection($cursos),
        ]);
    }

    // Buscar cursos por nombre
    public function buscar(BuscarCursoRequest $request)
    {
        $validated = $request->validated();
        $query = $validated['q'] ?? '';
        $perPage = $validated['per_page'] ?? 15;
        $result = $this->cursoService->buscarCursos($query, $perPage);
        return response()->json([
            'data' => $result->items(),
            'current_page' => $result->currentPage(),
            'last_page' => $result->lastPage(),
            'per_page' => $result->perPage(),
            'total' => $result->total(),
        ]);
    }

    // Detalle de un curso específico
    public function show($id)
    {
        $curso = $this->cursoService->detalleCurso($id);

        // Autorizar solo si está autenticado
        $user = Auth::user();
        if ($user) {
            $this->authorize('view', $curso);
        }

        $data = [
            'id_curso' => $curso->id_curso,
            'nombre' => $curso->nombre,
            'descripcion' => $curso->descripcion,
            'descripcion_corta' => $curso->descripcion_corta,
            'descripcion_larga' => $curso->descripcion_larga,
            'imagen' => $curso->imagen,
            'video_previsualizacion' => $curso->video_previsualizacion,
            'lo_que_aprenderas' => $curso->lo_que_aprenderas,
            'requisitos' => $curso->requisitos,
            'duracion' => $curso->duracion,
            'tiempo' => $curso->tiempo,
            'precio' => $curso->precio,
            'nivel' => $curso->nivel,
            'estado' => $curso->estado,
            'destacado' => $curso->destacado,
            'docente' => $curso->docente ? [
                'id_docente' => $curso->docente->id_usuario,
                'nombre' => $curso->docente->nombre,
                'imagen' => $curso->docente->imagen_perfil,
            ] : null,
            'fecha_creacion' => $curso->fecha_creacion,
            'fecha_actualizacion' => $curso->fecha_actualizacion,
            'modulos' => $curso->modulos->map(function ($modulo) {
                return [
                    'id_modulo' => $modulo->id_modulo,
                    'titulo' => $modulo->titulo,
                    'descripcion' => $modulo->descripcion,
                    'orden' => $modulo->orden,
                    'lecciones' => $modulo->lecciones->map(function ($leccion) {
                        return [
                            'id_leccion' => $leccion->id_leccion,
                            'titulo' => $leccion->titulo,
                            'tipo' => $leccion->tipo,
                            'duracion' => $leccion->duracion,
                        ];
                    }),
                ];
            }),
            'evaluaciones_count' => $curso->evaluaciones_count,
            'resenas_count' => $curso->resenas_count,
            'promedio_resena' => $curso->resenas_avg_calificacion,
        ];
        return response()->json($data);
    }

    // Mostrar contenido de curso (requiere inscripción y pago)
    public function contenido($id)
    {
        $user = Auth::user();
        $curso = \App\Models\Curso::with(['modulos.lecciones'])->findOrFail($id);

        $inscrito = \App\Models\Inscripcion::where('id_usuario', $user->id_usuario)
            ->where('id_curso', $curso->id_curso)
            ->where('estado', 'Activo')
            ->exists();

        $pagoCompletado = \App\Models\DetallePago::whereHas('pago', function ($q) use ($user) {
            $q->where('id_usuario', $user->id_usuario)
                ->where('estado', 'Completado');
        })->where('id_curso', $curso->id_curso)->exists();

        if (!$inscrito || !$pagoCompletado) {
            return response()->json([
                'mensaje' => 'Acceso denegado: debes estar inscrito y tener el pago completado para ver el contenido.',
                'status' => 'error'
            ], 403);
        }

        $leccionesCompletadas = \App\Models\ProgresoEstudiante::whereHas('inscripcion', function ($q) use ($user, $curso) {
            $q->where('id_usuario', $user->id_usuario)
                ->where('id_curso', $curso->id_curso);
        })->where('estado', 'Completado')->pluck('id_leccion')->toArray();

        $estructura = [];
        foreach ($curso->modulos as $modulo) {
            $moduloData = [
                'id' => $modulo->id_modulo,
                'titulo' => $modulo->titulo,
                'lecciones' => []
            ];
            foreach ($modulo->lecciones as $leccion) {
                $moduloData['lecciones'][] = [
                    'id' => $leccion->id_leccion,
                    'titulo' => $leccion->titulo,
                    'completada' => in_array($leccion->id_leccion, $leccionesCompletadas)
                ];
            }
            $estructura[] = $moduloData;
        }

        return response()->json([
            'curso' => [
                'id' => $curso->id_curso,
                'nombre' => $curso->nombre,
                'descripcion' => $curso->descripcion
            ],
            'estructura' => $estructura,
            'status' => 'success'
        ]);
    }
    // Crear nuevo curso
    public function store(Request $request)
    {
        $this->authorize('create', \App\Models\Curso::class);
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
        $curso = Curso::find($id);
        Log::info('Llamando a authorize en update para curso: ' . $id);
        $this->authorize('update', $curso);
        try {
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
        $curso = Curso::find($id);
        $this->authorize('update', $curso);
        try {
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
    // Progreso completo del curso para el usuario autenticado
    public function progreso($id)
    {
        $user = Auth::user();
        $curso = \App\Models\Curso::with(['modulos.lecciones'])->findOrFail($id);

        $inscripcion = \App\Models\Inscripcion::where('id_usuario', $user->id_usuario)
            ->where('id_curso', $curso->id_curso)
            ->whereIn('estado', ['Activo', 'Completado'])
            ->first();
        $pagoCompletado = \App\Models\DetallePago::whereHas('pago', function ($q) use ($user) {
            $q->where('id_usuario', $user->id_usuario)
                ->where('estado', 'Completado');
        })->where('id_curso', $curso->id_curso)->exists();

        if (!$inscripcion || !$pagoCompletado) {
            return response()->json(['mensaje' => 'Acceso denegado', 'status' => 'error'], 403);
        }

        $totalLecciones = 0;
        $leccionesCompletadas = 0;
        $tiempoTotal = 0;
        $tiempoRestante = 0;
        $modulos = [];
        $disponibleMarcado = false;
        foreach ($curso->modulos->sortBy('orden') as $modulo) {
            // Filtrar solo módulos publicados
            if (isset($modulo->estado) && $modulo->estado !== 'Publicado') continue;
            $moduloData = [
                'id' => $modulo->id_modulo,
                'titulo' => $modulo->titulo,
                'lecciones' => []
            ];
            $leccionesOrdenadas = $modulo->lecciones->sortBy('orden');
            foreach ($leccionesOrdenadas as $leccion) {
                // Filtrar solo lecciones publicadas
                if (isset($leccion->estado) && $leccion->estado !== 'Publicado') continue;
                $totalLecciones++;
                $tiempoTotal += $leccion->duracion ?? 0;
                $progreso = \App\Models\ProgresoEstudiante::where('id_inscripcion', $inscripcion->id_inscripcion)
                    ->where('id_leccion', $leccion->id_leccion)
                    ->first();
                $estado = 'bloqueada';
                // Sincronización profesional:
                if ($progreso) {
                    if ($progreso->estado === 'Completado') {
                        $leccionesCompletadas++;
                        $estado = 'completada';
                    } elseif ($progreso->estado === 'En progreso' || $progreso->estado === 'No iniciado') {
                        if (!$disponibleMarcado) {
                            $estado = 'disponible';
                            $disponibleMarcado = true;
                        } else {
                            $estado = 'bloqueada';
                        }
                    }
                } else if (!$disponibleMarcado) {
                    $estado = 'disponible';
                    $disponibleMarcado = true;
                }
                if ($estado !== 'completada') {
                    $tiempoRestante += $leccion->duracion ?? 0;
                }
                $moduloData['lecciones'][] = [
                    'id' => $leccion->id_leccion,
                    'titulo' => $leccion->titulo,
                    'duracion' => $leccion->duracion,
                    'estado' => $estado
                ];
            }
            $modulos[] = $moduloData;
        }
        
        // Calcular progreso total considerando lecciones en progreso
        $leccionesEnProgreso = \App\Models\ProgresoEstudiante::where('id_inscripcion', $inscripcion->id_inscripcion)
            ->where('estado', 'En progreso')
            ->get();
        
        $sumaProgresosParciales = 0;
        foreach ($leccionesEnProgreso as $prog) {
            $sumaProgresosParciales += $prog->porcentaje_completado;
        }
        
        $porcentaje = $totalLecciones > 0
            ? round((($leccionesCompletadas + ($sumaProgresosParciales / 100)) / $totalLecciones) * 100, 2)
            : 0;
        
        // Examen desbloqueado solo cuando TODAS las lecciones están completadas al 100%
        $examenDesbloqueado = ($leccionesCompletadas == $totalLecciones && $totalLecciones > 0);
        
        // Actualizar progreso_total en la base de datos
        $inscripcion->progreso_total = $porcentaje;
        if ($examenDesbloqueado && $inscripcion->estado !== 'Completado') {
            $inscripcion->estado = 'Completado';
            $inscripcion->fecha_completado = now();
        }
        $inscripcion->save();

        return response()->json([
            'curso' => [
                'id' => $curso->id_curso,
                'nombre' => $curso->nombre,
                'descripcion' => $curso->descripcion,
                'progreso_total' => $porcentaje,
                'lecciones_completadas' => $leccionesCompletadas,
                'total_lecciones' => $totalLecciones,
                'tiempo_total' => $tiempoTotal,
                'tiempo_restante' => $tiempoRestante,
                'id_inscripcion' => $inscripcion ? $inscripcion->id_inscripcion : null
            ],
            'modulos' => $modulos,
            'examen_desbloqueado' => $examenDesbloqueado,
            'status' => 'success'
        ]);
    }
}
