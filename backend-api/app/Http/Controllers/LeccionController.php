<?php

namespace App\Http\Controllers;

use App\Models\Leccion;
use App\Models\Modulo;
use App\Models\ComentarioLeccion;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Storage;
use Illuminate\Validation\ValidationException;
use Exception;

class LeccionController extends Controller
{
    // Editar comentario de lección (solo el autor)
    public function editarComentario(Request $request, $id)
    {
        $comentario = ComentarioLeccion::find($id);
        if (!$comentario) {
            return response()->json([
                'mensaje' => 'Comentario no encontrado.',
                'status' => 'error'
            ], 404);
        }
        if ($comentario->id_usuario !== Auth::id()) {
            return response()->json([
                'mensaje' => 'No tienes permiso para editar este comentario.',
                'status' => 'error'
            ], 403);
        }
        $validated = $request->validate([
            'comentario' => 'required|string|max:500'
        ]);
        $comentario->comentario = $validated['comentario'];
        $comentario->fecha_comentario = now();
        $comentario->save();
        return response()->json([
            'mensaje' => 'Comentario actualizado',
            'comentario' => $comentario,
            'status' => 'success'
        ], 200);
    }
    // Listar todas las lecciones (paginado, filtro por estado)
    public function index(Request $request)
    {
        try {
            // Usar policy para verificar acceso a listado
            $this->authorize('viewAny', Leccion::class);
            
            $user = Auth::user();
            $query = Leccion::with(['modulo.curso']);
            
            // Filtros básicos
            if ($request->filled('estado')) {
                $query->where('estado', $request->estado);
            }
            if ($request->filled('tipo')) {
                $query->where('tipo', $request->tipo);
            }
            
            // Filtrado diferenciado por rol
            if ($user && $user->rol) {
                $rol = strtolower($user->rol->nombre_rol);
                if ($rol === 'docente') {
                    // Docente: solo lecciones de sus cursos
                    $query->whereHas('modulo.curso', function ($q) use ($user) {
                        $q->where('id_docente', $user->id_usuario);
                    });
                } elseif ($rol === 'estudiante') {
                    // Estudiante: solo lecciones publicadas de cursos con inscripción activa
                    $query->where('estado', 'Publicado')
                          ->whereHas('modulo.curso', function ($q) use ($user) {
                        $q->whereHas('inscripciones', function ($inscQ) use ($user) {
                            $inscQ->where('id_usuario', $user->id_usuario)
                                  ->where('estado', 'Activo');
                        });
                    });
                } else {
                    // Otros roles autenticados (admin, etc): solo lecciones publicadas
                    $query->where('estado', 'Publicado');
                }
            } else {
                // Usuario no autenticado: solo lecciones publicadas
                $query->where('estado', 'Publicado');
            }
            
            $lecciones = $query->orderBy('orden')->paginate(10);
            
            return response()->json([
                'lecciones' => $lecciones,
                'status' => 'success'
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'mensaje' => 'Error interno',
                'error' => $e->getMessage(),
                'status' => 'error'
            ], 500);
        }
    }

    // Ver detalle de una lección
    public function show($id)
    {
        $leccion = Leccion::with(['modulo.curso'])->find($id);
        if (!$leccion) {
            return response()->json([
                'mensaje' => 'Lección no encontrada',
                'status' => 'error'
            ], 404);
        }

        // Usar policy para validar acceso (maneja todos los roles y validaciones)
        $this->authorize('view', $leccion);

        // Si llegamos aquí, el usuario tiene acceso según la policy
        return response()->json([
            'leccion' => $leccion,
            'status' => 'success'
        ]);
    }

    // Listar lecciones de un módulo
    public function porModulo($id_modulo)
    {
        $modulo = Modulo::find($id_modulo);
        if (!$modulo) {
            return response()->json([
                'mensaje' => 'Módulo no encontrado',
                'status' => 'error'
            ], 404);
        }
        // Solo mostrar lecciones publicadas
        $lecciones = $modulo->lecciones()->where('estado', 'Publicado')->orderBy('orden')->get();
        return response()->json([
            'modulo' => $modulo->titulo,
            'lecciones' => $lecciones,
            'status' => 'success'
        ]);
    }

