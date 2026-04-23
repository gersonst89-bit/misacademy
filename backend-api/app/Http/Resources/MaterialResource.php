<?php

namespace App\Http\Resources;

use Illuminate\Http\Resources\Json\JsonResource;

class MaterialResource extends JsonResource
{
    public function toArray($request)
    {
        return [
            'id_material' => $this->id_material,
            'id_modulo' => $this->id_modulo,
            'nombre' => $this->nombre,
            'descripcion' => $this->descripcion,
            'url_archivo' => $this->url_archivo ? url($this->url_archivo) : null,
            'tamanio' => $this->tamanio,
            'fecha_creacion' => $this->fecha_creacion,
            'estado' => $this->estado,
            // ...no se incluye la relación 'modulo'
        ];
    }
}
