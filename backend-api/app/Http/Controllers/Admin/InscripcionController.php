<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Inscripcion;
use App\Models\InscripcionRuta;
use Illuminate\Support\Facades\Log;

class InscripcionController extends Controller
{
    public function index(Request $request)
    {
        $perPage = max(1, min((int)$request->input('per_page', 50), 500));
        $tipo = $request->input('tipo');

        // If route prefix indicates rutas, default tipo to 'ruta'
        $prefix = $request->route() ? $request->route()->getPrefix() : null;
        if (!$tipo && $prefix && str_contains($prefix, 'inscripciones-rutas')) {
            $tipo = 'ruta';
        }

        if ($tipo === 'ruta') {
            $query = InscripcionRuta::with(['usuario', 'rutaAcademica']);
            if ($request->filled('id_ruta')) {
                $query->where('id_ruta', $request->input('id_ruta'));
            }
            if ($request->filled('id_usuario')) {
                $query->where('id_usuario', $request->input('id_usuario'));
            }
            if ($request->filled('estado')) {
                $query->where('estado', $request->input('estado'));
            }
            $inscripciones = $query->orderByDesc('fecha_inscripcion')->paginate($perPage);
            return response()->json($inscripciones);
        }

        // default: curso
        $query = Inscripcion::with(['usuario', 'curso']);
        if ($request->filled('id_curso')) {
            $query->where('id_curso', $request->input('id_curso'));
        }
        if ($request->filled('id_usuario')) {
            $query->where('id_usuario', $request->input('id_usuario'));
        }
        if ($request->filled('estado')) {
            $query->where('estado', $request->input('estado'));
        }
        $inscripciones = $query->orderByDesc('fecha_inscripcion')->paginate($perPage);
        return response()->json($inscripciones);
    }

    public function show($id)
    {
        try {
            // admin can pass ?tipo=ruta to fetch from rutas table
            $tipo = request()->input('tipo');
            $prefix = request()->route() ? request()->route()->getPrefix() : null;
            if (!$tipo && $prefix && str_contains($prefix, 'inscripciones-rutas')) {
                $tipo = 'ruta';
            }
            if ($tipo === 'ruta') {
                $inscripcion = InscripcionRuta::with(['usuario', 'rutaAcademica'])->findOrFail($id);
                return response()->json($inscripcion);
            }
            $inscripcion = Inscripcion::with(['usuario', 'curso'])->findOrFail($id);
            return response()->json($inscripcion);
        } catch (\Illuminate\Database\Eloquent\ModelNotFoundException $e) {
            return response()->json(['message' => 'Inscripción no encontrada'], 404);
        }
    }

    public function updateEstado(Request $request, $id)
    {
        $request->validate(['estado' => 'required|in:Activo,Completado,Abandonado,Suspendido']);
        try {
            $tipo = $request->input('tipo');
            $prefix = $request->route() ? $request->route()->getPrefix() : null;
            if (!$tipo && $prefix && str_contains($prefix, 'inscripciones-rutas')) {
                $tipo = 'ruta';
            }
            if ($tipo === 'ruta') {
                $inscripcion = InscripcionRuta::findOrFail($id);
                $inscripcion->estado = $request->input('estado');
                if ($request->filled('fecha_completado')) {
                    $inscripcion->fecha_completado = $request->input('fecha_completado');
                }
                $inscripcion->save();
                return response()->json(['message' => 'Estado actualizado', 'inscripcion' => $inscripcion]);
            }
            $inscripcion = Inscripcion::findOrFail($id);
            $inscripcion->estado = $request->input('estado');
            if ($request->filled('fecha_completado')) {
                $inscripcion->fecha_completado = $request->input('fecha_completado');
            }
            $inscripcion->save();
            return response()->json(['message' => 'Estado actualizado', 'inscripcion' => $inscripcion]);
        } catch (\Illuminate\Database\Eloquent\ModelNotFoundException $e) {
            return response()->json(['message' => 'Inscripción no encontrada'], 404);
        } catch (\Exception $e) {
            Log::error('Error al actualizar estado de inscripcion', ['error' => $e->getMessage()]);
            return response()->json(['message' => 'Error al actualizar estado'], 500);
        }
    }

    public function forceDelete(Request $request, $id)
    {
        try {
            $tipo = $request->input('tipo');
            $prefix = $request->route() ? $request->route()->getPrefix() : null;
            if (!$tipo && $prefix && str_contains($prefix, 'inscripciones-rutas')) {
                $tipo = 'ruta';
            }
            if ($tipo === 'ruta') {
                $inscripcion = InscripcionRuta::findOrFail($id);
                $inscripcion->delete();
                Log::warning('Inscripcion ruta eliminada por admin', [
                    'admin_id' => $request->user() ? $request->user()->id_usuario : null,
                    'inscripcion_id' => $inscripcion->id_inscripcion_ruta,
                    'timestamp' => now(),
                ]);
                return response()->json(['message' => 'Inscripción en ruta eliminada permanentemente']);
            }
            $inscripcion = Inscripcion::findOrFail($id);
            $inscripcion->delete();
            Log::warning('Inscripcion eliminada por admin', [
                'admin_id' => $request->user() ? $request->user()->id_usuario : null,
                'inscripcion_id' => $inscripcion->id_inscripcion,
                'timestamp' => now(),
            ]);
            return response()->json(['message' => 'Inscripción eliminada permanentemente']);
        } catch (\Illuminate\Database\Eloquent\ModelNotFoundException $e) {
            return response()->json(['message' => 'Inscripción no encontrada'], 404);
        } catch (\Exception $e) {
            Log::error('Error al eliminar inscripcion', ['error' => $e->getMessage()]);
            return response()->json(['message' => 'Error al eliminar inscripción'], 500);
        }
    }
}
