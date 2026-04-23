<?php

namespace App\Exceptions;

use Illuminate\Foundation\Exceptions\Handler as ExceptionHandler;
use Illuminate\Auth\Access\AuthorizationException;
use Throwable;
use Illuminate\Validation\ValidationException;
use Illuminate\Support\Facades\Log;


class Handler extends ExceptionHandler
{
    /**
     * Register the exception handling callbacks for the application.
     */
    public function register(): void
    {
        // ...existing code...
    }

    public function render($request, Throwable $exception)
    {
        Log::info('Handler render ejecutado. Excepción: ' . get_class($exception));
        $status = 400;
        if ($exception instanceof \Symfony\Component\HttpKernel\Exception\HttpException) {
            $status = $exception->getStatusCode();
        }
        if ($request->is('api/*') && ($exception instanceof \Symfony\Component\HttpKernel\Exception\HttpException && $exception->getStatusCode() === 403)) {
        Log::error('AuthorizationException atrapada en Handler: ' . $exception->getMessage());
            return response()->json([
            'message' => 'No estás autorizado para realizar esta acción.',
            'status' => 'error'
        ], 403);
    }
        return response()->json([
            'message' => $exception->getMessage(),
            'exception' => get_class($exception)
        ], $status);
    }

    /**
     * Forzar respuesta JSON en errores de validación para rutas API
     * y para cualquier petición, sin importar el header Accept.
     */
    protected function invalid($request, ValidationException $exception)
    {
        return response()->json([
            'message' => $exception->getMessage(),
            'errors' => $exception->errors(),
        ], $exception->status);
    }
        /**
         * Forzar respuesta JSON en errores de autenticación para APIs
         */
        protected function unauthenticated($request, \Illuminate\Auth\AuthenticationException $exception)
        {
            return response()->json([
                'message' => 'No autenticado. Por favor inicia sesión.',
                'status' => 'error'
            ], 401);
        }
    }
