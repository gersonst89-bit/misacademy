<?php

namespace App\Services;

use App\Repositories\RutaAcademica\RutaAcademicaRepository;

class RutaAcademicaService
{
    protected $rutaRepository;

    public function __construct(RutaAcademicaRepository $rutaRepository)
    {
        $this->rutaRepository = $rutaRepository;
    }

    public function listarRutas($filters = [], $perPage = 15)
    {
        return $this->rutaRepository->all($filters, $perPage);
    }

    public function rutasDestacadas($limit = 5)
    {
        return $this->rutaRepository->destacadas($limit);
    }

    public function buscarRutas($query, $perPage = 15)
    {
        return $this->rutaRepository->buscar($query, $perPage);
    }

    public function detalleRuta($id)
    {
        return $this->rutaRepository->find($id);
    }

    public function crearRuta(array $data)
    {
        return $this->rutaRepository->create($data);
    }

    public function actualizarRuta($id, array $data)
    {
        return $this->rutaRepository->update($id, $data);
    }

    public function eliminarRuta($id)
    {
        return $this->rutaRepository->delete($id);
    }
}
