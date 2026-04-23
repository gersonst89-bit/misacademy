<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreInscripcionRequest;
use App\Models\Inscripcion;
use App\Models\InscripcionRuta;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;

class InscripcionController extends Controller
{
    public function index(Request $request)
    {
        $user = $request->user();
        $perPage = max(1, min((int)$request->input('per_page', 50), 200));
        $tipo = $request->input('tipo');

        // If route prefix indicates rutas, default tipo to 'ruta'
        $prefix = $request->route() ? $request->route()->getPrefix() : null;
        if (!$tipo && $prefix && str_contains($prefix, 'inscripciones-rutas')) {
            $tipo = 'ruta';
        }

        if ($tipo === 'ruta') {
            $query = InscripcionRuta::with('rutaAcademica')
                ->where('id_usuario', $user->id_usuario)
                ->orderByDesc('fecha_inscripcion');
            $inscripciones = $query->paginate($perPage);
            return response()->json($inscripciones);
        }

        // default: curso
        $query = Inscripcion::with('curso')
            ->where('id_usuario', $user->id_usuario)
            ->orderByDesc('fecha_inscripcion');

        $inscripciones = $query->paginate($perPage);
        return response()->json($inscripciones);
    }

    public function store(StoreInscripcionRequest $request)
    {
        try {
            $user = $request->user();
            $data = $request->validated();
            $tipo = $data['tipo'] ?? null;

            if ($tipo === 'ruta') {
                // Evitar duplicados en rutas
                $exists = InscripcionRuta::where('id_usuario', $user->id_usuario)
                    ->where('id_ruta', $data['id_objeto'])
                    ->exists();
                if ($exists) {
                    return response()->json(['message' => 'Ya estás inscrito en esta ruta'], 409);
                }

                $inscripcion = InscripcionRuta::create([
                    'id_usuario' => $user->id_usuario,
                    'id_ruta' => $data['id_objeto'],
                    'fecha_inscripcion' => now(),
                    'estado' => 'Activo',
                    'progreso_total' => 0,
                ]);

                $inscripcion->load('rutaAcademica');
                return response()->json(['message' => 'Inscripción en ruta creada correctamente', 'inscripcion' => $inscripcion], 201);
            }

            // default: curso
            $exists = Inscripcion::where('id_usuario', $user->id_usuario)
                ->where('id_curso', $data['id_objeto'])
                ->exists();
            if ($exists) {
                return response()->json(['message' => 'Ya estás inscrito en este curso'], 409);
            }

            $inscripcion = Inscripcion::create([
                'id_usuario' => $user->id_usuario,
                'id_curso' => $data['id_objeto'],
                'fecha_inscripcion' => now(),
                'estado' => 'Activo',
                'progreso_total' => 0,
            ]);

            $inscripcion->load('curso');
            return response()->json(['message' => 'Inscripción creada correctamente', 'inscripcion' => $inscripcion], 201);
        } catch (\Exception $e) {
            Log::error('Error al crear inscripcion', ['error' => $e->getMessage()]);
            return response()->json(['message' => 'Error al crear inscripción'], 500);
        }
    }

    public function destroy(Request $request, $id)
    {
        try {
            $user = $request->user();
            $tipo = $request->input('tipo');

            // If route prefix indicates rutas, default tipo to 'ruta'
            $prefix = $request->route() ? $request->route()->getPrefix() : null;
            if (!$tipo && $prefix && str_contains($prefix, 'inscripciones-rutas')) {
                $tipo = 'ruta';
            }

            if ($tipo === 'ruta') {
                $inscripcion = InscripcionRuta::findOrFail($id);
                if ($inscripcion->id_usuario !== $user->id_usuario) {
                    return response()->json(['message' => 'No autorizado'], 403);
                }
                $inscripcion->estado = 'Abandonado';
                $inscripcion->save();
                return response()->json(['message' => 'Inscripción en ruta cancelada correctamente']);
            }

            // default: curso
            $inscripcion = Inscripcion::findOrFail($id);
            if ($inscripcion->id_usuario !== $user->id_usuario) {
                return response()->json(['message' => 'No autorizado'], 403);
            }
            $inscripcion->estado = 'Abandonado';
            $inscripcion->save();
            return response()->json(['message' => 'Inscripción cancelada correctamente']);
        } catch (\Illuminate\Database\Eloquent\ModelNotFoundException $e) {
            return response()->json(['message' => 'Inscripción no encontrada'], 404);
        } catch (\Exception $e) {
            Log::error('Error al cancelar inscripcion', ['error' => $e->getMessage()]);
            return response()->json(['message' => 'Error al cancelar inscripción'], 500);
        }
    }
}
