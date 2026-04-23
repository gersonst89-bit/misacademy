<?php

namespace App\Http\Controllers;

use App\Models\TipoPago;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Auth;
use Illuminate\Validation\ValidationException;
use Exception;

class TipoPagoController extends Controller
{
    // Listar todos los métodos de pago
    public function index()
    {
        $tipos = TipoPago::all();
        return response()->json([
            'tipos_pagos' => $tipos,
            'status' => 'success'
        ]);
    }

    // Crear un nuevo método de pago (solo admin)
    public function store(Request $request)
    {
        $validated = $request->validate([
            'nombre' => 'required|string|max:100',
            'descripcion' => 'nullable|string',
            'activo' => 'required|boolean',
            'comision' => 'nullable|numeric|min:0'
        ]);
        try {
            $tipo = TipoPago::create($validated);
            return response()->json([
                'mensaje' => 'Método de pago creado',
                'tipo_pago' => $tipo,
                'status' => 'success'
            ], 201);
        } catch (ValidationException $e) {
            return response()->json([
                'mensaje' => 'Error de validación',
                'errores' => $e->errors(),
                'status' => 'error'
            ], 422);
        } catch (Exception $e) {
            Log::error('Error al crear tipo de pago: ' . $e->getMessage());
            return response()->json([
                'mensaje' => 'Error interno al crear el método de pago',
                'status' => 'error'
            ], 500);
        }
    }

    // Actualizar método de pago (solo admin)
    public function update(Request $request, $id)
    {
        $tipo = TipoPago::findOrFail($id);
        $validated = $request->validate([
            'nombre' => 'sometimes|required|string|max:100',
            'descripcion' => 'nullable|string',
            'activo' => 'sometimes|required|boolean',
            'comision' => 'nullable|numeric|min:0'
        ]);
        $tipo->update($validated);
        return response()->json([
            'mensaje' => 'Método de pago actualizado',
            'tipo_pago' => $tipo,
            'status' => 'success'
        ]);
    }

    // Activar/desactivar método de pago (solo admin)
    public function activar(Request $request, $id)
    {
        $tipo = TipoPago::findOrFail($id);
        $tipo->activo = $request->input('activo', true);
        $tipo->save();
        return response()->json([
            'mensaje' => 'Estado actualizado',
            'tipo_pago' => $tipo,
            'status' => 'success'
        ]);
    }
}
