<?php

namespace App\Http\Resources;

use Illuminate\Http\Resources\Json\JsonResource;

class CarritoItemResource extends JsonResource
{
    public function toArray($request)
    {
        return [
            'id_item' => $this->id_item,
            'id_curso' => $this->id_curso,
            'precio' => number_format($this->precio, 2, '.', ''),
            'fecha_agregado' => $this->fecha_agregado,
            'curso' => new CursoResource($this->whenLoaded('curso')),
        ];
    }
}
