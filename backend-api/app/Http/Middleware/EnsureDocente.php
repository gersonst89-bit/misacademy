<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class EnsureDocente
{
    public function handle(Request $request, Closure $next): Response
    {
        $user = $request->user();
        if (!$user || !$user->relationLoaded('rol')) {
            $user->load('rol');
        }
        if (!$user || !$user->rol || strtolower($user->rol->nombre_rol) !== 'docente') {
            return response()->json(['message' => 'No autorizado.'], 403);
        }
        return $next($request);
    }
}
