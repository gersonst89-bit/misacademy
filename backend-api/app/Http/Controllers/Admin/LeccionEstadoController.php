<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\UpdateLeccionEstadoRequest;
use App\Models\Leccion;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;

class LeccionEstadoController extends Controller
{
    /**
     * Actualiza solo el estado de una lección.
     */
    public function update(UpdateLeccionEstadoRequest $request, $id)
    {
        try {
            $leccion = Leccion::findOrFail($id);
            $leccion->estado = $request->input('estado');
            $leccion->save();
            return response()->json([
                'message' => 'Estado de lección actualizado correctamente.',
                'data' => $leccion
            ]);
        } catch (\Exception $e) {
            Log::error('Error actualizando estado de lección: ' . $e->getMessage());
            return response()->json([
                'message' => 'No se pudo actualizar el estado de la lección.'
            ], 500);
        }
    }
}
