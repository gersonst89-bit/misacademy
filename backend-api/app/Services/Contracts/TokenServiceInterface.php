<?php

namespace App\Services\Contracts;

interface TokenServiceInterface
{
    public function generarToken(int $userId, int $lessonId, array $extra = []): string;
    public function validarToken(string $token): bool;
    /**
     * Retorna la expiración del token en segundos
     */
    public function getExpiracionSegundos(): int;
}
