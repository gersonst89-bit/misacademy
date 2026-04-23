<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Log;
use App\Services\Contracts\VideoAuditServiceInterface;
use Illuminate\Support\Facades\Auth;

class VideoSessionController extends Controller
{
    protected $videoAuditService;

    public function __construct(VideoAuditServiceInterface $videoAuditService)
    {
        $this->videoAuditService = $videoAuditService;
    }

    /**
     * Heartbeat de sesión de video (cada 2 minutos)
     * Valida sesión, fingerprint y registra auditoría
     */
    public function heartbeat(Request $request)
    {
        $user = Auth::user();
        $sessionId = $request->input('session_id');
        $lessonId = $request->input('lesson_id');
        $currentTime = $request->input('current_time');
        $timestamp = $request->input('timestamp');
        $fingerprint = $request->input('fingerprint');

        // 1. Verificar sesión existe en cache
        $sessionKey = 'session:' . $sessionId;
        $session = Cache::get($sessionKey);
        if (!$session) {
            return response()->json(['message' => 'Sesión no encontrada'], 401);
        }

        // 2. Verificar no fue revocada
        if (Cache::has('revoked:' . $sessionId)) {
            return response()->json(['message' => 'Sesión revocada'], 403);
        }

        // 3. Verificar fingerprint
        if ($fingerprint !== $session['fingerprint']) {
            $this->videoAuditService->registrarEvento($user->id_usuario, $lessonId, 'fingerprint_mismatch', [
                'session_id' => $sessionId,
                'fingerprint_actual' => $fingerprint,
                'fingerprint_guardado' => $session['fingerprint'],
            ]);
            Cache::put('revoked:' . $sessionId, true, now()->addHours(1));
            return response()->json(['message' => 'Fingerprint inválido, sesión revocada'], 403);
        }

        // 4. Actualizar timestamp de última actividad
        $session['last_activity'] = now()->timestamp;
        Cache::put($sessionKey, $session, now()->addHours(2));

        // 5. Registrar actividad en auditoría
        $this->videoAuditService->registrarEvento($user->id_usuario, $lessonId, 'heartbeat', [
            'session_id' => $sessionId,
            'current_time' => $currentTime,
            'timestamp' => $timestamp,
        ]);

        return response()->json(['message' => 'Sesión válida'], 200);
    }
}
