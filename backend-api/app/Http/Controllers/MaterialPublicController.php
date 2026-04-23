<?php

namespace App\Http\Controllers;

use App\Http\Resources\MaterialResource;
use App\Models\Material;
use Illuminate\Http\Request;

class MaterialPublicController extends Controller
{
    // Listar materiales públicos con paginación, búsqueda y filtro por módulo
    public function index(Request $request)
    {
        $query = Material::query()->where('estado', 'Publicado');
        if ($request->filled('nombre')) {
            $query->where('nombre', 'like', '%' . $request->nombre . '%');
        }
        if ($request->filled('id_modulo')) {
            $query->where('id_modulo', $request->id_modulo);
        }
        $materiales = $query->orderByDesc('id_material')->paginate(15);
        return MaterialResource::collection($materiales);
    }

    // Mostrar material específico
    public function show($id)
    {
        $material = Material::where('id_material', $id)->where('estado', 'Publicado')->firstOrFail();
        return new MaterialResource($material);
    }
}
