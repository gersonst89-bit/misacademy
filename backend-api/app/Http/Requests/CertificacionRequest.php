<?php

namespace App\Http\Requests;

class CertificacionRequest extends BaseApiRequest
{
    public function authorize()
    {
        return true;
    }

    public function rules()
    {
        $tipo = $this->input('tipo_certificado', 'empresa');
        $base = [
            'fecha_emision' => 'required|date',
            'codigo_certificado' => 'required|string|max:50|unique:certificaciones,codigo_certificado',
        ];
        if ($tipo === 'adicional') {
            return array_merge($base, [
                'nombre_curso' => 'required|string|max:255',
                'nombre_estudiante' => 'required|string|max:255',
                'fecha_inicio' => 'required|date',
                'fecha_fin' => 'required|date|after_or_equal:fecha_inicio',
                'total_horas' => 'required|integer|min:1',
                'email_destinatario' => 'required|email|max:255',
            ]);
        } else {
            return array_merge($base, [
                'id_usuario' => 'required|exists:usuarios,id_usuario',
                'id_curso' => 'required|exists:cursos,id_curso',
                'calificacion_final' => 'required|numeric|min:0|max:100',
            ]);
        }
    }
}
