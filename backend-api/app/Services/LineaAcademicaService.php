<?php

namespace App\Services;

use App\Repositories\LineaAcademica\LineaAcademicaRepository;

class LineaAcademicaService
{
    protected $lineaRepository;

    public function __construct(LineaAcademicaRepository $lineaRepository)
    {
        $this->lineaRepository = $lineaRepository;
    }

    public function listarLineas($filters = [], $perPage = 15)
    {
        return $this->lineaRepository->all($filters, $perPage);
    }

    public function detalleLinea($id)
    {
        return $this->lineaRepository->find($id);
    }

    public function crearLinea(array $data)
    {
        return $this->lineaRepository->create($data);
    }

    public function actualizarLinea($id, array $data)
    {
        return $this->lineaRepository->update($id, $data);
    }

    public function eliminarLinea($id)
    {
        return $this->lineaRepository->delete($id);
    }
}
