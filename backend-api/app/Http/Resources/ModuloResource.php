<?php

namespace App\Http\Resources;

use Illuminate\Http\Resources\Json\JsonResource;

class ModuloResource extends JsonResource
{
    public function toArray($request)
    {
        return [
            'id_modulo' => $this->id_modulo,
            'id_curso' => $this->id_curso,
            'titulo' => $this->titulo,
            'descripcion' => $this->descripcion,
            'orden' => $this->orden,
            'estado' => $this->estado,
            'fecha_creacion' => $this->fecha_creacion,
            'fecha_actualizacion' => $this->fecha_actualizacion,
        ];
    }
}
