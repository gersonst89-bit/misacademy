<?php

use Illuminate\Auth\Access\AuthorizationException;
use Illuminate\Support\Facades\Log;
use Symfony\Component\HttpKernel\Exception\HttpException;
return function ($exceptions) {
    $exceptions->render(function (HttpException $e, $request) {
        if ($request->is('api/*') && $e->getStatusCode() === 403) {
            Log::info('ApiExceptionHandlers ejecutado para HttpException 403');
            return response()->json([
                'message' => 'No estás autorizado para realizar esta acción.',
                'status' => 'error'
            ], 403);
        }
    });
};