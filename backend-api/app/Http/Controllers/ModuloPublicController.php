<?php

namespace App\Http\Controllers;

use App\Http\Resources\ModuloResource;
use App\Models\Modulo;
use Illuminate\Http\Request;

class ModuloPublicController extends Controller
{
    // Listar módulos públicos con paginación, búsqueda y filtro por curso y estado
    public function index(Request $request)
    {
        $query = Modulo::query();
        if ($request->filled('titulo')) {
            $query->where('titulo', 'like', '%' . $request->titulo . '%');
        }
        if ($request->filled('id_curso')) {
            $query->where('id_curso', $request->id_curso);
        }
        // Mostrar solo módulos publicados por defecto
        if ($request->filled('estado')) {
            $query->where('estado', $request->estado);
        } else {
            $query->where('estado', 'Publicado');
        }
        $modulos = $query->orderBy('orden')->paginate(15);
        return ModuloResource::collection($modulos);
    }

    // Mostrar módulo específico
    public function show($id)
    {
        $modulo = Modulo::findOrFail($id);
        return new ModuloResource($modulo);
    }
}
