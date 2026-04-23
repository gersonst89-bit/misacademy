<?php

namespace App\Repositories\Contacto;

use App\Models\Contacto;

class ContactoRepository
{
    public function create(array $data)
    {
        return Contacto::create($data);
    }
}
