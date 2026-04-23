<?php

namespace App\Repositories\Curso;

use App\Models\Curso;
use Illuminate\Support\Facades\Cache;

class CursoRepository implements CursoRepositoryInterface
{
    public function all($filters = [], $perPage = 15)
    {
        $query = Curso::query();

        // Filtro por id_docente (solo para docentes)
        if (!empty($filters['id_docente'])) {
            $query->where('id_docente', $filters['id_docente']);
        }

        // Filtro por nombre/titulo
        if (!empty($filters['titulo']) || !empty($filters['nombre'])) {
            $busqueda = $filters['titulo'] ?? $filters['nombre'];
            $query->where('nombre', 'like', '%' . $busqueda . '%');
        }

        // Filtro por nivel
        if (!empty($filters['nivel'])) {
            $query->where('nivel', $filters['nivel']);
        }

        // Filtro por estado
if (!empty($filters['estado'])) {
    $query->where('estado', $filters['estado']);
}

        // Filtro por precio mínimo
        if (!empty($filters['precio_min'])) {
            $query->where('precio', '>=', $filters['precio_min']);
        }

        // Filtro por precio máximo
        if (!empty($filters['precio_max'])) {
            $query->where('precio', '<=', $filters['precio_max']);
        }

        // Filtro por destacado
        if (isset($filters['destacado'])) {
            $query->where('destacado', (bool)$filters['destacado']);
        }

        return $query->paginate($perPage);
    }

    public function find($id)
    {
        return Curso::with([
            'modulos.lecciones',
        ])->withCount('evaluaciones', 'resenas')
        ->withAvg('resenas', 'calificacion')
        ->findOrFail($id);
    }

    public function destacados($limit = 5)
    {
        return Cache::remember('cursos_destacados_' . $limit, 600, function () use ($limit) {
            return Curso::where('destacado', true)
                ->orderByDesc('fecha_actualizacion')
                ->limit($limit)
                ->get();
        });
    }

    public function buscar($query, $perPage = 15)
    {
        return Curso::where('nombre', 'like', "%$query%")
            ->paginate($perPage);
    }
}
