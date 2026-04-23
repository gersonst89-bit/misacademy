<?php

namespace App\Http\Controllers;

use App\Models\CarritoCompra;
use App\Models\CarritoItem;
use App\Http\Requests\StoreCarritoItemRequest;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;

class CarritoController extends Controller
{
    public function index()
    {
        $user = Auth::user();
        $carrito = CarritoCompra::with('items.curso')
            ->where('id_usuario', $user->id_usuario)
            ->where('estado', 'Activo')
            ->first();
        if (!$carrito) {
            return response()->json(['message' => 'Carrito vacío'], 200);
        }
        return new \App\Http\Resources\CarritoCompraResource($carrito);
    }

    public function agregar(StoreCarritoItemRequest $request)
    {
        $user = Auth::user();
        // Verificar si el usuario ya está inscrito en el curso
$yaInscrito = \App\Models\Inscripcion::where('id_usuario', $user->id_usuario)
    ->where('id_curso', $request->id_curso)
    ->exists();
if ($yaInscrito) {
    return response()->json(['message' => 'Ya estás inscrito en este curso'], 409);
}
        $carrito = CarritoCompra::firstOrCreate(
            [
                'id_usuario' => $user->id_usuario,
                'estado' => 'Activo',
            ],
            [
                'fecha_creacion' => now(),
                'fecha_actualizacion' => now(),
            ]
        );
        // Evitar duplicados
        if ($carrito->items()->where('id_curso', $request->id_curso)->exists()) {
            return response()->json(['message' => 'El curso ya está en el carrito'], 409);
        }
        // Obtener el curso real y validar estado y precio
        $curso = \App\Models\Curso::find($request->id_curso);
        if (!$curso || !in_array(strtolower($curso->estado), ['activo', 'publicado'])) {
            return response()->json(['message' => 'El curso no está disponible para agregar al carrito'], 422);
        }
        $item = $carrito->items()->create([
            'id_curso' => $curso->id_curso,
            'precio' => $curso->precio,
            'fecha_agregado' => now(),
        ]);
        $carrito->fecha_actualizacion = now();
        $carrito->save();
        // Recargar carrito con relaciones para respuesta
        $carrito->load('items.curso');
        return new \App\Http\Resources\CarritoCompraResource($carrito);
    }

    public function quitar(Request $request)
    {
        $user = Auth::user();
        $request->validate([
            'id_item' => 'required|exists:carrito_items,id_item',
        ]);
        $item = CarritoItem::find($request->id_item);
        if (!$item || $item->carrito->id_usuario !== $user->id_usuario) {
            return response()->json(['message' => 'No autorizado'], 403);
        }
        $carrito = $item->carrito;
        $item->delete();
        $carrito->fecha_actualizacion = now();
        $carrito->save();
        $carrito->load('items.curso');
        return new \App\Http\Resources\CarritoCompraResource($carrito);
    }

    public function vaciar()
    {
        $user = Auth::user();
        $carrito = CarritoCompra::with('items.curso')
            ->where('id_usuario', $user->id_usuario)
            ->where('estado', 'Activo')
            ->first();
        if (!$carrito) {
            return response()->json(['message' => 'Carrito ya vacío'], 200);
        }
        $carrito->items()->delete();
        $carrito->fecha_actualizacion = now();
        $carrito->save();
        $carrito->load('items.curso');
        return new \App\Http\Resources\CarritoCompraResource($carrito);
    }
}
