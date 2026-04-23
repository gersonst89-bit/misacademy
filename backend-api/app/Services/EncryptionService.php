<?php

namespace App\Services;

use App\Services\Contracts\EncryptionServiceInterface;
use Illuminate\Support\Facades\Config;

class EncryptionService implements EncryptionServiceInterface
{
    private $clave_maestra;
    private $algoritmo = 'AES-256-CBC';

    public function __construct()
    {
        // Leer directamente del archivo .env como fallback para producción
        $this->clave_maestra = config('app.video_encryption_key');
        
        // Si config está vacío (por caché), leer manualmente del .env
        if (!$this->clave_maestra) {
            $envPath = base_path('.env');
            if (file_exists($envPath)) {
                $envContent = file_get_contents($envPath);
                if (preg_match('/^VIDEO_ENCRYPTION_KEY=(.*)$/m', $envContent, $matches)) {
                    $this->clave_maestra = trim($matches[1]);
                }
            }
        }
        
        file_put_contents(storage_path('logs/encryption_debug.log'), 'FINAL KEY: [' . $this->clave_maestra . '] Length: ' . strlen($this->clave_maestra ?? '') . PHP_EOL, FILE_APPEND);
        if (!$this->clave_maestra || strlen($this->clave_maestra) < 32) {
            throw new \Exception('Clave de encriptación de video inválida o no configurada');
        }
    }

    public function encriptarVideoID(string $videoId): string
    {
        $iv = random_bytes(openssl_cipher_iv_length($this->algoritmo));
        $valor_encriptado = openssl_encrypt($videoId, $this->algoritmo, $this->clave_maestra, 0, $iv);
        $payload = [
            'iv' => base64_encode($iv),
            'value' => $valor_encriptado,
        ];
        return base64_encode(json_encode($payload));
    }

    public function desencriptarVideoID(string $encrypted): string
    {
        $payload = json_decode(base64_decode($encrypted), true);
        if (!isset($payload['iv'], $payload['value'])) {
            throw new \Exception('Datos de video encriptado corruptos');
        }
        $iv = base64_decode($payload['iv']);
        $valor_encriptado = $payload['value'];
        $videoId = openssl_decrypt($valor_encriptado, $this->algoritmo, $this->clave_maestra, 0, $iv);
        if ($videoId === false) {
            throw new \Exception('No se pudo desencriptar el videoId');
        }
        return $videoId;
    }
}
