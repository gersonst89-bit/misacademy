<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;
use App\Models\Leccion;
use App\Services\Contracts\EncryptionServiceInterface;
use App\Services\Contracts\TokenServiceInterface;
use App\Services\Contracts\VideoAuditServiceInterface;

class VideoTokenController extends Controller
{
    protected $encryptionService;
    protected $tokenService;
    protected $videoAuditService;

    public function __construct(
        EncryptionServiceInterface $encryptionService,
        TokenServiceInterface $tokenService,
        VideoAuditServiceInterface $videoAuditService
    ) {
        $this->encryptionService = $encryptionService;
        $this->tokenService = $tokenService;
        $this->videoAuditService = $videoAuditService;
    }
    /**
     * Endpoint seguro para entregar token y video_id encriptado
     */
    public function getVideoToken($id, Request $request)
    {
        // 1. Validar usuario autenticado
        $user = Auth::user();
        if (!$user) {
            return response()->json(['error' => 'No autenticado'], 401);
        }

        // 2. Validar inscripción y permisos reales
        $leccion = Leccion::find($id);
        if (!$leccion) {
            return response()->json(['error' => 'Lección no encontrada'], 404);
        }

        // Obtener el id_curso por la relación modulo
        $idCurso = $leccion->modulo ? $leccion->modulo->id_curso : null;
        if (!$idCurso) {
            return response()->json(['error' => 'No se pudo determinar el curso de la lección'], 404);
        }

        // Validar inscripción activa en el curso de la lección
        $inscripcion = \App\Models\Inscripcion::where('id_usuario', $user->id_usuario)
            ->where('id_curso', $idCurso)
            ->whereIn('estado', ['Activo', 'Completado'])
            ->first();
        if (!$inscripcion) {
            return response()->json(['error' => 'No tienes inscripción activa en el curso'], 403);
        }

        // Validar pago completado del curso
        $pagoCompletado = \App\Models\DetallePago::whereHas('pago', function ($q) use ($user) {
            $q->where('id_usuario', $user->id_usuario)
              ->where('estado', 'Completado');
        })->where('id_curso', $idCurso)->exists();
        if (!$pagoCompletado) {
            return response()->json(['error' => 'No tienes pago completado para este curso'], 403);
        }

        // 3. Obtener video_id (YouTube)
        $videoUrl = $leccion->url_video;
        $videoId = self::extraerVideoIdDeURL($videoUrl);
        if (!$videoId) {
            return response()->json(['error' => 'Video no disponible'], 404);
        }

        // 4. Encriptar video_id
        $encryptedVideoId = $this->encryptionService->encriptarVideoID($videoId);

        // 5. Generar JWT temporal para sesión de video
        $accessToken = $this->tokenService->generarToken($user->id_usuario, $leccion->id_leccion, [
            'video_id' => $videoId
        ]);

        // 5.1 Crear sesión de video en caché (para heartbeat)
        $sessionId = 'vs_' . bin2hex(random_bytes(8));
        $fingerprint = $request->input('fingerprint') ?? 'default';
        $sessionData = [
            'user_id' => $user->id_usuario,
            'lesson_id' => $leccion->id_leccion,
            'fingerprint' => $fingerprint,
            'created_at' => now()->timestamp,
            'last_activity' => now()->timestamp,
        ];
        \Illuminate\Support\Facades\Cache::put('session:' . $sessionId, $sessionData, now()->addHours(2));

        // 6. Registrar acceso en auditoría
        $this->videoAuditService->registrarAcceso($user->id_usuario, $leccion->id_leccion, $request->ip());

        // 7. Configuración del reproductor
        $playerConfig = [
            'type' => 'videojs',
            'controls' => ['play', 'pause', 'seek', 'volume'],
            'protection' => [
                'watermark' => [
                    'text' => substr($user->email, 0, 3) . '***@***.com',
                    'position' => 'bottom-right',
                    'opacity' => 0.3
                ],
                'disableRightClick' => true,
                'detectDevTools' => true
            ]
        ];

        // 8. Responder con token, video encriptado, config y session_id
        return response()->json([
            'access_token' => $accessToken,
            'encrypted_video_id' => $encryptedVideoId,
            'player_config' => $playerConfig,
            'expires_in' => $this->tokenService->getExpiracionSegundos(),
            'session_id' => $sessionId
        ]);
    }

    /**
     * Extrae el videoId de una URL de YouTube
     */
    public static function extraerVideoIdDeURL($url)
    {
        if (strpos($url, 'youtube.com/watch') !== false) {
            $parts = explode('v=', $url);
            return isset($parts[1]) ? explode('&', $parts[1])[0] : '';
        }
        if (strpos($url, 'youtu.be/') !== false) {
            $parts = explode('youtu.be/', $url);
            return isset($parts[1]) ? explode('?', $parts[1])[0] : '';
        }
        if (strpos($url, 'youtube.com/embed/') !== false) {
            $parts = explode('embed/', $url);
            return isset($parts[1]) ? explode('?', $parts[1])[0] : '';
        }
        return $url;
    }
}
