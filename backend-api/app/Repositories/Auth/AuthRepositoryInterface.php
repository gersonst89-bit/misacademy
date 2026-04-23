<?php

namespace App\Repositories\Auth;

interface AuthRepositoryInterface
{
    public function register(array $data);
    public function findByEmail(string $email);
    public function findById(int $id);
    public function createVerificationToken($userId, $type = 'Verificacion');
    public function markTokenAsUsed(string $token);
    public function findByVerificationToken(string $token);
    // Métodos para recuperación de contraseña
    public function createResetToken($userId);
    public function findValidResetToken(string $token);
    public function updateUserPassword($userId, $newPassword);
}