    // Descargar materiales asociados a la lección
    public function materiales($id)
    {
        $leccion = Leccion::find($id);
        if (!$leccion) {
            return response()->json([
                'mensaje' => 'Lección no encontrada',
                'status' => 'error'
            ], 404);
        }
        // Validar inscripción y pago
        $modulo = $leccion->modulo;
        $curso = $modulo ? $modulo->curso : null;
        $inscrito = false;
        $pagoCompletado = false;
        if (Auth::check() && $curso) {
            $inscrito = \App\Models\Inscripcion::where('id_usuario', Auth::id())
                ->where('id_curso', $curso->id_curso)
                ->where('estado', 'Activo')
                ->exists();
            $pagoCompletado = \App\Models\Pago::where('id_usuario', Auth::id())
                ->where('estado', 'Completado')
                ->exists();
        }
        if (!$inscrito || !$pagoCompletado) {
            return response()->json([
                'mensaje' => 'Acceso denegado: debes estar inscrito y tener el pago completado para descargar materiales.',
                'status' => 'error'
            ], 403);
        }
        if (!$leccion->contenido) {
            return response()->json([
                'mensaje' => 'No hay materiales disponibles',
                'status' => 'error'
            ], 404);
        }
        return response()->download(storage_path('app/' . $leccion->contenido));
    }

    // Ver comentarios de la lección
    public function comentarios($id)
    {
        $leccion = Leccion::find($id);
        if (!$leccion) {
            return response()->json([
                'mensaje' => 'Lección no encontrada',
                'status' => 'error'
            ], 404);
        }
        
        // Validar acceso usando política
        $this->authorize('view', $leccion);
        
        $comentarios = ComentarioLeccion::where('id_leccion', $id)->orderByDesc('fecha_comentario')->get();
        return response()->json([
            'comentarios' => $comentarios,
            'status' => 'success'
        ]);
    }

    // Agregar comentario (solo usuario autenticado)
    public function agregarComentario(Request $request, $id)
    {
        $leccion = Leccion::find($id);
        if (!$leccion) {
            return response()->json([
                'mensaje' => 'Lección no encontrada',
                'status' => 'error'
            ], 404);
        }
        
        // Validar acceso usando política
            // Restringir creación de comentarios para admin
            if (in_array(auth()->user()->id_rol, [1, 3])) {
                return response()->json(['message' => 'El admin y el docente no pueden agregar comentarios'], 403);
            }
        $this->authorize('view', $leccion);
        
        $validated = $request->validate([
            'comentario' => 'required|string|max:500'
        ]);
        try {
            $comentario = ComentarioLeccion::create([
                'id_leccion' => $id,
                'id_usuario' => Auth::id(),
                'comentario' => $validated['comentario'],
                'fecha_comentario' => now()
            ]);
            return response()->json([
                'mensaje' => 'Comentario agregado',
                'comentario' => $comentario,
                'status' => 'success'
            ], 201);
        } catch (ValidationException $e) {
            return response()->json([
                'mensaje' => 'Error de validación',
                'errores' => $e->errors(),
                'status' => 'error'
            ], 422);
        } catch (Exception $e) {
            Log::error('Error al agregar comentario: ' . $e->getMessage());
            return response()->json([
                'mensaje' => 'Error interno al agregar comentario',
                'status' => 'error'
            ], 500);
        }
    }
    public function completar(Request $request, $id)
    {
        $leccion = \App\Models\Leccion::with('modulo')->findOrFail($id);
        
        // Validar acceso usando política
        $this->authorize('view', $leccion);
        
        $user = Auth::user();
        $inscripcion = \App\Models\Inscripcion::where('id_usuario', $user->id_usuario)
            ->where('id_curso', $leccion->modulo->curso->id_curso)
            ->where('estado', 'Activo')
            ->first();

        if (!$inscripcion) {
            return response()->json([
                'mensaje' => 'No tienes inscripción activa en este curso.',
                'status' => 'error'
            ], 403);
        }

        $porcentaje = $request->input('porcentaje_completado', 0);
        if ($porcentaje < 0 || $porcentaje > 100) {
            return response()->json([
                'mensaje' => 'Porcentaje inválido.',
                'status' => 'error'
            ], 422);
        }

        $estado = $porcentaje >= 95 ? 'Completado' : 'En progreso';

        $progreso = \App\Models\ProgresoEstudiante::updateOrCreate(
            [
                'id_inscripcion' => $inscripcion->id_inscripcion,
                'id_leccion' => $leccion->id_leccion
            ],
            [
                'estado' => $estado,
                'porcentaje_completado' => $porcentaje,
                'fecha_completado' => $estado === 'Completado' ? now() : null,
                'ultima_actividad' => now(),
                'ip_address' => $request->ip(),
                'user_agent' => $request->header('User-Agent')
            ]
        );

        // Si se completó, actualiza progreso total
        if ($estado === 'Completado') {
            $curso = $leccion->modulo->curso;
            $totalLecciones = \App\Models\Leccion::whereHas('modulo', function ($q) use ($curso) {
                $q->where('id_curso', $curso->id_curso);
            })->count();

            $completadas = \App\Models\ProgresoEstudiante::where('id_inscripcion', $inscripcion->id_inscripcion)
                ->where('estado', 'Completado')->count();

            $progresoTotal = $totalLecciones > 0 ? round(($completadas / $totalLecciones) * 100) : 0;
            $inscripcion->progreso_total = $progresoTotal;
            if ($progresoTotal == 100) {
                $inscripcion->fecha_completado = now();
                $inscripcion->estado = 'Completado';
            }
            $inscripcion->save();
        }

        return response()->json([
            'mensaje' => $estado === 'Completado' ? 'Lección marcada como completada' : 'Progreso guardado',
            'porcentaje_completado' => $porcentaje,
            'status' => 'success'
        ]);
    }
    public function navegacion($id)
    {
        $leccion = \App\Models\Leccion::with('modulo')->findOrFail($id);
        $modulo = $leccion->modulo;
        if (!$modulo) {
            return response()->json(['mensaje' => 'Módulo no encontrado', 'status' => 'error'], 404);
        }

        $lecciones = $modulo->lecciones()->orderBy('orden')->get();
        $index = $lecciones->search(function ($l) use ($leccion) {
            return $l->id_leccion == $leccion->id_leccion;
        });

        $anterior = $index > 0 ? $lecciones[$index - 1] : null;
        $siguiente = $index < $lecciones->count() - 1 ? $lecciones[$index + 1] : null;

        return response()->json([
            'anterior' => $anterior,
            'siguiente' => $siguiente,
            'status' => 'success'
        ]);
    }

