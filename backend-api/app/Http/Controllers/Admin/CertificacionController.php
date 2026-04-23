<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\CertificacionRequest;
use App\Models\Certificacion;
use Illuminate\Http\Request;
use Illuminate\Http\Response;
use Illuminate\Support\Facades\Mail;

class CertificacionController extends Controller
{
    // Listar certificaciones (admin)
    public function index()
    {
        $this->authorize('viewAny', Certificacion::class);
        $tipo = request()->query('tipo_certificado');
        $query = Certificacion::with(['usuario', 'curso']);
        if ($tipo) {
            $query->where('tipo_certificado', $tipo);
        }
        $certificaciones = $query->paginate(20);
        // Personalizar la respuesta según el tipo de certificado
        $certificadosMap = $certificaciones->getCollection()->map(function ($certificacion) {
            if ($certificacion->tipo_certificado === 'empresa') {
                return [
                    'id_certificacion'   => $certificacion->id_certificacion,
                    'id_usuario'         => $certificacion->id_usuario,
                    'id_curso'           => $certificacion->id_curso,
                    'fecha_emision'      => $certificacion->fecha_emision,
                    'codigo_certificado' => $certificacion->codigo_certificado,
                    'calificacion_final' => $certificacion->calificacion_final,
                    'url_certificado'    => $certificacion->url_certificado,
                    'tipo_certificado'   => $certificacion->tipo_certificado,
                ];
            } else {
                return [
                    'id_certificacion'   => $certificacion->id_certificacion,
                    'codigo_certificado' => $certificacion->codigo_certificado,
                    'nombre_estudiante'  => $certificacion->nombre_estudiante,
                    'nombre_curso'       => $certificacion->nombre_curso,
                    'fecha_inicio'       => $certificacion->fecha_inicio,
                    'fecha_fin'          => $certificacion->fecha_fin,
                    'total_horas'        => $certificacion->total_horas,
                    'email_destinatario' => $certificacion->email_destinatario,
                    'tipo_certificado'   => $certificacion->tipo_certificado,
                    'fecha_emision'      => $certificacion->fecha_emision,
                ];
            }
        });
        $certificaciones->setCollection($certificadosMap);
        return response()->json($certificaciones);
    }

    // Crear certificación (admin)
    public function store(CertificacionRequest $request)
    {
        $this->authorize('create', Certificacion::class);
        if ($request->input('tipo_certificado') !== 'adicional') {
            return response()->json([
                'message' => 'No se permite la creación manual de certificados de empresa. Estos se generan automáticamente.'
            ], 403);
        }
        $data = $request->validated();
        $data['tipo_certificado'] = 'adicional';
        $certificacion = Certificacion::create($data);

        // Si es adicional, enviar el email con PDF adjunto
        if ($certificacion->tipo_certificado === 'adicional' && $certificacion->email_destinatario) {
            $pdfContent = app(\App\Services\CertificacionService::class)->generarPDF($certificacion);
            Mail::to($certificacion->email_destinatario)
                ->send(new \App\Mail\CertificacionMail($certificacion, $pdfContent));
        }

        // Respuesta personalizada solo para adicional
        return response()->json([
            'id_certificacion'   => $certificacion->id_certificacion,
            'codigo_certificado' => $certificacion->codigo_certificado,
            'nombre_estudiante'  => $certificacion->nombre_estudiante,
            'nombre_curso'       => $certificacion->nombre_curso,
            'fecha_inicio'       => $certificacion->fecha_inicio,
            'fecha_fin'          => $certificacion->fecha_fin,
            'total_horas'        => $certificacion->total_horas,
            'email_destinatario' => $certificacion->email_destinatario,
            'tipo_certificado'   => $certificacion->tipo_certificado,
            'fecha_emision'      => $certificacion->fecha_emision,
        ], 201);
    }

    // Ver detalle de certificación
    public function show($id)
    {
        $certificacion = Certificacion::findOrFail($id);
        $this->authorize('view', $certificacion);
        if ($certificacion->tipo_certificado === 'empresa') {
            return response()->json([
                'id_certificacion'   => $certificacion->id_certificacion,
                'id_usuario'         => $certificacion->id_usuario,
                'id_curso'           => $certificacion->id_curso,
                'fecha_emision'      => $certificacion->fecha_emision,
                'codigo_certificado' => $certificacion->codigo_certificado,
                'calificacion_final' => $certificacion->calificacion_final,
                'url_certificado'    => $certificacion->url_certificado,
                'tipo_certificado'   => $certificacion->tipo_certificado,
            ]);
        } else {
            return response()->json([
                'id_certificacion'   => $certificacion->id_certificacion,
                'codigo_certificado' => $certificacion->codigo_certificado,
                'nombre_estudiante'  => $certificacion->nombre_estudiante,
                'nombre_curso'       => $certificacion->nombre_curso,
                'fecha_inicio'       => $certificacion->fecha_inicio,
                'fecha_fin'          => $certificacion->fecha_fin,
                'total_horas'        => $certificacion->total_horas,
                'email_destinatario' => $certificacion->email_destinatario,
                'tipo_certificado'   => $certificacion->tipo_certificado,
                'fecha_emision'      => $certificacion->fecha_emision,
            ]);
        }
    }

