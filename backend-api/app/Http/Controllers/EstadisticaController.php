<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Usuario;
use App\Models\DetallePago;
use App\Models\Pago;
use App\Models\Curso;
use App\Models\RutaAcademica;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;

class EstadisticaController extends Controller
{
    /**
     * Cantidad total de estudiantes (usuarios con rol estudiante y activos)
     */
    public function cantidadEstudiantes()
    {
        try {
            $totalEstudiantes = Usuario::whereHas('rol', function ($query) {
                $query->where('nombre_rol', 'estudiante');
            })
            ->where('estado', 'Activo')
            ->count();

            return response()->json([
                'total_estudiantes' => $totalEstudiantes,
                'status' => 'success'
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Error al obtener cantidad de estudiantes',
                'error' => $e->getMessage(),
                'status' => 'error'
            ], 500);
        }
    }

    /**
     * Estudiantes por línea académica (basado en cursos comprados)
     */
    public function estudiantesPorLineaAcademica()
    {
        try {
            // Obtener todos los cursos comprados (pagos completados)
            $cursosComprados = DetallePago::whereHas('pago', function ($query) {
                $query->where('estado', 'Completado');
            })
            ->with(['curso.rutas.lineaAcademica'])
            ->get();

            // Agrupar estudiantes por línea académica
            $estudiantesPorLinea = [];
            
            foreach ($cursosComprados as $detalle) {
                $curso = $detalle->curso;
                if ($curso && $curso->rutas) {
                    foreach ($curso->rutas as $ruta) {
                        if ($ruta->lineaAcademica) {
                            $lineaNombre = $ruta->lineaAcademica->nombre;
                            $idLinea = $ruta->lineaAcademica->id_linea_academica;
                            
                            if (!isset($estudiantesPorLinea[$idLinea])) {
                                $estudiantesPorLinea[$idLinea] = [
                                    'id_linea_academica' => $idLinea,
                                    'nombre_linea' => $lineaNombre,
                                    'total_estudiantes' => 0,
                                    'estudiantes' => []
                                ];
                            }
                            
                            $idUsuario = $detalle->pago->id_usuario;
                            if (!in_array($idUsuario, $estudiantesPorLinea[$idLinea]['estudiantes'])) {
                                $estudiantesPorLinea[$idLinea]['estudiantes'][] = $idUsuario;
                                $estudiantesPorLinea[$idLinea]['total_estudiantes']++;
                            }
                        }
                    }
                }
            }

            // Eliminar array de estudiantes para respuesta limpia
            foreach ($estudiantesPorLinea as &$linea) {
                unset($linea['estudiantes']);
            }

            return response()->json([
                'lineas_academicas' => array_values($estudiantesPorLinea),
                'status' => 'success'
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Error al obtener estudiantes por línea académica',
                'error' => $e->getMessage(),
                'status' => 'error'
            ], 500);
        }
    }

    /**
     * Cursos más vendidos del mes actual
     */
    public function cursosMasVendidosMes()
    {
        try {
            Carbon::setLocale('es');
            $mesActual = Carbon::now()->month;
            $anioActual = Carbon::now()->year;

            // Obtener cursos con más ventas en el mes actual
            $cursosVendidos = DetallePago::whereHas('pago', function ($query) use ($mesActual, $anioActual) {
                $query->where('estado', 'Completado')
                    ->whereMonth('fecha_pago', $mesActual)
                    ->whereYear('fecha_pago', $anioActual);
            })
            ->select('id_curso', DB::raw('COUNT(*) as total_ventas'))
            ->groupBy('id_curso')
            ->orderByDesc('total_ventas')
            ->limit(10)
            ->with('curso:id_curso,nombre,imagen,precio')
            ->get();

            $resultado = $cursosVendidos->map(function ($detalle) {
                return [
                    'id_curso' => $detalle->id_curso,
                    'nombre_curso' => $detalle->curso->nombre ?? 'Sin nombre',
                    'imagen' => $detalle->curso->imagen ?? null,
                    'precio' => $detalle->curso->precio ?? 0,
                    'total_ventas' => $detalle->total_ventas
                ];
            });

            return response()->json([
                'mes' => Carbon::now()->translatedFormat('F Y'),
                'cursos_mas_vendidos' => $resultado,
                'status' => 'success'
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Error al obtener cursos más vendidos',
                'error' => $e->getMessage(),
                'status' => 'error'
            ], 500);
        }
    }

    /**
     * Retención mensual de usuarios en porcentaje
     * (Usuarios que realizaron alguna actividad en el mes actual vs mes anterior)
     */
    public function retencionMensualUsuarios()
    {
        try {
            Carbon::setLocale('es');
            $mesActual = Carbon::now()->month;
            $anioActual = Carbon::now()->year;
            $mesAnterior = Carbon::now()->subMonth()->month;
            $anioAnterior = Carbon::now()->subMonth()->year;

            // Usuarios activos mes anterior (registrados antes del inicio del mes actual)
            $usuariosMesAnterior = Usuario::where('estado', 'Activo')
                ->whereHas('rol', function ($query) {
                    $query->where('nombre_rol', 'estudiante');
                })
                ->where('fecha_registro', '<', Carbon::now()->startOfMonth())
                ->count();

            // De esos usuarios del mes anterior, cuántos tuvieron actividad este mes
            $usuariosRetenidos = Usuario::where('estado', 'Activo')
                ->whereHas('rol', function ($query) {
                    $query->where('nombre_rol', 'estudiante');
                })
                ->where('fecha_registro', '<', Carbon::now()->startOfMonth())
                ->where(function ($query) use ($mesActual, $anioActual) {
                    // Pagos este mes
                    $query->whereHas('pagos', function ($q) use ($mesActual, $anioActual) {
                        $q->whereMonth('fecha_pago', $mesActual)
                          ->whereYear('fecha_pago', $anioActual);
                    })
                    // O inscripciones este mes
                    ->orWhereHas('inscripciones', function ($q) use ($mesActual, $anioActual) {
                        $q->whereMonth('fecha_inscripcion', $mesActual)
                          ->whereYear('fecha_inscripcion', $anioActual);
                    });
                })
                ->count();

            $porcentajeRetencion = $usuariosMesAnterior > 0 
                ? number_format(($usuariosRetenidos / $usuariosMesAnterior) * 100, 2, '.', '') 
                : 0;

            return response()->json([
                'mes_actual' => Carbon::now()->translatedFormat('F Y'),
                'usuarios_mes_anterior' => $usuariosMesAnterior,
                'usuarios_retenidos_este_mes' => $usuariosRetenidos,
                'porcentaje_retencion' => $porcentajeRetencion,
                'status' => 'success'
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Error al calcular retención mensual',
                'error' => $e->getMessage(),
                'status' => 'error'
            ], 500);
        }
    }
}
