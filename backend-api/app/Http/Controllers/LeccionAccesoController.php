<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Leccion;
use App\Models\Inscripcion;
use App\Models\ProgresoEstudiante;
use Illuminate\Support\Facades\Auth;

class LeccionAccesoController extends Controller
{
    public function acceso(Request $request, $id_leccion)
    {
        $usuario = $request->user();
        $leccion = Leccion::with('modulo.curso')->findOrFail($id_leccion);
        $curso = $leccion->modulo->curso;

        // Validar inscripción activa o completada antes de cualquier acceso
        $inscripcion = \App\Models\Inscripcion::where('id_usuario', $usuario->id_usuario)
            ->where('id_curso', $curso->id_curso)
            ->whereIn('estado', ['Activo', 'Completado'])
            ->first();

        if (!$inscripcion) {
            return response()->json([
                'puede_acceder' => false,
                'razon' => 'No estás inscrito en este curso'
            ]);
        }

        // Obtener módulos publicados y ordenados
        $modulosPublicados = $curso->modulos()->where('estado', 'Publicado')->orderBy('orden')->get();
        $lecciones = collect();
        foreach ($modulosPublicados as $modulo) {
            $leccionesModulo = $modulo->lecciones()->where('estado', 'Publicado')->orderBy('orden')->get();
            $lecciones = $lecciones->concat($leccionesModulo);
        }
        $posicion = $lecciones->search(function ($item) use ($leccion) {
            return $item->id_leccion == $leccion->id_leccion;
        });

        // Si es la primera lección
        if ($posicion === 0) {
            // Crear progreso inicial si no existe
            $progreso = \App\Models\ProgresoEstudiante::where('id_inscripcion', $inscripcion->id_inscripcion)
                ->where('id_leccion', $leccion->id_leccion)
                ->first();
            if (!$progreso) {
                $progreso = \App\Models\ProgresoEstudiante::create([
                    'id_inscripcion' => $inscripcion->id_inscripcion,
                    'id_leccion' => $leccion->id_leccion,
                    'estado' => 'No iniciado',
                    'duracion_video' => $leccion->duracion,
                    'tiempo_visualizacion' => 0,
                    'porcentaje_completado' => 0,
                    'ultimo_segundo_visto' => 0,
                    'segmentos_vistos' => ['segments' => []],
                    'primera_visualizacion' => null
                ]);
            }
            return response()->json([
                'puede_acceder' => true,
                'razon' => 'Primera lección del curso',
                'progreso' => $progreso
            ]);
        }

        // Solo verificar lección anterior si existe
        if ($posicion > 0) {
            $leccionAnterior = $lecciones[$posicion - 1];
            $progresoAnterior = \App\Models\ProgresoEstudiante::where('id_inscripcion', $inscripcion->id_inscripcion)
                ->where('id_leccion', $leccionAnterior->id_leccion)
                ->first();

            if (!$progresoAnterior || $progresoAnterior->estado != 'Completado') {
                return response()->json([
                    'puede_acceder' => false,
                    'razon' => 'Debes completar la lección anterior primero',
                    'leccion_requerida' => [
                        'id' => $leccionAnterior->id_leccion,
                        'titulo' => $leccionAnterior->titulo,
                        'progreso' => $progresoAnterior ? $progresoAnterior->porcentaje_completado : 0
                    ]
                ]);
            }
        }

        // Crear progreso inicial si no existe para lección actual
        $progreso = \App\Models\ProgresoEstudiante::where('id_inscripcion', $inscripcion->id_inscripcion)
            ->where('id_leccion', $leccion->id_leccion)
            ->first();
        if (!$progreso) {
            $progreso = \App\Models\ProgresoEstudiante::create([
                'id_inscripcion' => $inscripcion->id_inscripcion,
                'id_leccion' => $leccion->id_leccion,
                'estado' => 'No iniciado',
                'duracion_video' => $leccion->duracion,
                'tiempo_visualizacion' => 0,
                'porcentaje_completado' => 0,
                'ultimo_segundo_visto' => 0,
                'segmentos_vistos' => ['segments' => []],
                'primera_visualizacion' => null
            ]);
        }
        // Todo OK
        return response()->json([
            'puede_acceder' => true,
            'razon' => 'Lección anterior completada',
            'progreso' => $progreso
        ]);
    }
}
