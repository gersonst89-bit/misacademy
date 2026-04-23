<?php

namespace App\Services;

use App\Services\Contracts\VideoAuditServiceInterface;
use Illuminate\Support\Facades\Log;

class VideoAuditService implements VideoAuditServiceInterface
{
    public function __construct()
    {
        // Puede inicializar recursos de auditoría si es necesario
    }

    public function registrarAcceso(int $userId, int $lessonId, string $ip): void
    {
        Log::channel('video_audit')->info('Acceso a video', [
            'user_id' => $userId,
            'lesson_id' => $lessonId,
            'ip' => $ip,
            'timestamp' => now()->toDateTimeString(),
        ]);
    }

    public function registrarEvento(int $userId, int $lessonId, string $evento, array $data = []): void
    {
        Log::channel('video_audit')->info('Evento de video', [
            'user_id' => $userId,
            'lesson_id' => $lessonId,
            'evento' => $evento,
            'data' => $data,
            'timestamp' => now()->toDateTimeString(),
        ]);
    }
}
