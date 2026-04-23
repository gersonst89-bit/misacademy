<?php

namespace App\Services\Contracts;

interface VideoAuditServiceInterface
{
    public function registrarAcceso(int $userId, int $lessonId, string $ip): void;
    public function registrarEvento(int $userId, int $lessonId, string $evento, array $data = []): void;
}
