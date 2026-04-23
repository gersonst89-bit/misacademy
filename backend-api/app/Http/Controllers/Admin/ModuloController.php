<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\StoreModuloRequest;
use App\Http\Requests\Admin\UpdateModuloRequest;
use App\Http\Requests\Admin\UpdateEstadoRequest;
use App\Http\Resources\ModuloResource;
use App\Models\Modulo;
use Illuminate\Http\Request;

class ModuloController extends Controller
{
    // Listar módulos con paginación y búsqueda
    public function index(Request $request)
    {
        $this->authorize('viewAny', Modulo::class);
        $user = auth()->user();
        $query = Modulo::query();

        // Invitado o estudiante: solo módulos publicados
        if (!$user || (isset($user->rol) && strtolower($user->rol->nombre_rol) === 'estudiante')) {
            $query->where('estado', 'Publicado');
        } else {
            // Admin y docente: pueden ver todos los módulos, aplicar filtros opcionales
            if ($request->filled('titulo')) {
                $query->where('titulo', 'like', '%' . $request->titulo . '%');
            }
            if ($request->filled('id_curso')) {
                $query->where('id_curso', $request->id_curso);
            }
            if ($request->filled('estado')) {
                $query->where('estado', $request->estado);
            }
        }
        $modulos = $query->orderBy('orden')->paginate(15);
        return ModuloResource::collection($modulos);
    }

    // Crear módulo
    public function store(StoreModuloRequest $request)
    {
        $validated = $request->validated();
        $modulo = new Modulo($validated);
        $this->authorize('create', $modulo);
        try {
            $modulo->save();
            return new ModuloResource($modulo);
        } catch (\Illuminate\Database\QueryException $e) {
            if ($e->getCode() == 23000) { // Duplicado
                $maxOrden = Modulo::where('id_curso', $validated['id_curso'])->max('orden');
                $siguienteOrden = $maxOrden ? $maxOrden + 1 : 1;
                return response()->json([
                    'message' => 'Ya existe un módulo con ese orden en este curso. El siguiente orden disponible es: ' . $siguienteOrden
                ], 409);
            }
            throw $e;
        }
    }

    // Mostrar módulo específico
    public function show($id)
    {
        $modulo = Modulo::findOrFail($id);
        return new ModuloResource($modulo);
    }

    // Actualizar módulo
    public function update(UpdateModuloRequest $request, $id)
    {
        $modulo = Modulo::findOrFail($id);
        $this->authorize('update', $modulo);
        $validated = $request->validated();
        $user = auth()->user();
        if ($user && $user->rol && strtolower($user->rol->nombre_rol) === 'docente') {
            unset($validated['id_curso']); // El docente no puede cambiar el curso
        }
        $modulo->update($validated);
        return new ModuloResource($modulo);
    }

    // Eliminar módulo
    public function destroy($id)
    {
        $modulo = Modulo::findOrFail($id);
        $this->authorize('delete', $modulo);
        $modulo->delete();
        return response()->json(['message' => 'Módulo eliminado correctamente']);
    }

    /**
     * Cambiar solo el estado de un módulo
     */
    public function updateEstado(UpdateEstadoRequest $request, $id)
    {
        $modulo = Modulo::findOrFail($id);
        $modulo->estado = $request->estado;
        $modulo->save();
        return response()->json(['message' => 'Estado actualizado', 'estado' => $modulo->estado]);
    }
    public function misModulos(Request $request)
{
    $user = auth()->user();

    // Solo admin y docente pueden acceder
    if (!$user || !$user->rol || !in_array(strtolower($user->rol->nombre_rol), ['administrador', 'docente'])) {
        return response()->json(['message' => 'No autorizado'], 403);
    }

    $query = Modulo::query();

    // Si es docente, filtra solo sus módulos
    if (strtolower($user->rol->nombre_rol) === 'docente') {
        $query->whereHas('curso', function ($q) use ($user) {
            $q->where('id_docente', $user->id_usuario);
        });
    }

    // Filtros opcionales para admin/docente
    if ($request->filled('titulo')) {
        $query->where('titulo', 'like', '%' . $request->titulo . '%');
    }
    if ($request->filled('id_curso')) {
        $query->where('id_curso', $request->id_curso);
    }
    if ($request->filled('estado')) {
        $query->where('estado', $request->estado);
    }

    $modulos = $query->orderBy('orden')->paginate(15);
    return ModuloResource::collection($modulos);
}
}
