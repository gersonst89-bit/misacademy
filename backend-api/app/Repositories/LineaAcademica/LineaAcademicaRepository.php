<?php

namespace App\Repositories\LineaAcademica;

use App\Models\LineaAcademica;

class LineaAcademicaRepository
{
    public function all($filters = [], $perPage = 15)
    {
        $query = LineaAcademica::query();
        if (!empty($filters['estado'])) {
            $query->where('estado', $filters['estado']);
        }
        return $query->paginate($perPage);
    }

    public function find($id)
    {
        return LineaAcademica::with(['rutasAcademicas'])->findOrFail($id);
    }

    public function create(array $data)
    {
        return LineaAcademica::create($data);
    }

    public function update($id, array $data)
    {
        $linea = LineaAcademica::findOrFail($id);
        $linea->update($data);
        return $linea;
    }

    public function delete($id)
    {
           $linea = LineaAcademica::findOrFail($id);
           $linea->delete();
           return true;
    }
}
