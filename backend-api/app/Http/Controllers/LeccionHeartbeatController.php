<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\ProgresoEstudiante;
use App\Constants\TrackingVideo;
use Carbon\Carbon;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class LeccionHeartbeatController extends Controller
{
    public function procesar(\App\Http\Requests\LeccionHeartbeatRequest $request)
    {
        $progreso = ProgresoEstudiante::with('inscripcion.curso')->find($request->id_progreso);
        if (!$progreso) {
            return response()->json(['success' => false, 'error' => 'Progreso no encontrado'], 404);
        }
        $usuario = $request->user();
        if ($progreso->inscripcion->id_usuario !== $usuario->id_usuario) {
            return response()->json(['success' => false, 'error' => 'No autorizado'], 403);
        }

        $currentTime = $request->current_time;
        $previousTime = $request->previous_time;

        // Validaciones básicas
        if ($currentTime > $progreso->duracion_video) {
            return response()->json(['success' => false, 'error' => 'Tiempo excede duración del video'], 422);
        }
        if ($currentTime < 0 || $previousTime < 0) {
            return response()->json(['success' => false, 'error' => 'Tiempos negativos no permitidos'], 422);
        }

        $diferencia = $currentTime - $previousTime;

        // Detectar tipo de acción
        if ($diferencia < 0) {
            return $this->procesarRetroceso($progreso, $currentTime);
        }
        if ($diferencia > TrackingVideo::ADELANTO_MAXIMO_NORMAL) {
            return $this->procesarAdelanto($progreso, $currentTime);
        }
        if ($diferencia >= TrackingVideo::HEARTBEAT_DIFERENCIA_MINIMA && $diferencia <= TrackingVideo::HEARTBEAT_DIFERENCIA_MAXIMA) {
            return $this->procesarReproduccionNormal($progreso, $currentTime, $previousTime);
        }

        // Ignorado
        return response()->json(['success' => true, 'accion' => 'ignorado']);
    }

    private function procesarRetroceso($progreso, $currentTime)
    {
        $progreso->ultimo_segundo_visto = $currentTime;
        $progreso->ultima_actividad = Carbon::now();
        $progreso->save();

        return response()->json([
            'success' => true,
            'accion' => 'retroceso',
            'mensaje' => 'Retroceso detectado, posición actualizada',
            'progreso' => $progreso,
            'leccion_completada' => false
        ]);
    }

    private function procesarAdelanto($progreso, $currentTime)
    {
        $progreso->ultimo_segundo_visto = $currentTime;
        $progreso->ultima_actividad = Carbon::now();
        $progreso->save();

        // Puedes agregar log aquí si lo deseas

        return response()->json([
            'success' => true,
            'accion' => 'adelanto',
            'mensaje' => 'Adelanto detectado, este segmento NO cuenta como visto',
            'progreso' => $progreso,
            'leccion_completada' => false
        ]);
    }

    private function procesarReproduccionNormal($progreso, $currentTime, $previousTime)
    {
        // Iniciar transacción
        DB::beginTransaction();
        try {
            if (is_null($progreso->primera_visualizacion)) {
                $progreso->primera_visualizacion = Carbon::now();
            }



            $segmentos = $progreso->segmentos_vistos['segments'] ?? [];
            $segmentos[] = [$previousTime, $currentTime];

            $segmentosFusionados = $this->fusionarSegmentos($segmentos);

            $segundosUnicos = 0;
            foreach ($segmentosFusionados as $seg) {
                $segundosUnicos += ($seg[1] - $seg[0]);
            }

            $porcentaje = $progreso->duracion_video > 0
                ? round(min(100, ($segundosUnicos / $progreso->duracion_video) * 100), 2)
                : 0;

            $estadoAnterior = $progreso->estado;
            $leccionCompletada = false;
            $datosAdicionales = [];

            if ($porcentaje >= TrackingVideo::UMBRAL_COMPLETACION && $estadoAnterior != 'Completado') {
                $progreso->estado = 'Completado';
                $progreso->fecha_completado = Carbon::now();
                $leccionCompletada = true;
            } elseif ($porcentaje > 0 && $estadoAnterior == 'No iniciado') {
                $progreso->estado = 'En progreso';
            }

            $progreso->segmentos_vistos = ['segments' => $segmentosFusionados];
            $progreso->tiempo_visualizacion = $segundosUnicos;
            $progreso->porcentaje_completado = $porcentaje;
            $progreso->ultimo_segundo_visto = $currentTime;
            $progreso->ultima_actividad = Carbon::now();
            $progreso->save();

            // Triggers de completación
            if ($leccionCompletada) {
                $datosAdicionales = $this->ejecutarTriggersCompletacion($progreso);
            }

            DB::commit();

            return response()->json([
                'success' => true,
                'accion' => 'reproduccion',
                'progreso' => [
                    'estado' => $progreso->estado,
                    'porcentaje' => $porcentaje,
                    'tiempo_visto' => $segundosUnicos,
                    'ultimo_segundo' => $currentTime,
                    'duracion_total' => $progreso->duracion_video,
                    'completada' => $leccionCompletada
                ],
                'leccion_completada' => $leccionCompletada,
                'detalles' => [
                    'segundos_unicos' => $segundosUnicos,
                    'total_segmentos' => count($segmentosFusionados)
                ],
                ...$datosAdicionales
            ]);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json(['success' => false, 'error' => $e->getMessage()], 500);
        }
    }

    private function ejecutarTriggersCompletacion($progreso)
    {
        $resultado = [];
        $inscripcion = $progreso->inscripcion;
        $curso = $inscripcion->curso;


        // Total de lecciones
        $totalLecciones = $curso->lecciones()->count();
        $leccionesCompletadas = $inscripcion->progresos()->where('estado', 'Completado')->count();
        $leccionesEnProgreso = $inscripcion->progresos()->where('estado', 'En progreso')->get();

        $sumaProgresosParciales = 0;
        foreach ($leccionesEnProgreso as $prog) {
            $sumaProgresosParciales += $prog->porcentaje_completado;
        }

        $progresoTotal = $totalLecciones > 0
            ? round((($leccionesCompletadas + ($sumaProgresosParciales / 100)) / $totalLecciones) * 100, 2)
            : 0;

        $inscripcion->progreso_total = $progresoTotal;
        $inscripcion->save();
        $resultado['progreso_curso'] = $progresoTotal;

        // Siguiente lección
        $leccionActual = $progreso->leccion;
        $siguienteLeccion = $this->obtenerLeccionSiguiente($leccionActual);
        if ($siguienteLeccion) {
            $resultado['siguiente_leccion'] = [
                'id_leccion' => $siguienteLeccion->id_leccion,
                'titulo' => $siguienteLeccion->titulo,
                'duracion' => $siguienteLeccion->duracion,
                'desbloqueada' => true
            ];
        } else {
            // Última lección
            if ($leccionesCompletadas == $totalLecciones) {
                $resultado['examen_desbloqueado'] = true;
                $resultado['todas_lecciones_completadas'] = true;
                $resultado['mensaje'] = '¡Felicidades! Has completado todas las lecciones. El examen está disponible.';
                // Actualizar inscripción como completada
                $inscripcion->estado = 'Completado';
                $inscripcion->fecha_completado = now();
                $inscripcion->save();
            }
        }

        // Notificación (opcional)
        // Notificacion::create([
        //     'usuario_id' => $inscripcion->id_usuario,
        //     'tipo' => 'Curso',
        //     'titulo' => 'Lección completada',
        //     'mensaje' => 'Has completado: ' . $leccionActual->titulo
        // ]);

        return $resultado;
    }

    private function obtenerLeccionSiguiente($leccion)
    {
        $curso = $leccion->curso;
        $lecciones = $curso->lecciones()->orderBy('id_modulo')->orderBy('orden')->get();
        $posicion = $lecciones->search(function ($item) use ($leccion) {
            return $item->id_leccion == $leccion->id_leccion;
        });
        if ($posicion !== false && $posicion < $lecciones->count() - 1) {
            return $lecciones[$posicion + 1];
        }
        return null;
    }

    private function fusionarSegmentos($segmentos)
    {
        if (empty($segmentos)) return [];

        usort($segmentos, function ($a, $b) {
            return $a[0] <=> $b[0];
        });

        $fusionados = [];
        $actual = $segmentos[0];

        for ($i = 1; $i < count($segmentos); $i++) {
            $siguiente = $segmentos[$i];
            if ($siguiente[0] <= $actual[1]) {
                $actual[1] = max($actual[1], $siguiente[1]);
            } else {
                $fusionados[] = $actual;
                $actual = $siguiente;
            }
        }
        $fusionados[] = $actual;
        return $fusionados;
    }
}