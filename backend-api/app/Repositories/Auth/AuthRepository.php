<?php

namespace App\Repositories\Auth;

use App\Models\Usuario;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\DB;

class AuthRepository implements AuthRepositoryInterface
{
    public function register(array $data)
    {
        $data['password'] = Hash::make($data['password']);
        $data['email_verificado'] = false;
        $data['id_rol'] = $data['id_rol'] ?? 2;
    $data['estado'] = $data['estado'] ?? 'Activo';
        $data['fecha_registro'] = $data['fecha_registro'] ?? now();
        $data['ultimo_acceso'] = $data['ultimo_acceso'] ?? now();
        $data['dni'] = $data['dni'] ?? null;
        $data['telefono'] = $data['telefono'] ?? null;
        $data['imagen_perfil'] = $data['imagen_perfil'] ?? null;
        $data['biografia'] = $data['biografia'] ?? null;
        return Usuario::create($data);
    }

    public function findByEmail(string $email)
    {
        return Usuario::where('email', $email)->first();
    }

    public function findById(int $id)
    {
        return Usuario::find($id);
    }

    public function createVerificationToken($userId, $type = 'Verificacion')
    {
        $token = Str::random(64);
        DB::table('tokens_usuario')->insert([
            'id_usuario' => $userId,
            'token' => $token,
            'tipo' => $type,
            'fecha_creacion' => now(),
            'fecha_expiracion' => now()->addHours(24),
            'usado' => false
        ]);
        return $token;
    }

    public function markTokenAsUsed(string $token)
    {
        DB::table('tokens_usuario')->where('token', $token)->update(['usado' => true]);
    }

    public function findByVerificationToken(string $token)
    {
        return DB::table('tokens_usuario')->where('token', $token)->where('usado', false)->first();
    }

    public function createResetToken($userId)
    {
        $token = \Illuminate\Support\Str::random(64);
        \Illuminate\Support\Facades\DB::table('tokens_usuario')->insert([
            'id_usuario' => $userId,
            'token' => $token,
            'tipo' => 'Reseteo',
            'fecha_creacion' => now(),
            'fecha_expiracion' => now()->addHours(2),
            'usado' => false
        ]);
        return $token;
    }

    public function findValidResetToken(string $token)
    {
        return \Illuminate\Support\Facades\DB::table('tokens_usuario')
            ->where('token', $token)
            ->where('tipo', 'Reseteo')
            ->where('usado', false)
            ->where('fecha_expiracion', '>', now())
            ->first();
    }

    public function updateUserPassword($userId, $newPassword)
    {
        $user = \App\Models\Usuario::find($userId);
        if ($user) {
            $user->password = \Illuminate\Support\Facades\Hash::make($newPassword);
            $user->save();
            return true;
        }
        return false;
    }
}