    // Crear nueva lección
    public function store(\App\Http\Requests\Admin\StoreLeccionRequest $request)
    {
        $this->authorize('create', Leccion::class);
        $user = Auth::user();
        $data = $request->validated();

        // Validar que el docente solo cree lecciones en sus cursos
        if ($user->rol && strtolower($user->rol->nombre_rol) === 'docente') {
            $modulo = \App\Models\Modulo::with('curso')->find($data['id_modulo']);
            if (!$modulo || !$modulo->curso || $modulo->curso->id_docente !== $user->id_usuario) {
                return response()->json([
                    'mensaje' => 'No tienes permiso para crear lecciones en este módulo. Solo puedes crear en tus propios cursos.',
                    'status' => 'error'
                ], 403);
            }
        }

        $data['creado_por'] = $user->id ?? null;
        $leccion = Leccion::create($data);
        return response()->json([
            'mensaje' => 'Lección creada',
            'leccion' => $leccion,
            'status' => 'success'
        ], 201);
    }

    // Actualizar lección
    public function update(\App\Http\Requests\Admin\UpdateLeccionRequest $request, $id)
    {
        $leccion = Leccion::find($id);
        if (!$leccion) {
            return response()->json([
                'mensaje' => 'Lección no encontrada',
                'status' => 'error'
            ], 404);
        }
        $this->authorize('update', $leccion);
        $user = Auth::user();
        $data = $request->validated();
        // Validar que el docente solo edite lecciones de sus propios cursos
        if ($user->rol && strtolower($user->rol->nombre_rol) === 'docente') {
            $modulo = $leccion->modulo()->with('curso')->first();
            if (!$modulo || !$modulo->curso || $modulo->curso->id_docente !== $user->id_usuario) {
                return response()->json([
                    'mensaje' => 'No tienes permiso para editar esta lección. Solo puedes editar lecciones de tus propios cursos.',
                    'status' => 'error'
                ], 403);
            }
        }
        $data['actualizado_por'] = $user->id ?? null;
        $leccion->update($data);
        return response()->json([
            'mensaje' => 'Lección actualizada',
            'leccion' => $leccion,
            'status' => 'success'
        ]);
    }

    // Eliminar lección
    public function destroy($id)
    {
        $leccion = Leccion::find($id);
        if (!$leccion) {
            return response()->json([
                'mensaje' => 'Lección no encontrada',
                'status' => 'error'
            ], 404);
        }
        $this->authorize('delete', $leccion);
        $tieneMateriales = method_exists($leccion, 'materiales') ? $leccion->materiales()->exists() : false;
        $tieneComentarios = method_exists($leccion, 'comentarios') ? $leccion->comentarios()->exists() : false;
        if ($tieneMateriales || $tieneComentarios) {
            return response()->json([
                'mensaje' => 'No se puede eliminar la lección porque tiene materiales o comentarios asociados',
                'status' => 'error'
            ], 409);
        }
        $leccion->delete();
        return response()->json([
            'mensaje' => 'Lección eliminada',
            'status' => 'success'
        ]);
    }

    // Actualizar solo el estado de una lección
    public function updateEstado(Request $request, $id)
    {
        $leccion = Leccion::findOrFail($id);
        $this->authorize('update', $leccion);
        $leccion->estado = $request->input('estado');
        $leccion->save();
        return response()->json([
            'message' => 'Estado de lección actualizado correctamente.',
            'data' => $leccion
        ]);
    }
}

