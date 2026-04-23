<?php

namespace App\Http\Controllers;

use App\Models\Certificacion;
use App\Services\CertificacionService;
use App\Mail\CertificacionMail;
use Illuminate\Support\Facades\Mail;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class CertificacionUsuarioController extends Controller
{
    // Listar certificaciones propias
    public function index(Request $request)
    {
        $usuario = Auth::user();
        $certificaciones = Certificacion::with('curso')
            ->where('id_usuario', $usuario->id_usuario)
            ->paginate(20);
        return response()->json($certificaciones);
    }

    // Enviar certificado por email al usuario autenticado
    public function enviarPorEmail($id, CertificacionService $certificacionService)
    {
        $usuario = Auth::user();
        $certificacion = Certificacion::with(['curso', 'usuario'])
            ->where('id_usuario', $usuario->id_usuario)
            ->findOrFail($id);

        // Generar PDF en memoria
        $pdfContent = $certificacionService->generarPDF($certificacion);

        // Enviar email con PDF adjunto
        Mail::to($usuario->email)->send(new CertificacionMail($certificacion, $pdfContent));

        return response()->json(['message' => 'Certificado enviado al correo electrónico']);
    }

    // Ver detalle de certificación propia
    public function show($id)
    {
        $usuario = Auth::user();
        $certificacion = Certificacion::with('curso')
            ->where('id_usuario', $usuario->id_usuario)
            ->findOrFail($id);
        return response()->json($certificacion);
    }


    public function solicitar(Request $request, CertificacionService $certificacionService)
    {
        $user = Auth::user();
        $idCurso = $request->input('id_curso');

        // Verifica inscripción y estado
        $inscripcion = \App\Models\Inscripcion::where('id_usuario', $user->id_usuario)
            ->where('id_curso', $idCurso)
            ->where('estado', 'Completado')
            ->first();

        if (!$inscripcion) {
            return response()->json(['message' => 'Debes completar el curso para solicitar el certificado.'], 403);
        }

        // Verifica progreso total (todas las lecciones completadas)
        if ($inscripcion->progreso_total < 100) {
            return response()->json(['message' => 'Debes completar todas las lecciones del curso.'], 403);
        }

        // Verifica evaluación final y puntaje
        $evaluacionFinal = \App\Models\Evaluacion::where('id_curso', $idCurso)
            ->where('tipo', 'final')
            ->first();

        if (!$evaluacionFinal) {
            return response()->json(['message' => 'No existe evaluación final registrada para este curso.'], 403);
        }

        $intento = \App\Models\IntentoEvaluacion::where('id_usuario', $user->id_usuario)
            ->where('id_evaluacion', $evaluacionFinal->id_evaluacion)
            ->orderByDesc('calificacion')
            ->first();

        if (!$intento || $intento->calificacion < $evaluacionFinal->puntuacion_requerida) {
            return response()->json(['message' => 'No alcanzaste la calificación mínima en la evaluación final.'], 403);
        }

        // Verifica si ya existe certificación
        $certificacion = \App\Models\Certificacion::where('id_usuario', $user->id_usuario)
            ->where('id_curso', $idCurso)
            ->first();

        if (!$certificacion) {
            $certificacion = \App\Models\Certificacion::create([
                'id_usuario' => $user->id_usuario,
                'id_curso' => $idCurso,
                'fecha_emision' => now(),
                'codigo_certificado' => uniqid('CERT-'),
                'calificacion_final' => $intento->calificacion,
            ]);
        }

        // Genera PDF y envía por correo
        $pdfContent = $certificacionService->generarPDF($certificacion);
        Mail::to($user->email)->send(new \App\Mail\CertificacionMail($certificacion, $pdfContent));

        return response()->json(['message' => 'Certificado enviado al correo electrónico']);
    }
    public function elegibilidad($idCurso)
    {
        $user = Auth::user();

        // Verifica inscripción y estado
        $inscripcion = \App\Models\Inscripcion::where('id_usuario', $user->id_usuario)
            ->where('id_curso', $idCurso)
            ->where('estado', 'Completado')
            ->first();

        if (!$inscripcion) {
            return response()->json([
                'elegible' => false,
                'motivo' => 'Debes completar el curso para solicitar el certificado.'
            ]);
        }

        // Verifica progreso total (todas las lecciones completadas)
        if ($inscripcion->progreso_total < 100) {
            return response()->json([
                'elegible' => false,
                'motivo' => 'Debes completar todas las lecciones del curso.'
            ]);
        }

        // Verifica evaluación final y puntaje
        $evaluacionFinal = \App\Models\Evaluacion::where('id_curso', $idCurso)
            ->where('tipo', 'final')
            ->first();

        if (!$evaluacionFinal) {
            return response()->json([
                'elegible' => false,
                'motivo' => 'No existe evaluación final registrada para este curso.'
            ]);
        }

        $intento = \App\Models\IntentoEvaluacion::where('id_usuario', $user->id_usuario)
            ->where('id_evaluacion', $evaluacionFinal->id_evaluacion)
            ->orderByDesc('calificacion')
            ->first();

        if (!$intento || $intento->calificacion < $evaluacionFinal->puntuacion_requerida) {
            return response()->json([
                'elegible' => false,
                'motivo' => 'No alcanzaste la calificación mínima en la evaluación final.'
            ]);
        }

        // Verifica si ya existe certificación
        $certificacion = \App\Models\Certificacion::where('id_usuario', $user->id_usuario)
            ->where('id_curso', $idCurso)
            ->first();

        return response()->json([
            'elegible' => true,
            'certificado_emitido' => (bool)$certificacion,
            'motivo' => $certificacion ? 'Ya tienes certificado emitido.' : 'Puedes solicitar tu certificado.'
        ]);
    }
    public function descargarPDF($idCurso, CertificacionService $certificacionService)
    {
        $user = Auth::user();
        $certificacion = \App\Models\Certificacion::where('id_usuario', $user->id_usuario)
            ->where('id_curso', $idCurso)
            ->first();

        if (!$certificacion) {
            return response()->json(['message' => 'No tienes certificado emitido para este curso.'], 404);
        }

        $pdfContent = $certificacionService->generarPDF($certificacion);

        return response($pdfContent, 200)
            ->header('Content-Type', 'application/pdf')
            ->header('Content-Disposition', 'inline; filename=\"certificado.pdf\"');
    }
}