    // Editar certificación (admin)
    public function update(\App\Http\Requests\CertificacionUpdateRequest $request, $id)
    {
        $certificacion = Certificacion::findOrFail($id);
        $this->authorize('update', $certificacion);
        // Si es empresa, rechazar antes de cualquier validación
        if ($certificacion->tipo_certificado === 'empresa') {
            return response()->json([
                'message' => 'Solo se pueden editar certificados adicionales.'
            ], 403);
        }
        // Solo si es adicional, validar y actualizar
        $certificacion->update($request->validated());
        // Respuesta personalizada solo para adicional
        return response()->json([
            'message' => 'Certificado adicional editado',
            'certificado' => [
                'id_certificacion'   => $certificacion->id_certificacion,
                'codigo_certificado' => $certificacion->codigo_certificado,
                'nombre_estudiante'  => $certificacion->nombre_estudiante,
                'nombre_curso'       => $certificacion->nombre_curso,
                'fecha_inicio'       => $certificacion->fecha_inicio,
                'fecha_fin'          => $certificacion->fecha_fin,
                'total_horas'        => $certificacion->total_horas,
                'email_destinatario' => $certificacion->email_destinatario,
                'tipo_certificado'   => $certificacion->tipo_certificado,
                'fecha_emision'      => $certificacion->fecha_emision,
            ]
        ]);
    }

    // Eliminar certificación (admin)
    public function destroy($id)
    {
        $certificacion = Certificacion::findOrFail($id);
        $this->authorize('delete', $certificacion);
        if ($certificacion->tipo_certificado !== 'adicional') {
            return response()->json([
                'message' => 'Solo se pueden eliminar certificados adicionales.'
            ], 403);
        }
        $certificacion->delete();
        return response()->json(['message' => 'Certificado adicional eliminado']);
    }

    // Buscar certificación por código de certificado o nombre (público, sin autenticación)
    public function buscarPorCodigo(Request $request)
    {
        $request->validate([
            'buscar' => 'required|string|min:2',
        ]);

        $buscar = $request->query('buscar');
        $palabras = array_filter(array_map('trim', explode(' ', trim($buscar))));

        $query = Certificacion::with(['usuario', 'curso']);

        // Buscar en código de certificado O en nombre completo (nombre_estudiante o nombre+apellido del usuario)
        $query->where(function ($q) use ($buscar, $palabras) {
            // Buscar en código (case-insensitive)
            $q->whereRaw('LOWER(codigo_certificado) LIKE ?', ['%' . strtolower($buscar) . '%']);
            
            // O buscar en nombre (requiere al menos 2 palabras para ser más específico)
            if (count($palabras) >= 2) {
                // Buscar en nombre_estudiante (certificados adicionales)
                $q->orWhere(function ($subQuery) use ($palabras) {
                    foreach ($palabras as $palabra) {
                        if (!empty($palabra)) {
                            $subQuery->whereRaw('LOWER(nombre_estudiante) LIKE ?', ['%' . strtolower($palabra) . '%']);
                        }
                    }
                });
                
                // O buscar en CONCAT(usuario.nombre, ' ', usuario.apellido) para certificados de empresa
                $q->orWhereHas('usuario', function ($subQuery) use ($palabras) {
                    foreach ($palabras as $palabra) {
                        if (!empty($palabra)) {
                            $subQuery->whereRaw("LOWER(CONCAT(nombre, ' ', apellido)) LIKE ?", ['%' . strtolower($palabra) . '%']);
                        }
                    }
                });
            }
        });

        $certificaciones = $query->get();

        if ($certificaciones->isEmpty()) {
            return response()->json([
                'message' => 'No se encontraron certificados con los criterios especificados.'
            ], 404);
        }

        // Retornar todos los campos de la tabla certificaciones
        $resultado = $certificaciones->map(function ($certificacion) {
            return [
                'id_certificacion' => $certificacion->id_certificacion,
                'id_usuario' => $certificacion->id_usuario,
                'id_curso' => $certificacion->id_curso,
                'fecha_emision' => $certificacion->fecha_emision,
                'codigo_certificado' => $certificacion->codigo_certificado,
                'calificacion_final' => $certificacion->calificacion_final,
                'url_certificado' => $certificacion->url_certificado,
                'tipo_certificado' => $certificacion->tipo_certificado,
                'nombre_curso' => $certificacion->nombre_curso,
                'nombre_estudiante' => $certificacion->nombre_estudiante,
                'fecha_inicio' => $certificacion->fecha_inicio,
                'fecha_fin' => $certificacion->fecha_fin,
                'total_horas' => $certificacion->total_horas,
                'email_destinatario' => $certificacion->email_destinatario,
                // Relaciones opcionales
                'usuario' => $certificacion->usuario,
                'curso' => $certificacion->curso,
            ];
        });

        return response()->json($resultado);
    }
}
