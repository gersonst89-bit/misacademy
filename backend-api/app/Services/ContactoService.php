<?php

namespace App\Services;

use App\Repositories\Contacto\ContactoRepository;

class ContactoService
{
    protected $contactoRepository;

    public function __construct(ContactoRepository $contactoRepository)
    {
        $this->contactoRepository = $contactoRepository;
    }

    public function guardarContacto(array $data)
    {
        return $this->contactoRepository->create($data);
    }
}
