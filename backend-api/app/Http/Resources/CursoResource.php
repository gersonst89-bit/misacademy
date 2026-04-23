<?php

namespace App\Http\Resources;

use Illuminate\Http\Resources\Json\JsonResource;

class CursoResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return array
     */
    public function toArray($request)
    {
        return [
            'id_curso' => $this->id_curso,
            'nombre' => $this->nombre,
            'descripcion' => $this->descripcion,
            'descripcion_corta' => $this->descripcion_corta,
            'descripcion_larga' => $this->descripcion_larga,
            'imagen' => $this->imagen,
            'video_previsualizacion' => $this->video_previsualizacion,
            'lo_que_aprenderas' => $this->lo_que_aprenderas,
            'requisitos' => $this->requisitos,
            'duracion' => $this->duracion,
            'tiempo' => $this->tiempo,
            'precio' => number_format($this->precio, 2, '.', ''),
            'nivel' => $this->nivel,
            'estado' => $this->estado,
            'destacado' => $this->destacado,
            'docente' => $this->docente ? [
                'id_docente' => $this->docente->id_usuario,
                'nombre' => $this->docente->nombre,
                'imagen' => $this->docente->imagen_perfil,
            ] : null,
            'fecha_creacion' => $this->fecha_creacion,
            'fecha_actualizacion' => $this->fecha_actualizacion,
            'rutas' => $this->whenLoaded('rutas', function () {
                return $this->rutas->map(function ($ruta) {
                    return [
                        'id_ruta' => $ruta->id_ruta,
                        'nombre' => $ruta->nombre,
                        'orden' => $ruta->pivot->orden,
                    ];
                });
            }),
        ];
    }
}
