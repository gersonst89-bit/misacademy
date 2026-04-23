<?php
namespace App\Constants;

class TrackingVideo
{
    public const UMBRAL_COMPLETACION = 90.00;
    public const MODO_NAVEGACION = 'lineal';
    public const ADELANTO_MAXIMO_NORMAL = 10; // Si heartbeat es cada 8s, máximo normal sería ~10s
    public const HEARTBEAT_FRECUENCIA = 8; // Ajustado a tu frecuencia real
    public const HEARTBEAT_DIFERENCIA_MINIMA = 7; // 8s - 1s de tolerancia
    public const HEARTBEAT_DIFERENCIA_MAXIMA = 9; // 8s + 1s de tolerancia
}
