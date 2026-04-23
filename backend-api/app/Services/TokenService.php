<?php

namespace App\Services;

use App\Services\Contracts\TokenServiceInterface;
use Illuminate\Support\Facades\Config;

class TokenService implements TokenServiceInterface
{
    private $secret_key;
    private $expiracion_segundos;

    public function __construct()
    {
        // Leer desde config, con fallback manual del .env para producción
        $this->secret_key = Config::get('app.video_jwt_secret', env('VIDEO_JWT_SECRET'));
        $this->expiracion_segundos = Config::get('app.video_token_ttl', env('VIDEO_TOKEN_TTL', 3600));
        
        // Si config está vacío (por caché), leer manualmente del .env
        if (!$this->secret_key) {
            $envPath = base_path('.env');
            if (file_exists($envPath)) {
                $envContent = file_get_contents($envPath);
                if (preg_match('/^VIDEO_JWT_SECRET=(.*)$/m', $envContent, $matches)) {
                    $this->secret_key = trim($matches[1]);
                }
            }
        }
        
        if (!$this->secret_key || strlen($this->secret_key) < 32) {
            throw new \Exception('Clave secreta JWT de video inválida o no configurada');
        }
    }

    public function generarToken(int $userId, int $lessonId, array $extra = []): string
    {
        $header = [
            'alg' => 'HS256',
            'typ' => 'JWT'
        ];
        $payload = array_merge([
            'sub' => $userId,
            'lesson_id' => $lessonId,
            'iat' => time(),
            'exp' => time() + $this->expiracion_segundos,
        ], $extra);
        $base64UrlHeader = rtrim(strtr(base64_encode(json_encode($header)), '+/', '-_'), '=');
        $base64UrlPayload = rtrim(strtr(base64_encode(json_encode($payload)), '+/', '-_'), '=');
        $signature = hash_hmac('sha256', $base64UrlHeader . "." . $base64UrlPayload, $this->secret_key, true);
        $base64UrlSignature = rtrim(strtr(base64_encode($signature), '+/', '-_'), '=');
        return $base64UrlHeader . "." . $base64UrlPayload . "." . $base64UrlSignature;
    }

    public function validarToken(string $token): bool
    {
        $parts = explode('.', $token);
        if (count($parts) !== 3) return false;
        list($base64UrlHeader, $base64UrlPayload, $base64UrlSignature) = $parts;
        $header = json_decode(base64_decode(strtr($base64UrlHeader, '-_', '+/')), true);
        $payload = json_decode(base64_decode(strtr($base64UrlPayload, '-_', '+/')), true);
        $signature = base64_decode(strtr($base64UrlSignature, '-_', '+/'));
        $validSignature = hash_hmac('sha256', $base64UrlHeader . "." . $base64UrlPayload, $this->secret_key, true);
        if (!hash_equals($validSignature, $signature)) return false;
        if (!isset($payload['exp']) || time() > $payload['exp']) return false;
        return true;
    }

    public function getExpiracionSegundos(): int
    {
        return $this->expiracion_segundos;
    }
}
