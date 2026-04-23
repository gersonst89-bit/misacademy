<?php

namespace App\Services\Auth;

use App\Repositories\Auth\AuthRepositoryInterface;

class AuthService
{
    protected $authRepository;

    public function __construct(AuthRepositoryInterface $authRepository)
    {
        $this->authRepository = $authRepository;
    }

    // Ejemplo de método para registro
    public function register(array $data)
    {
        // Validación y lógica de negocio pueden ir aquí
        $user = $this->authRepository->register($data);
        $token = $this->authRepository->createVerificationToken($user->id_usuario);
        // Aquí se podría disparar el envío de email
        return [$user, $token];
    }

    // Métodos para login, logout, verificación, etc. se agregarán aquí

    public function getUserByEmail(string $email)
    {
        return $this->authRepository->findByEmail($email);
    }

    public function forgotPassword(string $email)
    {
        $user = $this->authRepository->findByEmail($email);
        if (!$user) {
            return [null, null];
        }
        $token = $this->authRepository->createResetToken($user->id_usuario);
        return [$user, $token];
    }

    public function resetPassword(string $token, string $email, string $password)
    {
        $tokenData = $this->authRepository->findValidResetToken($token);
        if (!$tokenData) {
            return [false, 'Token inválido o expirado'];
        }
        $user = $this->authRepository->findById($tokenData->id_usuario);
        if (!$user || $user->email !== $email) {
            return [false, 'Usuario no coincide con el token'];
        }
        $this->authRepository->updateUserPassword($user->id_usuario, $password);
        $this->authRepository->markTokenAsUsed($token);
        return [true, 'Contraseña actualizada correctamente'];
    }
}
