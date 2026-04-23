<?php

namespace App\Http\Resources;

use Illuminate\Http\Resources\Json\JsonResource;

class CarritoCompraResource extends JsonResource
{
    public function toArray($request)
    {
        // Sumar los precios ya formateados de los ítems para evitar problemas de tipo
        $total = $this->items->reduce(function($carry, $item) {
            return $carry + floatval($item->precio);
        }, 0);
        return [
            'id_carrito' => $this->id_carrito,
            'id_usuario' => $this->id_usuario,
            'estado' => $this->estado,
            'fecha_creacion' => $this->fecha_creacion,
            'fecha_actualizacion' => $this->fecha_actualizacion,
            'items' => CarritoItemResource::collection($this->items),
            'total' => number_format($total, 2, '.', ''),
        ];
    }
}
