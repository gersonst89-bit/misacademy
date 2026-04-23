<?php

namespace App\Services\Contracts;

interface EncryptionServiceInterface
{
    public function encriptarVideoID(string $videoId): string;
    public function desencriptarVideoID(string $encrypted): string;
}
