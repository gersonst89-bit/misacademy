<?php

namespace App\Services;

use App\Models\Certificacion;
use Barryvdh\DomPDF\Facade\Pdf;

class CertificacionService
{
    /**
     * Genera el PDF del certificado en memoria y lo retorna como string binario
     */
    public function generarPDF(Certificacion $certificacion)
    {
        // Cargar relaciones necesarias
        $certificacion->loadMissing(['usuario', 'curso', 'curso.docente']);

        // Variables dinámicas
        if ($certificacion->tipo_certificado === 'adicional') {
            $nombre_completo = $certificacion->nombre_estudiante ?? ($certificacion->usuario->nombre ?? '') . ' ' . ($certificacion->usuario->apellido ?? '');
            $nombre_curso = $certificacion->nombre_curso ?? ($certificacion->curso->nombre ?? '');
            $fecha = $certificacion->fecha_fin ? date('d/m/Y', strtotime($certificacion->fecha_fin)) : date('d/m/Y', strtotime($certificacion->fecha_emision));
            $docente = $certificacion->curso && $certificacion->curso->docente ? $certificacion->curso->docente->nombre : '';
            $firma_url = $certificacion->curso && $certificacion->curso->docente ? $certificacion->curso->docente->firma_url : null;
        } else {
            $nombre_completo = $certificacion->usuario->nombre . ' ' . $certificacion->usuario->apellido;
            $nombre_curso = $certificacion->curso->nombre;
            $fecha = date('d/m/Y', strtotime($certificacion->fecha_emision));
            $docente = $certificacion->curso->docente->nombre ?? '';
            $firma_url = $certificacion->curso->docente->firma_url ?? null;
        }

        // Renderizar PDF con DomPDF usando el Facade
        $pdf = Pdf::loadView('certificado', [
            'nombre_completo' => $nombre_completo,
            'nombre_curso' => $nombre_curso,
            'fecha' => $fecha,
            'docente' => $docente,
            'firma_url' => $firma_url,
        ]);

        // Establecer el tamaño de papel a A4 horizontal (landscape)
        $pdf->setPaper('a4', 'landscape');

        return $pdf->output(); // Retorna el PDF como string binario
    }
}