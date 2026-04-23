<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\StoreMaterialRequest;
use App\Http\Requests\Admin\UpdateMaterialRequest;
use App\Http\Resources\MaterialResource;
use App\Models\Material;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Log;
use Exception;


class MaterialController extends Controller
{
    // Listar materiales con paginación y búsqueda
    public function index(Request $request)
    {
        $user = auth()->user();
        $query = Material::query();

        // Filtro por módulo (debe ir antes de paginar)
        if ($request->filled('id_modulo')) {
            $query->where('id_modulo', $request->id_modulo);
        }

        // Estudiante: solo materiales publicados de cursos comprados
        if ($user && $user->rol && strtolower($user->rol->nombre_rol) === 'estudiante') {
            $query->where('estado', 'Publicado')
                ->whereHas('modulo.curso', function ($q) use ($user) {
                    // Verificar que el estudiante compró el curso
                    $q->whereHas('detallesPago.pago', function ($qPago) use ($user) {
                        $qPago->where('id_usuario', $user->id_usuario)
                              ->where('estado', 'Completado');
                    });
                });
        } elseif ($user && $user->rol && strtolower($user->rol->nombre_rol) === 'docente') {
            // Docente: solo sus materiales (todos los estados)
            if ($request->filled('nombre')) {
                $query->where('nombre', 'like', '%' . $request->nombre . '%');
            }
            $query->whereHas('modulo.curso', function ($q) use ($user) {
                $q->where('id_docente', $user->id_usuario);
            });
        } else {
            // Admin: todos los materiales, aplicar filtros
            if ($request->filled('nombre')) {
                $query->where('nombre', 'like', '%' . $request->nombre . '%');
            }
        }

        $materiales = $query->orderByDesc('id_material')->paginate(15);
        return MaterialResource::collection($materiales);
    }

    // Crear material
    public function store(StoreMaterialRequest $request)
    {
        try {
            $data = $request->validated();
            $material = new Material($data);
            $this->authorize('create', $material);

            // Procesar archivo si se envió
            if ($request->hasFile('archivo')) {
                $file = $request->file('archivo');
                $fileName = time() . '_' . $file->getClientOriginalName();
                $tamanio = $file->getSize() / 1024; // KB  <-- OBTENER ANTES DE MOVER

                // Guardar directamente en public/materiales/
                $file->move(public_path('materiales'), $fileName);

                $material->url_archivo = 'materiales/' . $fileName;
                $material->tamanio = $tamanio;
            }

            $material->save();

            return new MaterialResource($material);
        } catch (Exception $e) {
            Log::error('Error al crear material: ' . $e->getMessage());
            return response()->json([
                'message' => 'Error al crear el material',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    // Mostrar material específico
    public function show($id)
    {
        $user = auth()->user();
        $material = Material::with('modulo.curso')->findOrFail($id);
        
        // Estudiante: verificar que sea publicado y que haya comprado el curso
        if ($user && $user->rol && strtolower($user->rol->nombre_rol) === 'estudiante') {
            if ($material->estado !== 'Publicado') {
                abort(403, 'Material no disponible');
            }
            
            // Verificar compra del curso
            $curso = $material->modulo->curso;
            $haComprado = \App\Models\DetallePago::whereHas('pago', function ($q) use ($user) {
                $q->where('id_usuario', $user->id_usuario)
                  ->where('estado', 'Completado');
            })->where('id_curso', $curso->id_curso)->exists();
            
            if (!$haComprado) {
                abort(403, 'Debes comprar el curso para acceder a este material');
            }
        }
        
        $this->authorize('view', $material);
        return new MaterialResource($material);
    }

    // Actualizar material
    public function update(UpdateMaterialRequest $request, $id)
    {
        try {
            $material = Material::findOrFail($id);
            $this->authorize('update', $material);
            $data = $request->validated();

            // Si se sube un nuevo archivo, eliminar el anterior y guardar el nuevo
            if ($request->hasFile('archivo')) {
                $file = $request->file('archivo');

                // Eliminar archivo anterior si existe
                if ($material->url_archivo && file_exists(public_path($material->url_archivo))) {
                    unlink(public_path($material->url_archivo));
                }

                // Generar nombre único con timestamp
                $fileName = time() . '_' . $file->getClientOriginalName();
                $file->move(public_path('materiales'), $fileName);

                $data['url_archivo'] = 'materiales/' . $fileName;
                $data['tamanio'] = $file->getSize() / 1024; // KB
            }

            $material->update($data);

            // Devuelve solo los datos del material actualizado usando MaterialResource
            return new MaterialResource($material);
        } catch (Exception $e) {
            Log::error('Error al actualizar material: ' . $e->getMessage());
            return response()->json([
                'message' => 'Error al actualizar el material',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    // Eliminar material
    public function destroy($id)
    {
        try {
            $material = Material::findOrFail($id);
            $this->authorize('delete', $material);

            // Eliminar archivo físico si existe
            if ($material->url_archivo && file_exists(public_path($material->url_archivo))) {
                unlink(public_path($material->url_archivo));
            }

            $material->delete();

            return response()->json([
                'message' => 'Material eliminado correctamente'
            ]);
        } catch (Exception $e) {
            Log::error('Error al eliminar material: ' . $e->getMessage());
            return response()->json([
                'message' => 'Error al eliminar el material',
                'error' => $e->getMessage()
            ], 500);
        }
    }
    // Cambiar solo el estado de un material
    public function updateEstado(\App\Http\Requests\Admin\UpdateMaterialEstadoRequest $request, $id)
    {
        $material = Material::findOrFail($id);
        $this->authorize('update', $material);
        $material->estado = $request->input('estado');
        $material->save();
        return new MaterialResource($material);
    }
}
